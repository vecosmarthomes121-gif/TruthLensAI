
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

// ── Detection API: BitMind (with 5-key rotation) ─────────────────────────────
async function callBitMind(
  imageBuffer: ArrayBuffer,
  mimeType: string,
  keys: string[]
): Promise<{ isFake: boolean; confidence: number; status: 'ok' | 'unavailable' }> {
  if (keys.length === 0) return { isFake: false, confidence: 0, status: 'unavailable' };

  for (let i = 0; i < keys.length; i++) {
    try {
      const formData = new FormData();
      const blob = new Blob([imageBuffer], { type: mimeType });
      formData.append('file', blob, `image.${mimeType.split('/')[1] || 'jpg'}`);

      const res = await fetch('https://api.bitmind.ai/oracle/v1/detect', {
        method: 'POST',
        headers: { 'x-api-key': keys[i] },
        body: formData,
      });

      if (res.status === 429 || res.status === 403) {
        console.warn(`BitMind key ${i + 1} rate limited (${res.status}), trying next...`);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`BitMind key ${i + 1} error:`, res.status, errText.substring(0, 200));
        continue;
      }

      const data = await res.json();
      console.log(`BitMind key ${i + 1} response:`, JSON.stringify(data).substring(0, 200));

      const isFake = data.is_fake ?? data.fake ?? data.result === 'fake' ?? false;
      const confidence = Math.round((data.confidence ?? data.score ?? 0) * 100);
      return { isFake: Boolean(isFake), confidence, status: 'ok' };
    } catch (err) {
      console.error(`BitMind key ${i + 1} call error:`, err);
    }
  }

  console.warn('All BitMind keys exhausted or failed');
  return { isFake: false, confidence: 0, status: 'unavailable' };
}

// ── Detection API: SightEngine (with 5-key pair rotation) ───────────────────
async function callSightEngine(
  imageUrl: string,
  credentials: Array<{ user: string; secret: string }>
): Promise<{ deepfakeScore: number; aiGeneratedScore: number; status: 'ok' | 'unavailable' }> {
  if (credentials.length === 0) return { deepfakeScore: 0, aiGeneratedScore: 0, status: 'unavailable' };

  for (let i = 0; i < credentials.length; i++) {
    const { user, secret } = credentials[i];
    try {
      const params = new URLSearchParams({
        url: imageUrl,
        models: 'deepfake,ai-generated',
        api_user: user,
        api_secret: secret,
      });

      const res = await fetch(`https://api.sightengine.com/1.0/check.json?${params.toString()}`, {
        method: 'GET',
      });

      if (res.status === 429 || res.status === 403) {
        console.warn(`SightEngine credential ${i + 1} rate limited (${res.status}), trying next...`);
        continue;
      }

      if (!res.ok) {
        console.warn(`SightEngine credential ${i + 1} error:`, res.status);
        continue;
      }

      const data = await res.json();
      console.log(`SightEngine credential ${i + 1} response:`, JSON.stringify(data).substring(0, 300));

      if (data.status === 'failure') {
        console.warn(`SightEngine credential ${i + 1} failure:`, data.error?.message);
        // Don't retry on auth failure
        if (data.error?.code === 'auth') continue;
        continue;
      }

      const deepfakeScore = Math.round((data.deepfake?.score ?? 0) * 100);
      const aiGeneratedScore = Math.round((data.ai_generated?.score ?? 0) * 100);
      return { deepfakeScore, aiGeneratedScore, status: 'ok' };
    } catch (err) {
      console.error(`SightEngine credential ${i + 1} call error:`, err);
    }
  }

  console.warn('All SightEngine credentials exhausted or failed');
  return { deepfakeScore: 0, aiGeneratedScore: 0, status: 'unavailable' };
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

    const requestId = uploadData.request_id ?? uploadData.id ?? null;

    if (!requestId) {
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
      signals.push(`SightEngine: deepfake=${params.sightengine.deepfakeScore}%, AI-generated=${params.sightengine.aiGeneratedScore}% — FLAGGED`);
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
    } else {
      signals.push(`AI Forensics: No manipulation detected (authenticity=${ai.authenticityScore ?? 0}%)`);
    }

    // Facial anomalies
    const facialCount = (ai.facialAnomalies || []).length;
    if (facialCount > 0) {
      const faceScore = Math.min(facialCount * 3, 12);
      score += faceScore;
      signals.push(`AI Forensics: ${facialCount} facial anomaly/anomalies — +${faceScore} pts`);
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

// ── Derive truth score from suspicion score ───────────────────────────────────
function suspicionToTruthScore(suspicionScore: number): { truthScore: number; status: VerificationResult['status'] } {
  if (suspicionScore <= 24) return { truthScore: Math.round(85 + (24 - suspicionScore) * (15 / 24)), status: 'true' };
  if (suspicionScore <= 49) return { truthScore: Math.round(50 + (49 - suspicionScore) * (30 / 25)), status: 'disputed' };
  if (suspicionScore <= 74) return { truthScore: Math.round(20 + (74 - suspicionScore) * (25 / 25)), status: 'mostly-false' };
  return { truthScore: Math.round(Math.max(0, 20 - (suspicionScore - 75))), status: 'false' };
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

    // BitMind: collect all 5 keys (rotation)
    const bitmindKeys = [
      Deno.env.get('BITMIND_API_KEY'),
      Deno.env.get('BITMIND_API_KEY_2'),
      Deno.env.get('BITMIND_API_KEY_3'),
      Deno.env.get('BITMIND_API_KEY_4'),
      Deno.env.get('BITMIND_API_KEY_5'),
    ].filter(Boolean) as string[];

    // SightEngine: collect all 5 credential pairs (rotation)
    const sightengineCredentials = [
      { user: Deno.env.get('SIGHTENGINE_API_USER'), secret: Deno.env.get('SIGHTENGINE_API_SECRET') },
      { user: Deno.env.get('SIGHTENGINE_API_USER_2'), secret: Deno.env.get('SIGHTENGINE_API_SECRET_2') },
      { user: Deno.env.get('SIGHTENGINE_API_USER_3'), secret: Deno.env.get('SIGHTENGINE_API_SECRET_3') },
      { user: Deno.env.get('SIGHTENGINE_API_USER_4'), secret: Deno.env.get('SIGHTENGINE_API_SECRET_4') },
      { user: Deno.env.get('SIGHTENGINE_API_USER_5'), secret: Deno.env.get('SIGHTENGINE_API_SECRET_5') },
    ].filter(c => c.user && c.secret) as Array<{ user: string; secret: string }>;

    console.log(`BitMind keys available: ${bitmindKeys.length}, SightEngine credentials: ${sightengineCredentials.length}`);

    if (!aiApiKey || !aiBaseUrl) throw new Error('OnSpace AI configuration missing');

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    let contentAnalysis: any = null;
    let analyzedClaim = claim;

    // ════════════════════════════════════════════════════════════════
    // MODE: IMAGE — pure deepfake detection, NO web searches
    // ════════════════════════════════════════════════════════════════
    if (inputType === 'image') {
      const imageUrl = mediaUrl || claim;
      console.log('--- IMAGE DEEPFAKE DETECTION (multi-engine, no web search) ---');

      // Fetch image binary once, reuse for all APIs
      const imageData = await fetchAsBase64(imageUrl);

      const imagePrompt = `You are an expert forensic media analyst and deepfake detection specialist. Today is ${currentDate}.

PRIMARY MISSION: Detect if this image is a DEEPFAKE, AI-GENERATED, or MANIPULATED.

FORENSIC CHECKS — examine each carefully:

1. DEEPFAKE INDICATORS
   - Face-swap artifacts: boundary seams around faces, mismatched skin tones, blurred hair edges
   - Facial geometry: asymmetry anomalies, impossible bone structure, ear/nose distortion
   - Eye reflections pointing in different directions (inconsistent light source)
   - Skin texture repeating in a tiled pattern (AI tiling artifact)
   - Hair edges that are too smooth or blend into background unnaturally
   - Extreme ear asymmetry, teeth that are too uniform/white/symmetrical

2. AI GENERATION TELLS (Stable Diffusion, DALL-E, Midjourney, GAN, Firefly, ComfyUI)
   - Extra or missing fingers/limbs
   - Warped or illegible text
   - Unnatural background repetition or bleeding
   - Overly smooth skin / plastic-looking texture
   - Impossible lighting (multiple contradictory shadow directions)

3. ELA INTERPRETATION
   - UNIFORM error levels across face+background+edges → AI-generated
   - PATCHY high-error on faces, low-error backgrounds → spliced/composited
   - Natural varied compression → NORMAL (authentic)

4. PHOTO MANIPULATION
   - Clone-stamp regions, compositing artifacts, perspective inconsistencies

5. CONTEXT
   - What does this image show? Any visible text or identifiable subjects?

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
                { type: 'image_url', image_url: { url: `data:${imageData.mimeType};base64,${imageData.base64}` } },
              ],
            },
          ]
        : [
            { role: 'system', content: 'You are a deepfake detection specialist. Respond with valid JSON only.' },
            { role: 'user', content: `${imagePrompt}\n\nImage URL: ${imageUrl}\n(Image could not be fetched — analyze based on URL/filename context.)` },
          ];

      // Run AI forensic analysis + 3 external detection APIs in parallel — NO web searches
      const [aiRaw, bitmindResult, sightengineResult, realityDefenderResult] = await Promise.all([
        callAI(aiApiKey, aiBaseUrl, imageMessages, 0.15).catch(e => { console.error('AI image analysis error:', e); return null; }),
        imageData ? callBitMind(imageData.buffer, imageData.mimeType, bitmindKeys) : Promise.resolve({ isFake: false, confidence: 0, status: 'unavailable' as const }),
        callSightEngine(imageUrl, sightengineCredentials),
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

      const forensicScore = calculateSuspicionScore({
        bitmind: bitmindResult as any,
        sightengine: sightengineResult as any,
        realitydefender: realityDefenderResult as any,
        aiAnalysis: imageAnalysis,
      });

      console.log('Forensic score:', forensicScore.score, forensicScore.verdict);

      contentAnalysis = {
        contentType: 'image',
        summary: imageAnalysis.analysis || 'Image forensic analysis completed',
        imageAnalysis: {
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
          bitmind: { status: bitmindResult.status, isFake: bitmindResult.isFake, confidence: bitmindResult.confidence },
          sightengine: { status: sightengineResult.status, deepfakeScore: sightengineResult.deepfakeScore, aiGeneratedScore: sightengineResult.aiGeneratedScore },
          realitydefender: { status: realityDefenderResult.status, result: realityDefenderResult.result, confidence: realityDefenderResult.confidence },
          suspicionScore: forensicScore.score,
          suspicionVerdict: forensicScore.verdict,
          detectionConfidence: forensicScore.confidence,
          recommendation: forensicScore.recommendation,
          signalLog: forensicScore.signals,
        },
      };

      analyzedClaim = imageAnalysis.imageName || 'Image verification';
      console.log(`Image name: "${analyzedClaim}"`);

      // ── Derive scores and save — skip all web search for images ──
      const { truthScore, status } = suspicionToTruthScore(forensicScore.score);
      const explanation = `${imageAnalysis.analysis || ''} Suspicion score: ${forensicScore.score}/100 — ${forensicScore.verdict}. ${forensicScore.recommendation}`;

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
          truth_score: truthScore,
          status,
          explanation,
          sources: [],
          related_claims: [],
          media_url: mediaUrl || null,
        })
        .select()
        .single();

      if (saveError) throw new Error(`Failed to save verification: ${saveError.message}`);
      console.log('Saved image verification:', saved.id);
      console.log('=== verify-claim complete (image) ===');

      return new Response(
        JSON.stringify({ id: saved.id, truthScore, status, explanation, sources: [], relatedClaims: [], contentAnalysis }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ════════════════════════════════════════════════════════════════
    // MODE: VIDEO — pure deepfake detection, NO web searches
    // ════════════════════════════════════════════════════════════════
    if (inputType === 'video') {
      const videoUrl = mediaUrl || claim;
      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
      const isTikTok = videoUrl.includes('tiktok.com');
      console.log('--- VIDEO DEEPFAKE DETECTION (no web search) ---', { isYouTube, isTikTok });

      const videoPrompt = `You are a forensic video analyst and deepfake detection specialist. Today is ${currentDate}.

The user submitted this video for DEEPFAKE DETECTION. Do NOT search the web — analyze based on the URL, platform context, and any observable signals.

Video URL: ${videoUrl}
Platform: ${isYouTube ? 'YouTube' : isTikTok ? 'TikTok' : 'Direct upload'}
User context: "${claim}"

DEEPFAKE RISK ASSESSMENT:
- Is a known political figure, celebrity, or public person shown in an unlikely scenario?
- Are there signs of face-swapping, voice cloning, or lip-sync inconsistencies?
- Does the URL/title/context suggest synthetic or manipulated content?
- Is the content designed to mislead viewers about a real event or person?
- For full-synthesis videos (Sora/Runway/Kling): impossible motion, object permanence failures, temporal instability?

Return ONLY valid JSON:
{
  "mainClaim": "<the primary verifiable claim made or implied by this video>",
  "videoTitle": "<estimated or known title>",
  "deepfakeRisk": "<HIGH|MEDIUM|LOW|NONE>",
  "deepfakeConfidence": <0-100>,
  "deepfakeDetected": <true|false>,
  "deepfakeType": "<face-swap|voice-clone|full-synthesis|frame-manipulation|none>",
  "deepfakeIndicators": ["<specific indicator>"],
  "facialAnomalies": ["<facial artifact or empty array>"],
  "audioAnomalies": ["<audio/voice artifact or empty array>"],
  "temporalAnomalies": ["<frame/motion artifact or empty array>"],
  "isMisinformation": <true|false>,
  "misinformationDetails": "<why this may be misinformation, or 'No misinformation detected'>",
  "voiceCloningRisk": "<HIGH|MEDIUM|LOW|NONE>",
  "authenticityScore": <0-100>,
  "overallVerdict": "<AUTHENTIC|DEEPFAKE|MANIPULATED|AI-GENERATED|UNCERTAIN>",
  "summary": "<3-4 sentence deepfake/misinformation risk assessment>"
}`;

      // For uploaded videos, attempt to pass binary to AI
      let videoAnalysis: any = {};
      const isUpload = !isYouTube && !isTikTok;

      if (isUpload) {
        const videoData = await fetchAsBase64(videoUrl);
        if (videoData && videoData.mimeType.startsWith('video/')) {
          try {
            const raw = await callAI(aiApiKey, aiBaseUrl, [
              {
                role: 'user',
                content: [
                  { type: 'text', text: videoPrompt },
                  { type: 'image_url', image_url: { url: `data:${videoData.mimeType};base64,${videoData.base64}` } },
                ],
              },
            ], 0.15);
            videoAnalysis = parseJSON(raw);
          } catch (e) {
            console.error('Uploaded video AI analysis error:', e);
          }
        }
      }

      if (!videoAnalysis.mainClaim) {
        try {
          const raw = await callAI(aiApiKey, aiBaseUrl, [
            { role: 'system', content: 'You are a deepfake detection specialist. Respond with valid JSON only.' },
            { role: 'user', content: videoPrompt },
          ], 0.2);
          videoAnalysis = parseJSON(raw);
          console.log('Video deepfake analysis:', JSON.stringify(videoAnalysis).substring(0, 300));
        } catch (e) {
          console.error('Video analysis fallback error:', e);
          videoAnalysis = {
            mainClaim: claim,
            summary: 'Video deepfake analysis — insufficient data to determine authenticity.',
            deepfakeRisk: 'NONE',
            deepfakeConfidence: 0,
            deepfakeDetected: false,
            deepfakeType: 'none',
            deepfakeIndicators: [],
            facialAnomalies: [],
            audioAnomalies: [],
            temporalAnomalies: [],
            isMisinformation: false,
            misinformationDetails: 'No misinformation detected',
            voiceCloningRisk: 'NONE',
            authenticityScore: 70,
            overallVerdict: 'UNCERTAIN',
          };
        }
      }

      // Derive truth score from deepfake confidence for video
      const deepfakeConf = videoAnalysis.deepfakeConfidence || 0;
      const videoSuspicion = Math.min(deepfakeConf + (videoAnalysis.deepfakeRisk === 'HIGH' ? 20 : videoAnalysis.deepfakeRisk === 'MEDIUM' ? 10 : 0), 100);
      const { truthScore: videoTruthScore, status: videoStatus } = suspicionToTruthScore(videoSuspicion);
      const videoExplanation = `${videoAnalysis.summary || ''} Deepfake confidence: ${deepfakeConf}%. ${videoAnalysis.misinformationDetails || ''}`;

      contentAnalysis = {
        contentType: 'video',
        summary: videoAnalysis.summary || `Video deepfake analysis`,
        mainClaim: videoAnalysis.mainClaim,
        extractedMedia: [{ type: 'video', url: videoUrl, caption: videoAnalysis.videoTitle || claim }],
        videoAnalysis: {
          platform: isYouTube ? 'YouTube' : isTikTok ? 'TikTok' : 'Uploaded',
          deepfakeRisk: videoAnalysis.deepfakeRisk || 'NONE',
          deepfakeConfidence: videoAnalysis.deepfakeConfidence || 0,
          deepfakeDetected: videoAnalysis.deepfakeDetected || false,
          deepfakeType: videoAnalysis.deepfakeType || 'none',
          deepfakeIndicators: videoAnalysis.deepfakeIndicators || [],
          facialAnomalies: videoAnalysis.facialAnomalies || [],
          audioAnomalies: videoAnalysis.audioAnomalies || [],
          temporalAnomalies: videoAnalysis.temporalAnomalies || [],
          isMisinformation: videoAnalysis.isMisinformation || false,
          misinformationDetails: videoAnalysis.misinformationDetails || 'No misinformation detected',
          voiceCloningRisk: videoAnalysis.voiceCloningRisk || 'NONE',
          authenticityScore: videoAnalysis.authenticityScore || 70,
          overallVerdict: videoAnalysis.overallVerdict || 'UNCERTAIN',
        },
      };

      analyzedClaim = videoAnalysis.mainClaim || claim;

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
          truth_score: videoTruthScore,
          status: videoStatus,
          explanation: videoExplanation,
          sources: [],
          related_claims: [],
          media_url: mediaUrl || null,
        })
        .select()
        .single();

      if (saveError) throw new Error(`Failed to save verification: ${saveError.message}`);
      console.log('Saved video verification:', saved.id);
      console.log('=== verify-claim complete (video) ===');

      return new Response(
        JSON.stringify({ id: saved.id, truthScore: videoTruthScore, status: videoStatus, explanation: videoExplanation, sources: [], relatedClaims: [], contentAnalysis }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ════════════════════════════════════════════════════════════════
    // MODE: URL — content extraction + web search verification
    // ════════════════════════════════════════════════════════════════
    if (inputType === 'url') {
      if (serperKeys.length === 0) throw new Error('No Serper API keys configured');
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
    // TEXT + URL: WEB SEARCH → AI VERIFICATION
    // ════════════════════════════════════════════════════════════════
    if (serperKeys.length === 0) throw new Error('No Serper API keys configured');
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
      { role: 'system', content: 'You are TruthLens AI, operating in 2026. Fact-check claims using ONLY the provided search results. Respond with valid JSON only.' },
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

    // Save to DB
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

    if (saveError) throw new Error(`Failed to save verification: ${saveError.message}`);
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
