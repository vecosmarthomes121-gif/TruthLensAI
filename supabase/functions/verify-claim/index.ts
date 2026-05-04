
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface VerifyRequest {
  claim: string;
  inputType: 'text' | 'url' | 'image' | 'video';
  mediaUrl?: string;
}

interface Source {
  id: string;
  name: string;
  url: string;
  credibilityScore: number;
  publishedDate: string;
  excerpt: string;
  stance: 'supports' | 'contradicts' | 'neutral';
  imageUrl?: string;
}

interface VerificationResult {
  truthScore: number;
  status: 'true' | 'mostly-true' | 'disputed' | 'mostly-false' | 'false';
  explanation: string;
  sources: Source[];
  relatedClaims: Array<{ claim: string; truthScore: number; status: string }>;
  contentAnalysis?: any;
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  source?: string;
}

// ── Helper: fetch media and convert to base64 ────────────────────────────────
async function fetchAsBase64(url: string): Promise<{ base64: string; mimeType: string; buffer: ArrayBuffer } | null> {
  try {
    console.log('Fetching as base64:', url.substring(0, 80));
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TruthLensBot/1.0)' },
    });
    if (!response.ok) {
      console.error('Fetch failed:', response.status);
      return null;
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const mimeType = contentType.split(';')[0].trim();
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    console.log(`Fetched as base64: ${Math.round(buffer.byteLength / 1024)}KB, ${mimeType}`);
    return { base64, mimeType, buffer };
  } catch (err) {
    console.error('fetchAsBase64 error:', err);
    return null;
  }
}

// ── Helper: run Serper search with key rotation ──────────────────────────────
async function serperSearch(
  query: string,
  keys: string[],
  type: 'search' | 'images' | 'news' = 'search',
  num = 10
): Promise<any> {
  const endpoint =
    type === 'images'
      ? 'https://google.serper.dev/images'
      : type === 'news'
      ? 'https://google.serper.dev/news'
      : 'https://google.serper.dev/search';

  for (let i = 0; i < keys.length; i++) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'X-API-KEY': keys[i], 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, num, gl: 'us', hl: 'en' }),
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`Serper ${type} OK (key ${i + 1})`);
        return data;
      }
      console.warn(`Serper key ${i + 1} returned ${res.status}`);
    } catch (err) {
      console.error(`Serper key ${i + 1} error:`, err);
    }
  }
  return null;
}

// ── Helper: call OnSpace AI ──────────────────────────────────────────────────
async function callAI(
  apiKey: string,
  baseUrl: string,
  messages: any[],
  temperature = 0.3
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages,
      temperature,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI request failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ── Helper: parse JSON from AI response ──────────────────────────────────────
function parseJSON(content: string): any {
  const cleaned = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  return JSON.parse(cleaned);
}

// ── Detection API: BitMind ────────────────────────────────────────────────────
async function callBitMind(imageBuffer: ArrayBuffer, mimeType: string): Promise<{ isFake: boolean; confidence: number; status: 'ok' | 'unavailable' }> {
  const apiKey = Deno.env.get('BITMIND_API_KEY');
  if (!apiKey) return { isFake: false, confidence: 0, status: 'unavailable' };

  try {
    const formData = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    formData.append('file', blob, `image.${mimeType.split('/')[1] || 'jpg'}`);

    const res = await fetch('https://api.bitmind.ai/oracle/v1/detect', {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('BitMind API error:', res.status, errText.substring(0, 200));
      return { isFake: false, confidence: 0, status: 'unavailable' };
    }

    const data = await res.json();
    console.log('BitMind response:', JSON.stringify(data).substring(0, 200));

    // Handle different response shapes
    const isFake = data.is_fake ?? data.fake ?? data.result === 'fake' ?? false;
    const confidence = Math.round((data.confidence ?? data.score ?? 0) * 100);
    return { isFake: Boolean(isFake), confidence, status: 'ok' };
  } catch (err) {
    console.error('BitMind call error:', err);
    return { isFake: false, confidence: 0, status: 'unavailable' };
  }
}

// ── Detection API: SightEngine ───────────────────────────────────────────────
async function callSightEngine(imageUrl: string): Promise<{ deepfakeScore: number; aiGeneratedScore: number; status: 'ok' | 'unavailable' }> {
  const apiUser = Deno.env.get('SIGHTENGINE_API_USER');
  const apiSecret = Deno.env.get('SIGHTENGINE_API_SECRET');
  if (!apiUser || !apiSecret) return { deepfakeScore: 0, aiGeneratedScore: 0, status: 'unavailable' };

  try {
    const params = new URLSearchParams({
      url: imageUrl,
      models: 'deepfake,ai-generated',
      api_user: apiUser,
      api_secret: apiSecret,
    });

    const res = await fetch(`https://api.sightengine.com/1.0/check.json?${params.toString()}`, {
      method: 'GET',
    });

    if (!res.ok) {
      console.warn('SightEngine API error:', res.status);
      return { deepfakeScore: 0, aiGeneratedScore: 0, status: 'unavailable' };
    }

    const data = await res.json();
    console.log('SightEngine response:', JSON.stringify(data).substring(0, 300));

    if (data.status === 'failure') {
      console.warn('SightEngine failure:', data.error?.message);
      return { deepfakeScore: 0, aiGeneratedScore: 0, status: 'unavailable' };
    }

    const deepfakeScore = Math.round((data.deepfake?.score ?? 0) * 100);
    const aiGeneratedScore = Math.round((data.ai_generated?.score ?? 0) * 100);
    return { deepfakeScore, aiGeneratedScore, status: 'ok' };
  } catch (err) {
    console.error('SightEngine call error:', err);
    return { deepfakeScore: 0, aiGeneratedScore: 0, status: 'unavailable' };
  }
}

// ── Detection API: Reality Defender ─────────────────────────────────────────
async function callRealityDefender(imageUrl: string): Promise<{ result: 'FAKE' | 'REAL' | 'UNCERTAIN' | 'UNAVAILABLE'; confidence: number; status: 'ok' | 'unavailable' }> {
  const apiKey = Deno.env.get('REALITY_DEFENDER_API_KEY');
  if (!apiKey) return { result: 'UNAVAILABLE', confidence: 0, status: 'unavailable' };

  try {
    const res = await fetch('https://api.realitydefender.com/api/files/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Reality Defender upload error:', res.status, errText.substring(0, 200));
      return { result: 'UNAVAILABLE', confidence: 0, status: 'unavailable' };
    }

    const uploadData = await res.json();
    console.log('Reality Defender upload response:', JSON.stringify(uploadData).substring(0, 300));

    // Reality Defender returns async results — try to get result from upload response
    // or use request_id to poll
    const requestId = uploadData.request_id ?? uploadData.id ?? null;

    if (!requestId) {
      // Some responses include result directly
      if (uploadData.result || uploadData.prediction) {
        const raw = (uploadData.result ?? uploadData.prediction ?? 'UNCERTAIN').toUpperCase();
        const rdResult = raw === 'FAKE' ? 'FAKE' : raw === 'REAL' ? 'REAL' : 'UNCERTAIN';
        const confidence = Math.round((uploadData.confidence ?? uploadData.score ?? 0.5) * 100);
        return { result: rdResult as any, confidence, status: 'ok' };
      }
      return { result: 'UNCERTAIN', confidence: 0, status: 'unavailable' };
    }

    // Poll for result (max 3 attempts, 2s apart)
    for (let attempt = 0; attempt < 3; attempt++) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const pollRes = await fetch(`https://api.realitydefender.com/api/files/${requestId}`, {
          headers: { 'Authorization': `Bearer ${apiKey}` },
        });
        if (pollRes.ok) {
          const pollData = await pollRes.json();
          console.log(`RD poll attempt ${attempt + 1}:`, JSON.stringify(pollData).substring(0, 200));
          const status = pollData.status ?? pollData.state ?? '';
          if (status === 'complete' || status === 'completed' || status === 'done' || pollData.result) {
            const raw = (pollData.result ?? pollData.prediction ?? 'UNCERTAIN').toUpperCase();
            const rdResult = raw === 'FAKE' ? 'FAKE' : raw === 'REAL' ? 'REAL' : 'UNCERTAIN';
            const confidence = Math.round((pollData.confidence ?? pollData.score ?? 0.5) * 100);
            return { result: rdResult as any, confidence, status: 'ok' };
          }
        }
      } catch (pollErr) {
        console.error('RD poll error:', pollErr);
      }
    }

    return { result: 'UNCERTAIN', confidence: 0, status: 'unavailable' };
  } catch (err) {
    console.error('Reality Defender call error:', err);
    return { result: 'UNAVAILABLE', confidence: 0, status: 'unavailable' };
  }
}

// ── Suspicion score calculator ───────────────────────────────────────────────
function calculateSuspicionScore(params: {
  bitmind: { isFake: boolean; confidence: number; status: string };
  sightengine: { deepfakeScore: number; aiGeneratedScore: number; status: string };
  realitydefender: { result: string; confidence: number; status: string };
  aiAnalysis: any;
}): { score: number; verdict: string; confidence: 'LOW' | 'MEDIUM' | 'HIGH'; recommendation: string; signals: string[] } {
  let score = 0;
  const signals: string[] = [];

  // BITMIND scoring
  if (params.bitmind.status === 'ok') {
    if (params.bitmind.isFake && params.bitmind.confidence >= 80) {
      score += 35;
      signals.push(`BitMind: HIGH CONFIDENCE FAKE — ${params.bitmind.confidence}% confidence`);
    } else if (params.bitmind.isFake && params.bitmind.confidence >= 50) {
      score += 20;
      signals.push(`BitMind: MODERATE SUSPICION — ${params.bitmind.confidence}% confidence`);
    } else {
      signals.push(`BitMind: Likely authentic — ${params.bitmind.confidence}% fake confidence`);
    }
  } else {
    signals.push('BitMind: UNAVAILABLE');
  }

  // SIGHTENGINE scoring
  if (params.sightengine.status === 'ok') {
    if (params.sightengine.deepfakeScore >= 70 || params.sightengine.aiGeneratedScore >= 70) {
      score += 20;
      signals.push(`SightEngine: deepfake=${params.sightengine.deepfakeScore}%, AI-generated=${params.sightengine.aiGeneratedScore}%`);
    } else {
      signals.push(`SightEngine: deepfake=${params.sightengine.deepfakeScore}%, AI-generated=${params.sightengine.aiGeneratedScore}%`);
    }
  } else {
    signals.push('SightEngine: UNAVAILABLE');
  }

  // REALITY DEFENDER scoring
  if (params.realitydefender.status === 'ok') {
    if (params.realitydefender.result === 'FAKE' && params.realitydefender.confidence >= 75) {
      score += 20;
      signals.push(`Reality Defender: FAKE — ${params.realitydefender.confidence}% confidence`);
    } else {
      signals.push(`Reality Defender: ${params.realitydefender.result} — ${params.realitydefender.confidence}% confidence`);
    }
  } else {
    signals.push('Reality Defender: UNAVAILABLE');
  }

  // AI forensic analysis scoring
  const ai = params.aiAnalysis;
  if (ai) {
    if (ai.deepfakeDetected && ai.deepfakeConfidence >= 70) {
      score += 15;
      signals.push(`AI Forensics: Deepfake detected (${ai.deepfakeConfidence}% confidence) — ${ai.deepfakeType}`);
    } else if (ai.isAiGenerated && ai.aiGenerationConfidence >= 70) {
      score += 12;
      signals.push(`AI Forensics: AI-generated image detected (${ai.aiGenerationConfidence}% confidence)`);
    } else if (ai.manipulationDetected) {
      score += 10;
      signals.push(`AI Forensics: Manipulation detected — ${ai.manipulationDetails}`);
    }

    // Facial anomalies
    const facialCount = (ai.facialAnomalies || []).length;
    if (facialCount > 0) {
      const faceScore = Math.min(facialCount * 3, 12);
      score += faceScore;
      signals.push(`AI Forensics: ${facialCount} facial anomaly/anomalies detected`);
    }
  }

  // Cap at 100
  score = Math.min(score, 100);

  let verdict: string;
  let recommendation: string;
  if (score <= 24) {
    verdict = 'LIKELY AUTHENTIC';
    recommendation = 'Image shows no significant manipulation signals.';
  } else if (score <= 49) {
    verdict = 'INCONCLUSIVE';
    recommendation = 'Mixed signals detected. Do not rely on this image alone.';
  } else if (score <= 74) {
    verdict = 'LIKELY MANIPULATED OR AI-GENERATED';
    recommendation = 'Significant manipulation indicators present. Verify independently.';
  } else {
    verdict = 'HIGH CONFIDENCE FAKE';
    recommendation = 'Do not trust this image. High probability of AI generation or deepfake.';
  }

  // Active APIs used
  const activeApis = [
    params.bitmind.status === 'ok',
    params.sightengine.status === 'ok',
    params.realitydefender.status === 'ok',
  ].filter(Boolean).length;

  const confidence: 'LOW' | 'MEDIUM' | 'HIGH' =
    activeApis >= 2 ? 'HIGH' : activeApis === 1 ? 'MEDIUM' : 'LOW';

  return { score, verdict, confidence, recommendation, signals };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { claim, inputType, mediaUrl }: VerifyRequest = await req.json();
    console.log('=== verify-claim start ===', { inputType, claim: claim?.substring(0, 80) });

    if (!claim || !inputType) {
      return new Response(
        JSON.stringify({ error: 'claim and inputType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiApiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const aiBaseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');
    const serperKeys = [
      Deno.env.get('SERPER_API_KEY'),
      Deno.env.get('SERPER_API_KEY_2'),
      Deno.env.get('SERPER_API_KEY_3'),
    ].filter(Boolean) as string[];

    if (!aiApiKey || !aiBaseUrl) throw new Error('OnSpace AI configuration missing');
    if (serperKeys.length === 0) throw new Error('No Serper API keys configured');

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let contentAnalysis: any = null;
    let analyzedClaim = claim;

    // ════════════════════════════════════════════════════════════════
    // STEP A: IMAGE DEEPFAKE DETECTION (multi-engine)
    // ════════════════════════════════════════════════════════════════
    if (inputType === 'image') {
      const imageUrl = mediaUrl || claim;
      console.log('--- IMAGE DEEPFAKE DETECTION (multi-engine) ---');

      // Fetch image data once, reuse for all APIs
      const imageData = await fetchAsBase64(imageUrl);

      const imagePrompt = `You are an expert forensic media analyst and deepfake detection specialist. Today is ${currentDate}.

PRIMARY MISSION: Detect if this image is a DEEPFAKE, AI-GENERATED, or MANIPULATED to spread misinformation.

FORENSIC CHECKS — examine each carefully:

1. DEEPFAKE INDICATORS
   - Face-swap artifacts: boundary seams around faces, mismatched skin tones, blurred hair edges
   - Facial geometry: asymmetry anomalies, impossible bone structure, ear/nose distortion
   - Eye reflections pointing in different directions (inconsistent light source)
   - Skin texture repeating in a tiled pattern (AI tiling artifact)
   - Hair edges that are too smooth or blend into background unnaturally
   - Ear asymmetry that is extreme or unnatural
   - Teeth that are too uniform, too white, or perfectly symmetrical

2. AI GENERATION TELLS (Stable Diffusion, DALL-E, Midjourney, GAN, Firefly, ComfyUI)
   - Extra or missing fingers/limbs
   - Warped or illegible text
   - Unnatural background repetition or bleeding
   - Overly smooth skin / plastic-looking texture
   - Impossible lighting (multiple contradictory shadow directions)
   - Objects merging unnaturally

3. ELA INTERPRETATION
   - Would ELA show uniform error levels across face+background+edges? (AI-generated indicator)
   - Would ELA show patchy high-error regions on faces but low-error backgrounds? (spliced/composited)
   - Does it look like normal varied compression? (authentic)

4. PHOTO MANIPULATION
   - Clone-stamp regions (copy-paste areas)
   - Compositing artifacts (edge haloing, lighting mismatch)
   - Perspective inconsistencies
   - Selective JPEG compression artifacts

5. CONTEXT MISREPRESENTATION
   - Real image used out of context
   - Cropped to remove context

Provide a short descriptive name (max 8 words) of what you see.

Return ONLY valid JSON (no markdown):
{
  "imageName": "<short descriptive name>",
  "overallVerdict": "<AUTHENTIC|AI-GENERATED|DEEPFAKE|MANIPULATED|UNCERTAIN>",
  "deepfakeDetected": <true|false>,
  "deepfakeConfidence": <0-100>,
  "deepfakeType": "<face-swap|voice-clone|full-synthesis|gan-artifact|diffusion-model|none>",
  "isAiGenerated": <true|false>,
  "aiGenerationConfidence": <0-100>,
  "manipulationDetected": <true|false>,
  "manipulationDetails": "<specific manipulation found or 'None detected'>",
  "authenticityScore": <0-100>,
  "elaInterpretation": "<UNIFORM|PATCHY|NORMAL>",
  "suspiciousElements": ["<specific forensic anomaly>"],
  "facialAnomalies": ["<facial inconsistency, empty array if none>"],
  "backgroundAnomalies": ["<background inconsistency, empty array if none>"],
  "compressionAnomalies": ["<compression artifact, empty array if none>"],
  "hasFace": <true|false>,
  "visibleText": "<any text visible in image, or empty string>",
  "analysis": "<3-4 sentence forensic report: what the image shows, key findings, and final authenticity assessment>"
}`;

      const imageMessages = imageData
        ? [
            {
              role: 'user',
              content: [
                { type: 'text', text: imagePrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${imageData.mimeType};base64,${imageData.base64}`,
                  },
                },
              ],
            },
          ]
        : [
            {
              role: 'system',
              content: 'You are a deepfake detection specialist. Respond with valid JSON only.',
            },
            {
              role: 'user',
              content: `${imagePrompt}\n\nImage URL: ${imageUrl}\n(Image could not be fetched — analyze based on URL/filename context.)`,
            },
          ];

      // Run AI analysis + 3 external APIs in parallel
      const [
        aiRaw,
        bitmindResult,
        sightengineResult,
        realityDefenderResult,
      ] = await Promise.all([
        callAI(aiApiKey, aiBaseUrl, imageMessages, 0.15).catch(e => { console.error('AI image analysis error:', e); return null; }),
        imageData ? callBitMind(imageData.buffer, imageData.mimeType) : Promise.resolve({ isFake: false, confidence: 0, status: 'unavailable' as const }),
        callSightEngine(imageUrl),
        callRealityDefender(imageUrl),
      ]);

      let imageAnalysis: any = {};
      if (aiRaw) {
        try {
          imageAnalysis = parseJSON(aiRaw);
          console.log('AI image analysis:', JSON.stringify(imageAnalysis).substring(0, 200));
        } catch (e) {
          console.error('Image analysis parse error:', e);
        }
      }

      // Fallback if AI analysis failed
      if (!imageAnalysis.imageName) {
        imageAnalysis = {
          imageName: 'Uploaded image',
          overallVerdict: 'UNCERTAIN',
          deepfakeDetected: false,
          deepfakeConfidence: 0,
          deepfakeType: 'none',
          isAiGenerated: false,
          aiGenerationConfidence: 0,
          manipulationDetected: false,
          manipulationDetails: 'Analysis incomplete.',
          authenticityScore: 50,
          elaInterpretation: 'NORMAL',
          suspiciousElements: [],
          facialAnomalies: [],
          backgroundAnomalies: [],
          compressionAnomalies: [],
          hasFace: false,
          visibleText: '',
          analysis: 'Image could not be fully analyzed.',
        };
      }

      console.log('BitMind:', JSON.stringify(bitmindResult));
      console.log('SightEngine:', JSON.stringify(sightengineResult));
      console.log('Reality Defender:', JSON.stringify(realityDefenderResult));

      // Calculate suspicion score
      const forensicScore = calculateSuspicionScore({
        bitmind: bitmindResult as any,
        sightengine: sightengineResult as any,
        realitydefender: realityDefenderResult as any,
        aiAnalysis: imageAnalysis,
      });

      console.log('Forensic score:', forensicScore.score, forensicScore.verdict);

      // Reverse image search + deepfake context search in parallel
      const searchQuery = imageAnalysis.imageName || imageAnalysis.visibleText || claim;
      const [imgSearchData, contextSearchData] = await Promise.all([
        serperSearch(searchQuery, serperKeys, 'images', 10),
        serperSearch(
          `deepfake OR "ai generated" OR fake OR manipulated "${searchQuery.substring(0, 60)}"`,
          serperKeys,
          'search',
          5
        ),
      ]);

      const reverseSearchResults = (imgSearchData?.images || []).slice(0, 6).map((img: any) => ({
        url: img.link,
        title: img.title,
        source: img.source || img.link,
        imageUrl: img.imageUrl || img.thumbnailUrl || null,
      }));

      const contextResults = (contextSearchData?.organic || []).slice(0, 3).map((r: any) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      }));

      contentAnalysis = {
        contentType: 'image',
        summary: imageAnalysis.analysis || 'Image forensic analysis completed',
        imageAnalysis: {
          // AI forensic analysis
          overallVerdict: imageAnalysis.overallVerdict || 'UNCERTAIN',
          deepfakeDetected: imageAnalysis.deepfakeDetected || false,
          deepfakeConfidence: imageAnalysis.deepfakeConfidence || 0,
          deepfakeType: imageAnalysis.deepfakeType || 'none',
          isAiGenerated: imageAnalysis.isAiGenerated || false,
          aiGenerationConfidence: imageAnalysis.aiGenerationConfidence || 0,
          manipulationDetected: imageAnalysis.manipulationDetected || false,
          manipulationDetails: imageAnalysis.manipulationDetails || 'No manipulation detected',
          authenticityScore: imageAnalysis.authenticityScore || 100,
          elaInterpretation: imageAnalysis.elaInterpretation || 'NORMAL',
          hasFace: imageAnalysis.hasFace || false,
          suspiciousElements: imageAnalysis.suspiciousElements || [],
          facialAnomalies: imageAnalysis.facialAnomalies || [],
          backgroundAnomalies: imageAnalysis.backgroundAnomalies || [],
          compressionAnomalies: imageAnalysis.compressionAnomalies || [],

          // External API results
          bitmind: {
            status: bitmindResult.status,
            isFake: bitmindResult.isFake,
            confidence: bitmindResult.confidence,
          },
          sightengine: {
            status: sightengineResult.status,
            deepfakeScore: sightengineResult.deepfakeScore,
            aiGeneratedScore: sightengineResult.aiGeneratedScore,
          },
          realitydefender: {
            status: realityDefenderResult.status,
            result: realityDefenderResult.result,
            confidence: realityDefenderResult.confidence,
          },

          // Multi-engine score
          suspicionScore: forensicScore.score,
          suspicionVerdict: forensicScore.verdict,
          detectionConfidence: forensicScore.confidence,
          recommendation: forensicScore.recommendation,
          signalLog: forensicScore.signals,

          reverseSearchResults,
          contextResults,
        },
      };

      analyzedClaim = imageAnalysis.imageName || 'Image verification';
      console.log(`Image name: "${analyzedClaim}"`);
    }

    // ════════════════════════════════════════════════════════════════
    // STEP B: VIDEO DEEPFAKE DETECTION
    // ════════════════════════════════════════════════════════════════
    if (inputType === 'video') {
      const videoUrl = mediaUrl || claim;
      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
      const isTikTok = videoUrl.includes('tiktok.com');
      console.log('--- VIDEO DEEPFAKE DETECTION ---', { isYouTube, isTikTok });

      if (isYouTube || isTikTok) {
        let videoId = '';
        if (isYouTube) {
          const ytMatch = videoUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          videoId = ytMatch?.[1] || '';
        }

        const searchQuery = isYouTube
          ? `${videoId ? `youtube ${videoId}` : claim} deepfake fake OR debunked`
          : `tiktok ${claim} deepfake fake OR debunked`;

        const [videoSearchData, factCheckData] = await Promise.all([
          serperSearch(searchQuery, serperKeys, 'search', 8),
          serperSearch(
            `"${claim.substring(0, 80)}" fact check OR deepfake OR fake`,
            serperKeys,
            'news',
            5
          ),
        ]);

        const allResults = [
          ...(videoSearchData?.organic || []),
          ...(factCheckData?.news || []),
        ];
        const videoSearchContext = allResults
          .slice(0, 6)
          .map(
            (r: any, i: number) =>
              `[${i + 1}] ${r.title}\n   ${r.snippet}${r.date ? ` (${r.date})` : ''}`
          )
          .join('\n\n');

        const videoPrompt = `You are a forensic video analyst and deepfake detection specialist. Today is ${currentDate}.

Analyze this ${isYouTube ? 'YouTube' : 'TikTok'} video for DEEPFAKES and MISINFORMATION.

Video URL: ${videoUrl}
User submitted for analysis: "${claim}"

Real-time search context:
${videoSearchContext || 'No search results found.'}

DEEPFAKE RISK ASSESSMENT — evaluate based on context:
- Is a known political figure, celebrity, or public person shown in an unlikely scenario?
- Do search results mention this video is disputed, debunked, or AI-generated?
- Are there signs of voice cloning or lip-sync inconsistencies mentioned?
- Is the content designed to mislead viewers about a real event?
- Does the platform/URL/title suggest synthetic or manipulated content?

Return ONLY valid JSON:
{
  "mainClaim": "<the primary verifiable claim made or implied>",
  "videoTitle": "<estimated or known title>",
  "extractedClaims": ["<claim1>", "<claim2>"],
  "contentType": "<news|opinion|entertainment|educational|misinformation|deepfake>",
  "deepfakeRisk": "<HIGH|MEDIUM|LOW|NONE>",
  "deepfakeConfidence": <0-100>,
  "deepfakeIndicators": ["<specific indicator>"],
  "isMisinformation": <true|false>,
  "misinformationDetails": "<why this may be misinformation, or 'No misinformation detected'>",
  "voiceCloningRisk": "<HIGH|MEDIUM|LOW|NONE>",
  "sourceCredibility": <0-100>,
  "authenticityScore": <0-100>,
  "overallVerdict": "<AUTHENTIC|DEEPFAKE|MANIPULATED|MISINFORMATION|UNCERTAIN>",
  "summary": "<3-4 sentence deepfake/misinformation risk assessment>"
}`;

        let videoAnalysis: any = {};
        try {
          const raw = await callAI(aiApiKey, aiBaseUrl, [
            {
              role: 'system',
              content: 'You are a deepfake detection and video fact-checking specialist. Respond with valid JSON only.',
            },
            { role: 'user', content: videoPrompt },
          ], 0.2);
          videoAnalysis = parseJSON(raw);
          console.log('Video deepfake analysis:', JSON.stringify(videoAnalysis).substring(0, 300));
        } catch (e) {
          console.error('Video analysis error:', e);
          videoAnalysis = {
            mainClaim: claim,
            summary: 'Video content analysis',
            deepfakeRisk: 'NONE',
            deepfakeConfidence: 0,
            overallVerdict: 'UNCERTAIN',
          };
        }

        contentAnalysis = {
          contentType: 'video',
          summary: videoAnalysis.summary || `Video: ${claim}`,
          mainClaim: videoAnalysis.mainClaim,
          extractedMedia: [
            { type: 'video', url: videoUrl, caption: videoAnalysis.videoTitle || claim },
          ],
          videoAnalysis: {
            platform: isYouTube ? 'YouTube' : 'TikTok',
            extractedClaims: videoAnalysis.extractedClaims || [],
            contentType: videoAnalysis.contentType,
            deepfakeRisk: videoAnalysis.deepfakeRisk || 'NONE',
            deepfakeConfidence: videoAnalysis.deepfakeConfidence || 0,
            deepfakeIndicators: videoAnalysis.deepfakeIndicators || [],
            isMisinformation: videoAnalysis.isMisinformation || false,
            misinformationDetails: videoAnalysis.misinformationDetails || 'No misinformation detected',
            voiceCloningRisk: videoAnalysis.voiceCloningRisk || 'NONE',
            sourceCredibility: videoAnalysis.sourceCredibility || 70,
            authenticityScore: videoAnalysis.authenticityScore || 70,
            overallVerdict: videoAnalysis.overallVerdict || 'UNCERTAIN',
          },
        };

        analyzedClaim = videoAnalysis.mainClaim || claim;
      } else {
        // Uploaded video — full forensic analysis
        console.log('Uploaded video — forensic deepfake analysis...');
        const videoData = await fetchAsBase64(videoUrl);

        const uploadedVideoPrompt = `You are a deepfake detection specialist and forensic video analyst. Today is ${currentDate}.

User submitted this video for deepfake detection. Context: "${claim}"

COMPREHENSIVE FORENSIC ANALYSIS:

1. FACIAL DEEPFAKE ARTIFACTS: boundary seams, unnatural blinking, skin inconsistencies, lighting mismatch
2. VOICE CLONING INDICATORS: unnatural cadence, audio-visual desync, metallic voice quality
3. FULL VIDEO SYNTHESIS (Sora/Runway/Kling): impossible motion, object permanence failures, temporal instability
4. FRAME MANIPULATION: cut-and-paste regions, selective blurring, unnatural transitions

Return ONLY valid JSON:
{
  "mainClaim": "<primary verifiable claim from this video>",
  "summary": "<3-4 sentence forensic deepfake assessment>",
  "deepfakeDetected": <true|false>,
  "deepfakeConfidence": <0-100>,
  "deepfakeType": "<face-swap|voice-clone|full-synthesis|frame-manipulation|none>",
  "facialAnomalies": ["<specific facial artifact or empty array>"],
  "audioAnomalies": ["<audio/voice artifact or empty array>"],
  "temporalAnomalies": ["<frame/motion artifact or empty array>"],
  "authenticityScore": <0-100>,
  "overallVerdict": "<AUTHENTIC|DEEPFAKE|MANIPULATED|AI-GENERATED|UNCERTAIN>",
  "analysis": "<detailed forensic explanation of all findings>"
}`;

        let videoAnalysis: any = {};

        if (videoData && videoData.mimeType.startsWith('video/')) {
          try {
            const raw = await callAI(aiApiKey, aiBaseUrl, [
              {
                role: 'user',
                content: [
                  { type: 'text', text: uploadedVideoPrompt },
                  { type: 'image_url', image_url: { url: `data:${videoData.mimeType};base64,${videoData.base64}` } },
                ],
              },
            ], 0.15);
            videoAnalysis = parseJSON(raw);
          } catch (e) {
            console.error('Uploaded video AI analysis error:', e);
          }
        }

        if (!videoAnalysis.mainClaim) {
          try {
            const raw = await callAI(aiApiKey, aiBaseUrl, [
              { role: 'system', content: 'You are a deepfake detection specialist. Respond with valid JSON only.' },
              { role: 'user', content: uploadedVideoPrompt },
            ], 0.2);
            videoAnalysis = parseJSON(raw);
          } catch (e) {
            videoAnalysis = {
              mainClaim: claim,
              summary: 'Video deepfake analysis',
              deepfakeDetected: false,
              deepfakeConfidence: 0,
              deepfakeType: 'none',
              authenticityScore: 70,
              overallVerdict: 'UNCERTAIN',
              facialAnomalies: [],
              audioAnomalies: [],
              temporalAnomalies: [],
              analysis: 'Video could not be fully analyzed.',
            };
          }
        }

        contentAnalysis = {
          contentType: 'video',
          summary: videoAnalysis.summary || 'Uploaded video deepfake analysis',
          mainClaim: videoAnalysis.mainClaim,
          extractedMedia: [
            { type: 'video', url: videoUrl, caption: videoAnalysis.mainClaim || claim },
          ],
          videoAnalysis: {
            deepfakeDetected: videoAnalysis.deepfakeDetected || false,
            deepfakeConfidence: videoAnalysis.deepfakeConfidence || 0,
            deepfakeType: videoAnalysis.deepfakeType || 'none',
            facialAnomalies: videoAnalysis.facialAnomalies || [],
            audioAnomalies: videoAnalysis.audioAnomalies || [],
            temporalAnomalies: videoAnalysis.temporalAnomalies || [],
            authenticityScore: videoAnalysis.authenticityScore || 70,
            overallVerdict: videoAnalysis.overallVerdict || 'UNCERTAIN',
            analysis: videoAnalysis.analysis || '',
          },
        };

        analyzedClaim = videoAnalysis.mainClaim || claim;
        console.log(`Video claim: "${analyzedClaim}"`);
      }
    }

    // ════════════════════════════════════════════════════════════════
    // STEP C: URL CONTENT EXTRACTION
    // ════════════════════════════════════════════════════════════════
    if (inputType === 'url') {
      console.log('--- URL VERIFICATION ---');
      let extractedTitle = '';
      let extractedText = '';
      let ogImage = '';

      try {
        const urlRes = await fetch(claim, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          redirect: 'follow',
        });

        if (urlRes.ok) {
          const html = await urlRes.text();
          const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i) || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i);
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:description"/i);
          const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i) || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
          const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);

          extractedTitle = ogTitleMatch?.[1] || titleMatch?.[1] || '';
          const description = ogDescMatch?.[1] || descMatch?.[1] || '';
          ogImage = ogImageMatch?.[1] || '';

          const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
          const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
          const rawBody = articleMatch?.[1] || mainMatch?.[1] || html;
          const paragraphs = rawBody.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
          extractedText = paragraphs
            .map((p: string) => p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
            .filter((p: string) => p.length > 60)
            .slice(0, 15)
            .join(' ');

          if (!extractedText && description) extractedText = description;
        }
      } catch (fetchErr) {
        console.warn('Direct URL fetch failed:', fetchErr);
      }

      if (!extractedText || extractedText.length < 100) {
        try {
          const domain = new URL(claim).hostname.replace('www.', '');
          const searchQuery = extractedTitle ? `"${extractedTitle}" site:${domain}` : `site:${domain} ${claim.split('/').pop()?.replace(/-/g, ' ') || ''}`;
          const [newsData, organic] = await Promise.all([
            serperSearch(searchQuery, serperKeys, 'news', 5),
            serperSearch(searchQuery, serperKeys, 'search', 5),
          ]);
          const results = [...(newsData?.news || []), ...(organic?.organic || [])];
          if (results.length > 0) {
            extractedTitle = extractedTitle || results[0]?.title || '';
            extractedText = results.map((r: any) => r.snippet || '').filter(Boolean).join(' ');
          }
        } catch (serperErr) {
          console.warn('Serper URL fallback failed:', serperErr);
        }
      }

      const contentPrompt = `You are a content analyst. Analyze this URL and extracted content.

URL: ${claim}
Title: ${extractedTitle || '(not extracted)'}
Extracted text: ${(extractedText || '(no content extracted)').substring(0, 2000)}
Current date: ${currentDate}

Return ONLY valid JSON:
{
  "contentType": "<article|social-post|video|image|product|unknown>",
  "summary": "<2-3 sentence summary>",
  "mainClaim": "<primary verifiable claim>",
  "headline": "<article headline>",
  "publishedDate": "<YYYY-MM-DD or empty>",
  "sourceCredibility": <0-100>,
  "topicCategory": "<political|health|financial|science|social|environmental|general>"
}`;

      let urlContentAnalysis: any = {};
      try {
        const raw = await callAI(aiApiKey, aiBaseUrl, [
          { role: 'system', content: 'You are a URL content analyst. Respond with valid JSON only.' },
          { role: 'user', content: contentPrompt },
        ]);
        urlContentAnalysis = parseJSON(raw);
      } catch (e) {
        urlContentAnalysis = { contentType: 'article', summary: extractedTitle || claim, mainClaim: extractedTitle || claim };
      }

      contentAnalysis = {
        contentType: urlContentAnalysis.contentType || 'article',
        summary: urlContentAnalysis.summary || extractedTitle,
        mainClaim: urlContentAnalysis.mainClaim,
        extractedMedia: ogImage ? [{ type: 'image', url: ogImage, caption: extractedTitle }] : [],
      };

      analyzedClaim = urlContentAnalysis.mainClaim || extractedTitle || claim;
    }

    // ════════════════════════════════════════════════════════════════
    // STEP D: WEB SEARCH
    // ════════════════════════════════════════════════════════════════
    console.log('--- WEB SEARCH ---', analyzedClaim.substring(0, 80));
    const [searchData, imageData] = await Promise.all([
      serperSearch(analyzedClaim, serperKeys, 'search', 10),
      serperSearch(analyzedClaim, serperKeys, 'images', 10),
    ]);

    const searchResults: SerperResult[] = searchData?.organic || [];
    const imageResults: any[] = imageData?.images || [];

    const searchContext = searchResults
      .slice(0, 8)
      .map((r, i) => `[${i + 1}] ${r.title}\n   Source: ${r.link}\n   Snippet: ${r.snippet}${r.date ? `\n   Date: ${r.date}` : ''}`)
      .join('\n\n');

    const contentContext = contentAnalysis
      ? `\n**ANALYZED CONTENT:**\nType: ${contentAnalysis.contentType}\nSummary: ${contentAnalysis.summary}\n`
      : '';

    // ════════════════════════════════════════════════════════════════
    // STEP E: AI VERIFICATION ANALYSIS
    // ════════════════════════════════════════════════════════════════
    console.log('--- AI VERIFICATION ---');
    const verificationPrompt = `You are TruthLens AI, a professional fact-checking system. Today is ${currentDate} (year 2026).

**Claim to verify:** "${analyzedClaim}"
**Original input:** "${claim}"
**Input type:** ${inputType}
${contentContext}

**REAL-TIME WEB SEARCH RESULTS:**
${searchContext || 'No search results found.'}

Instructions:
- Base analysis ONLY on search results above — not training data
- Reference specific results (e.g. "According to [1]...")
- Score 80–100: results clearly confirm
- Score 60–79: mostly confirm with caveats
- Score 40–59: results conflict
- Score 20–39: mostly contradict
- Score 0–19: no support or explicitly debunked

Return ONLY valid JSON:
{
  "truthScore": <0-100>,
  "status": "<true|mostly-true|disputed|mostly-false|false>",
  "explanation": "<2-3 sentence explanation referencing search results>",
  "sources": [
    {
      "name": "<outlet name>",
      "url": "<exact URL from search results>",
      "credibilityScore": <0-100>,
      "publishedDate": "<YYYY-MM-DD>",
      "excerpt": "<relevant snippet>",
      "stance": "<supports|contradicts|neutral>",
      "imageUrl": null
    }
  ],
  "relatedClaims": [
    { "claim": "<related claim>", "truthScore": <0-100>, "status": "<status>" }
  ]
}`;

    const aiRaw = await callAI(aiApiKey, aiBaseUrl, [
      {
        role: 'system',
        content: 'You are TruthLens AI, operating in 2026. Fact-check claims using ONLY the provided search results. Respond with valid JSON only.',
      },
      { role: 'user', content: verificationPrompt },
    ], 0.25);

    let result: VerificationResult;
    try {
      result = parseJSON(aiRaw);
    } catch (e) {
      console.error('Failed to parse AI response:', e, aiRaw.substring(0, 300));
      throw new Error('AI response parsing failed');
    }

    const sourcesWithIds = (result.sources || []).map((source, idx) => {
      let imageUrl = source.imageUrl;
      if (!imageUrl && imageResults.length > 0) {
        imageUrl = imageResults[idx % imageResults.length]?.imageUrl || null;
      }
      return { id: `src-${Date.now()}-${idx}`, ...source, imageUrl };
    });

    // ════════════════════════════════════════════════════════════════
    // STEP F: SAVE TO DATABASE
    // ════════════════════════════════════════════════════════════════
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const anonClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '');
      const { data: { user } } = await anonClient.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

    const { data: saved, error: saveError } = await supabaseAdmin
      .from('verifications')
      .insert({
        user_id: userId,
        claim: analyzedClaim,
        input_type: inputType,
        truth_score: result.truthScore,
        status: result.status,
        explanation: result.explanation,
        sources: sourcesWithIds,
        related_claims: result.relatedClaims || [],
        media_url: mediaUrl || null,
      })
      .select()
      .single();

    if (saveError) {
      console.error('DB save error:', saveError);
      throw new Error(`Failed to save verification: ${saveError.message}`);
    }

    console.log('Saved verification:', saved.id);

    if (userId) {
      supabaseAdmin.rpc('increment_trending_claim', {
        claim_text: analyzedClaim,
        score: result.truthScore,
        claim_status: result.status,
        user_id_param: userId,
      }).then(({ error }) => {
        if (error) console.error('Trending update error:', error);
      });
    }

    console.log('=== verify-claim complete ===');

    return new Response(
      JSON.stringify({ id: saved.id, ...result, sources: sourcesWithIds, contentAnalysis }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('verify-claim fatal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Verification failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
