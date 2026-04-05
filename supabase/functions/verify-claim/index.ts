
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
  relatedClaims: Array<{
    claim: string;
    truthScore: number;
    status: string;
  }>;
  contentAnalysis?: any;
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  source?: string;
}

// ── Helper: fetch image and convert to base64 data URL ──────────────────────
async function fetchImageAsBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    console.log('Fetching image as base64:', url.substring(0, 80));
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TruthLensBot/1.0)' },
    });
    if (!response.ok) {
      console.error('Image fetch failed:', response.status);
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
    console.log(`✓ Image fetched as base64 (${Math.round(buffer.byteLength / 1024)}KB, ${mimeType})`);
    return { base64, mimeType };
  } catch (err) {
    console.error('fetchImageAsBase64 error:', err);
    return null;
  }
}

// ── Helper: run Serper search with key rotation ──────────────────────────────
async function serperSearch(query: string, keys: string[], type: 'search' | 'images' | 'news' = 'search', num = 10): Promise<any> {
  const endpoint = type === 'images'
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
        console.log(`✓ Serper ${type} search success with key ${i + 1}`);
        return data;
      }
      console.warn(`✗ Serper key ${i + 1} returned ${res.status}`);
    } catch (err) {
      console.error(`✗ Serper key ${i + 1} error:`, err);
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
      'Authorization': `Bearer ${apiKey}`,
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
      year: 'numeric', month: 'long', day: 'numeric',
    });

    let contentAnalysis: any = null;
    let analyzedClaim = claim;

    // ════════════════════════════════════════════════════════════════
    // STEP A: IMAGE VERIFICATION
    // ════════════════════════════════════════════════════════════════
    if (inputType === 'image') {
      const imageUrl = mediaUrl || claim;
      console.log('--- IMAGE VERIFICATION ---');

      // Fetch image as base64 so Gemini can actually read it
      const imageData = await fetchImageAsBase64(imageUrl);

      if (!imageData) {
        console.warn('Could not fetch image, attempting URL-based description fallback');
      }

      const imagePrompt = `You are a forensic image analyst. Analyze this image thoroughly.

Current date: ${currentDate}

Tasks:
1. Provide a short descriptive name (max 8 words) for what you see
2. Detect if AI-generated (look for artifacts, unnatural patterns, inconsistencies)
3. Detect photo manipulation (cloning, compositing, unnatural lighting, copy-paste)
4. Overall authenticity assessment
5. Identify any text, logos, events, or notable elements visible

Return ONLY valid JSON:
{
  "imageName": "<descriptive name of the image content>",
  "isAiGenerated": <true|false>,
  "aiGenerationConfidence": <0-100>,
  "manipulationDetected": <true|false>,
  "manipulationDetails": "<what manipulation was found, or 'None detected'>",
  "authenticityScore": <0-100>,
  "suspiciousElements": ["<element>"],
  "visibleText": "<any text visible in image>",
  "analysis": "<2-3 sentence plain-language summary of what this image shows and its authenticity>"
}`;

      const imageMessages = imageData
        ? [
            {
              role: 'user',
              content: [
                { type: 'text', text: imagePrompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:${imageData.mimeType};base64,${imageData.base64}` },
                },
              ],
            },
          ]
        : [
            {
              role: 'system',
              content: 'You are a forensic image analyst. Respond with valid JSON only.',
            },
            {
              role: 'user',
              content: `${imagePrompt}\n\nImage URL: ${imageUrl}\n(Image could not be fetched directly — analyze based on URL context if possible)`,
            },
          ];

      let imageAnalysis: any = {};
      try {
        const raw = await callAI(aiApiKey, aiBaseUrl, imageMessages, 0.2);
        imageAnalysis = parseJSON(raw);
        console.log('✓ Image analysis:', JSON.stringify(imageAnalysis).substring(0, 200));
      } catch (e) {
        console.error('Image analysis parse error:', e);
        imageAnalysis = {
          imageName: 'Uploaded image',
          isAiGenerated: false,
          manipulationDetected: false,
          authenticityScore: 50,
          analysis: 'Image could not be fully analyzed.',
        };
      }

      // Reverse image search
      let reverseSearchResults: any[] = [];
      const searchQuery = imageAnalysis.imageName || imageAnalysis.visibleText || claim;
      const imgSearch = await serperSearch(searchQuery, serperKeys, 'images', 10);
      if (imgSearch?.images) {
        reverseSearchResults = imgSearch.images.slice(0, 5).map((img: any) => ({
          url: img.link,
          title: img.title,
          source: img.source || img.link,
        }));
      }

      contentAnalysis = {
        contentType: 'image',
        summary: imageAnalysis.analysis || 'Image forensic analysis completed',
        imageAnalysis: {
          isAiGenerated: imageAnalysis.isAiGenerated || false,
          confidence: imageAnalysis.aiGenerationConfidence || 0,
          manipulationDetected: imageAnalysis.manipulationDetected || false,
          manipulationDetails: imageAnalysis.manipulationDetails || 'No manipulation detected',
          authenticityScore: imageAnalysis.authenticityScore || 100,
          suspiciousElements: imageAnalysis.suspiciousElements || [],
          reverseSearchResults,
        },
      };

      analyzedClaim = imageAnalysis.imageName || 'Image verification';
      console.log(`✓ Image name: "${analyzedClaim}"`);
    }

    // ════════════════════════════════════════════════════════════════
    // STEP B: VIDEO VERIFICATION
    // ════════════════════════════════════════════════════════════════
    if (inputType === 'video') {
      const videoUrl = mediaUrl || claim;
      const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
      const isTikTok = videoUrl.includes('tiktok.com');
      console.log('--- VIDEO VERIFICATION ---', { isYouTube, isTikTok });

      if (isYouTube || isTikTok) {
        // Extract video ID and fetch metadata via Serper
        let videoId = '';
        if (isYouTube) {
          const ytMatch = videoUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          videoId = ytMatch?.[1] || '';
        }

        // Search for info about this video
        const searchQuery = isYouTube
          ? `site:youtube.com ${videoId || claim} fact check`
          : `tiktok ${claim} fact check`;

        const videoSearchData = await serperSearch(searchQuery, serperKeys, 'search', 10);
        const videoSearchContext = (videoSearchData?.organic || [])
          .slice(0, 5)
          .map((r: any, i: number) => `[${i + 1}] ${r.title}\n   ${r.snippet}`)
          .join('\n\n');

        const videoPrompt = `Analyze this ${isYouTube ? 'YouTube' : 'TikTok'} video and extract verifiable claims.

Video URL: ${videoUrl}
User description: ${claim}
Current date: ${currentDate}

Related search results found online:
${videoSearchContext || 'No additional context found.'}

Return ONLY valid JSON:
{
  "mainClaim": "<the primary verifiable claim made or implied by this video>",
  "videoTitle": "<estimated or known title of the video>",
  "extractedClaims": ["<claim1>", "<claim2>"],
  "contentType": "<news|opinion|entertainment|educational|misinformation>",
  "summary": "<2-3 sentence summary of what this video is about>"
}`;

        let videoAnalysis: any = {};
        try {
          const raw = await callAI(aiApiKey, aiBaseUrl, [
            { role: 'system', content: 'You are a video content analyst. Respond with valid JSON only.' },
            { role: 'user', content: videoPrompt },
          ]);
          videoAnalysis = parseJSON(raw);
          console.log('✓ Video analysis:', JSON.stringify(videoAnalysis).substring(0, 200));
        } catch (e) {
          console.error('Video analysis error:', e);
          videoAnalysis = { mainClaim: claim, summary: 'Video content analysis' };
        }

        contentAnalysis = {
          contentType: 'video',
          summary: videoAnalysis.summary || `Video: ${claim}`,
          mainClaim: videoAnalysis.mainClaim,
          extractedMedia: [{ type: 'video', url: videoUrl, caption: videoAnalysis.videoTitle || claim }],
          videoAnalysis: {
            platform: isYouTube ? 'YouTube' : 'TikTok',
            extractedClaims: videoAnalysis.extractedClaims || [],
            contentType: videoAnalysis.contentType,
          },
        };

        analyzedClaim = videoAnalysis.mainClaim || claim;
      } else {
        // Uploaded video — try to fetch and send as base64 (for short clips)
        console.log('Uploaded video — attempting base64 fetch for AI analysis...');
        const videoData = await fetchImageAsBase64(videoUrl); // reuse same helper

        let videoAnalysis: any = {};
        if (videoData && videoData.mimeType.startsWith('video/')) {
          try {
            const raw = await callAI(aiApiKey, aiBaseUrl, [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this video. Current date: ${currentDate}. User description: "${claim}".
Extract the main verifiable claim, summarize content, and check for any signs of deepfake or manipulation.
Return ONLY valid JSON:
{
  "mainClaim": "<primary verifiable claim>",
  "summary": "<2-3 sentence content summary>",
  "deepfakeDetected": <true|false>,
  "deepfakeConfidence": <0-100>,
  "authenticityScore": <0-100>,
  "analysis": "<plain-language analysis>"
}`,
                  },
                  {
                    type: 'image_url',
                    image_url: { url: `data:${videoData.mimeType};base64,${videoData.base64}` },
                  },
                ],
              },
            ], 0.3);
            videoAnalysis = parseJSON(raw);
            console.log('✓ Uploaded video analysis complete');
          } catch (e) {
            console.error('Uploaded video AI analysis error:', e);
          }
        } else {
          // Fallback: describe based on claim context
          try {
            const raw = await callAI(aiApiKey, aiBaseUrl, [
              { role: 'system', content: 'You are a video fact-checker. Respond with valid JSON only.' },
              {
                role: 'user',
                content: `The user uploaded a video and described it as: "${claim}". Current date: ${currentDate}.
Extract the most likely verifiable claim and provide analysis context.
Return ONLY valid JSON:
{
  "mainClaim": "<most likely verifiable claim from the description>",
  "summary": "<what this video is likely about based on description>",
  "deepfakeDetected": false,
  "authenticityScore": 70,
  "analysis": "<analysis based on description>"
}`,
              },
            ]);
            videoAnalysis = parseJSON(raw);
          } catch (e) {
            videoAnalysis = { mainClaim: claim, summary: 'Video content' };
          }
        }

        contentAnalysis = {
          contentType: 'video',
          summary: videoAnalysis.summary || 'Uploaded video analyzed',
          mainClaim: videoAnalysis.mainClaim,
          extractedMedia: [{ type: 'video', url: videoUrl, caption: videoAnalysis.mainClaim || claim }],
          videoAnalysis: {
            deepfakeDetected: videoAnalysis.deepfakeDetected || false,
            deepfakeConfidence: videoAnalysis.deepfakeConfidence || 0,
            authenticityScore: videoAnalysis.authenticityScore || 70,
            analysis: videoAnalysis.analysis || '',
          },
        };

        analyzedClaim = videoAnalysis.mainClaim || claim;
        console.log(`✓ Video claim: "${analyzedClaim}"`);
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

      // Attempt 1: Direct fetch with browser-like headers
      try {
        const urlRes = await fetch(claim, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          redirect: 'follow',
        });

        if (urlRes.ok) {
          const html = await urlRes.text();
          console.log(`✓ Fetched URL content: ${html.length} bytes`);

          // Extract metadata
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)
            || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:title"/i);
          const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i)
            || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:description"/i);
          const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i)
            || html.match(/<meta[^>]*content="([^"]+)"[^>]*property="og:image"/i);
          const descMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);

          extractedTitle = ogTitleMatch?.[1] || titleMatch?.[1] || '';
          const description = ogDescMatch?.[1] || descMatch?.[1] || '';
          ogImage = ogImageMatch?.[1] || '';

          // Extract article body text
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

          console.log(`✓ Extracted title: "${extractedTitle.substring(0, 60)}"`);
          console.log(`✓ Extracted text: ${extractedText.length} chars`);
        } else {
          console.warn(`URL fetch returned ${urlRes.status}`);
        }
      } catch (fetchErr) {
        console.warn('Direct URL fetch failed:', fetchErr);
      }

      // Attempt 2: If direct fetch failed or gave little content, use Serper to find the article
      if (!extractedText || extractedText.length < 100) {
        console.log('Falling back to Serper search for URL content...');
        try {
          const domain = new URL(claim).hostname.replace('www.', '');
          const searchQuery = extractedTitle
            ? `"${extractedTitle}" site:${domain}`
            : `site:${domain} ${claim.split('/').pop()?.replace(/-/g, ' ') || ''}`;

          const newsData = await serperSearch(searchQuery, serperKeys, 'news', 5);
          const organic = await serperSearch(searchQuery, serperKeys, 'search', 5);

          const results = [...(newsData?.news || []), ...(organic?.organic || [])];
          if (results.length > 0) {
            extractedTitle = extractedTitle || results[0]?.title || '';
            extractedText = results.map((r: any) => r.snippet || '').filter(Boolean).join(' ');
            console.log(`✓ Serper fallback: found ${results.length} results for URL`);
          }
        } catch (serperErr) {
          console.warn('Serper URL fallback failed:', serperErr);
        }
      }

      // Analyze extracted content with AI
      const contentPrompt = `You are a content analyst. Analyze this URL and its extracted content.

URL: ${claim}
Title: ${extractedTitle || '(not extracted)'}
Extracted text (first ~2000 chars):
${(extractedText || '(no content extracted — use URL context only)').substring(0, 2000)}

Current date: ${currentDate}

Extract key information. Return ONLY valid JSON:
{
  "contentType": "<article|social-post|video|image|product|unknown>",
  "summary": "<2-3 sentence plain-language summary of what this URL is about>",
  "mainClaim": "<the primary verifiable claim made in this content>",
  "headline": "<the article/page headline>",
  "publishedDate": "<YYYY-MM-DD or empty string>",
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
        console.log('✓ URL content analysis:', JSON.stringify(urlContentAnalysis).substring(0, 200));
      } catch (e) {
        console.error('URL content analysis error:', e);
        urlContentAnalysis = {
          contentType: 'article',
          summary: extractedTitle || claim,
          mainClaim: extractedTitle || claim,
        };
      }

      contentAnalysis = {
        contentType: urlContentAnalysis.contentType || 'article',
        summary: urlContentAnalysis.summary || extractedTitle,
        mainClaim: urlContentAnalysis.mainClaim,
        extractedText: extractedText.substring(0, 500),
        extractedMedia: ogImage
          ? [{ type: 'image', url: ogImage, caption: extractedTitle }]
          : [],
      };

      // Use the extracted headline/claim for verification
      if (urlContentAnalysis.mainClaim) {
        analyzedClaim = urlContentAnalysis.mainClaim;
      } else if (extractedTitle) {
        analyzedClaim = extractedTitle;
      }
      console.log(`✓ URL claim to verify: "${analyzedClaim.substring(0, 80)}"`);
    }

    // ════════════════════════════════════════════════════════════════
    // STEP D: WEB SEARCH for evidence
    // ════════════════════════════════════════════════════════════════
    console.log('--- WEB SEARCH ---', analyzedClaim.substring(0, 80));

    const [searchData, imageData] = await Promise.all([
      serperSearch(analyzedClaim, serperKeys, 'search', 10),
      serperSearch(analyzedClaim, serperKeys, 'images', 10),
    ]);

    const searchResults: SerperResult[] = searchData?.organic || [];
    const imageResults: any[] = imageData?.images || [];
    console.log(`✓ ${searchResults.length} search results, ${imageResults.length} images`);

    const searchContext = searchResults.slice(0, 8).map((r, i) =>
      `[${i + 1}] ${r.title}\n   Source: ${r.link}\n   Snippet: ${r.snippet}${r.date ? `\n   Date: ${r.date}` : ''}`
    ).join('\n\n');

    const contentContext = contentAnalysis
      ? `\n**ANALYZED CONTENT:**\nType: ${contentAnalysis.contentType}\nSummary: ${contentAnalysis.summary}\n`
      : '';

    // ════════════════════════════════════════════════════════════════
    // STEP E: AI VERIFICATION ANALYSIS
    // ════════════════════════════════════════════════════════════════
    console.log('--- AI ANALYSIS ---');

    const verificationPrompt = `You are TruthLens AI, a professional fact-checking system. Today is ${currentDate} (year 2026).

**Claim to verify:** "${analyzedClaim}"
**Original input:** "${claim}"
**Input type:** ${inputType}
${contentContext}

**REAL-TIME WEB SEARCH RESULTS:**
${searchContext || 'No search results found.'}

Instructions:
- Base your analysis ONLY on the search results above
- Do NOT use training data as primary source — use the search results
- Reference specific results in your explanation (e.g. "According to [1]...")
- If results clearly confirm: score 80–100
- If results mostly confirm with caveats: score 60–79
- If results conflict: score 40–59
- If results mostly contradict: score 20–39
- If no results support or explicitly debunked: score 0–19

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
      "excerpt": "<relevant quote or snippet>",
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
        content: `You are TruthLens AI, operating in April 2026. Fact-check claims using ONLY the provided search results. Respond with valid JSON only.`,
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

    // Attach images to sources
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
      const anonClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      const { data: { user } } = await anonClient.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    console.log('✓ Saved verification:', saved.id);

    // Update trending (authenticated only)
    if (userId) {
      supabaseAdmin
        .rpc('increment_trending_claim', {
          claim_text: analyzedClaim,
          score: result.truthScore,
          claim_status: result.status,
          user_id_param: userId,
        })
        .then(({ error }) => {
          if (error) console.error('Trending update error:', error);
        });
    }

    console.log('=== verify-claim complete ===');

    return new Response(
      JSON.stringify({
        id: saved.id,
        ...result,
        sources: sourcesWithIds,
        contentAnalysis,
      }),
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
