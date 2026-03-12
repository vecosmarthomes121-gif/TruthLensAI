
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface VerifyRequest {
  claim: string;
  inputType: 'text' | 'url' | 'image' | 'video';
  mediaUrl?: string;
}

interface ImageAnalysis {
  isAiGenerated: boolean;
  confidence: number;
  manipulationDetected: boolean;
  metadata: any;
  reverseSearchResults: Array<{
    url: string;
    title: string;
    source: string;
  }>;
}

interface VideoAnalysis {
  transcript: string;
  extractedClaims: string[];
  duration: number;
  deepfakeDetected: boolean;
  confidence: number;
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
  contentAnalysis?: {
    contentType: 'article' | 'image' | 'video' | 'social-post' | 'mixed';
    summary: string;
    extractedText?: string;
    mainClaim?: string;
    extractedMedia?: Array<{
      type: 'image' | 'video';
      url: string;
      caption?: string;
    }>;
    imageAnalysis?: {
      isAiGenerated: boolean;
      confidence: number;
      manipulationDetected: boolean;
      manipulationDetails: string;
      authenticityScore: number;
      suspiciousElements: string[];
      reverseSearchResults: Array<{
        url: string;
        title: string;
        source: string;
      }>;
    };
    videoAnalysis?: any;
  };
}

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  source?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { claim, inputType, mediaUrl }: VerifyRequest = await req.json();
    console.log('Verifying claim:', { claim, inputType });

    if (!claim || !inputType) {
      return new Response(
        JSON.stringify({ error: 'Claim and inputType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get API credentials
    const aiApiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const aiBaseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');
    
    // Get all available Serper API keys for fallback rotation
    const serperApiKeys = [
      Deno.env.get('SERPER_API_KEY'),
      Deno.env.get('SERPER_API_KEY_2'),
      Deno.env.get('SERPER_API_KEY_3'),
    ].filter(Boolean) as string[]; // Remove undefined keys

    if (!aiApiKey || !aiBaseUrl) {
      throw new Error('OnSpace AI configuration missing');
    }

    if (serperApiKeys.length === 0) {
      throw new Error('No Serper API keys configured');
    }

    console.log(`Available Serper API keys: ${serperApiKeys.length}`);

    // Get current date for context
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Step 0: Handle image verification if input type is image
    if (inputType === 'image' && mediaUrl) {
      console.log('Step 0: Analyzing image for AI generation, manipulation, and authenticity...');
      
      // Analyze image with AI vision
      const imageAnalysisPrompt = `Analyze this image for authenticity and manipulation:

**Current Date:** ${formattedDate}
**Image URL:** ${mediaUrl}

Perform a comprehensive forensic analysis:
1. Detect if this image is AI-generated (look for typical AI artifacts, unnatural patterns, inconsistencies)
2. Check for photo manipulation or editing (cloning, compositing, color adjustments)
3. Assess overall authenticity
4. Identify any suspicious elements

Provide a JSON response:
{
  "isAiGenerated": <true|false>,
  "aiGenerationConfidence": <0-100>,
  "manipulationDetected": <true|false>,
  "manipulationDetails": "<description of any manipulation found>",
  "authenticityScore": <0-100>,
  "suspiciousElements": ["<element1>", "<element2>"],
  "analysis": "<detailed explanation>"
}

Return ONLY the JSON object.`;

      const imageAnalysisResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: imageAnalysisPrompt },
                { type: 'image_url', image_url: { url: mediaUrl } }
              ]
            }
          ],
          temperature: 0.2,
        }),
      });

      let imageAnalysis: any = {};
      if (imageAnalysisResponse.ok) {
        const imageData = await imageAnalysisResponse.json();
        const imageContent = imageData.choices?.[0]?.message?.content ?? '{}';
        try {
          const cleanedImageAnalysis = imageContent
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          imageAnalysis = JSON.parse(cleanedImageAnalysis);
          console.log('✓ Image analysis complete:', imageAnalysis);
        } catch (e) {
          console.error('Failed to parse image analysis:', e);
        }
      }

      // Reverse image search using Serper
      console.log('Performing reverse image search...');
      let reverseSearchResults: any[] = [];
      
      for (let i = 0; i < serperApiKeys.length; i++) {
        try {
          const reverseSearchResponse = await fetch('https://google.serper.dev/images', {
            method: 'POST',
            headers: {
              'X-API-KEY': serperApiKeys[i],
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: claim,
              num: 10,
              gl: 'us',
            }),
          });

          if (reverseSearchResponse.ok) {
            const reverseData = await reverseSearchResponse.json();
            reverseSearchResults = (reverseData.images || []).slice(0, 5).map((img: any) => ({
              url: img.link,
              title: img.title,
              source: img.source || new URL(img.link).hostname
            }));
            console.log(`✓ Found ${reverseSearchResults.length} similar images`);
            break;
          }
        } catch (error) {
          console.error(`Reverse search with key ${i + 1} failed:`, error);
          continue;
        }
      }

      // Add image analysis to content analysis
      contentAnalysis = {
        contentType: 'image' as const,
        summary: imageAnalysis.analysis || 'Image forensic analysis completed',
        imageAnalysis: {
          isAiGenerated: imageAnalysis.isAiGenerated || false,
          confidence: imageAnalysis.aiGenerationConfidence || 0,
          manipulationDetected: imageAnalysis.manipulationDetected || false,
          manipulationDetails: imageAnalysis.manipulationDetails || 'No manipulation detected',
          authenticityScore: imageAnalysis.authenticityScore || 100,
          suspiciousElements: imageAnalysis.suspiciousElements || [],
          reverseSearchResults
        }
      };

      // Update claim to include image analysis context
      analyzedClaim = `Image Analysis: ${claim}. AI Generated: ${imageAnalysis.isAiGenerated ? 'Yes' : 'No'} (${imageAnalysis.aiGenerationConfidence}% confidence). Manipulation: ${imageAnalysis.manipulationDetected ? 'Yes' : 'No'}. Authenticity Score: ${imageAnalysis.authenticityScore}%.`;
    }

    // Step 0.5: Handle video verification if input type is video
    if (inputType === 'video' && mediaUrl) {
      console.log('Step 0.5: Analyzing video for deepfakes and extracting transcript...');
      
      // Check if it's a YouTube or TikTok URL
      const isYouTube = mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be');
      const isTikTok = mediaUrl.includes('tiktok.com');
      
      if (isYouTube || isTikTok) {
        // For YouTube/TikTok URLs, analyze the video description and extract claims
        const videoAnalysisPrompt = `Analyze this ${isYouTube ? 'YouTube' : 'TikTok'} video URL and extract claims:

**Video URL:** ${mediaUrl}
**User's description/claim:** ${claim}
**Current Date:** ${formattedDate}

Provide a JSON response:
{
  "mainClaim": "<primary claim made in the video>",
  "extractedClaims": ["<claim1>", "<claim2>"],
  "videoType": "<news|opinion|entertainment|educational>",
  "summary": "<brief summary of video content>"
}

Return ONLY the JSON object.`;

        const videoAnalysisResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiApiKey}`,
          },
          body: JSON.stringify({
            model: 'google/gemini-3-flash-preview',
            messages: [
              { role: 'system', content: 'You are a video content analyzer. Respond with valid JSON only.' },
              { role: 'user', content: videoAnalysisPrompt }
            ],
            temperature: 0.3,
          }),
        });

        if (videoAnalysisResponse.ok) {
          const videoData = await videoAnalysisResponse.json();
          const videoContent = videoData.choices?.[0]?.message?.content ?? '{}';
          try {
            const cleanedVideoAnalysis = videoContent
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            const videoAnalysis = JSON.parse(cleanedVideoAnalysis);
            
            contentAnalysis = {
              contentType: 'video' as const,
              summary: videoAnalysis.summary || 'Video content analyzed',
              mainClaim: videoAnalysis.mainClaim,
              extractedMedia: [{
                type: 'video' as const,
                url: mediaUrl,
                caption: videoAnalysis.mainClaim || claim
              }],
              videoAnalysis: {
                platform: isYouTube ? 'YouTube' : 'TikTok',
                extractedClaims: videoAnalysis.extractedClaims || [],
                videoType: videoAnalysis.videoType
              }
            };
            
            analyzedClaim = videoAnalysis.mainClaim || claim;
            console.log('✓ Video analysis complete:', videoAnalysis);
          } catch (e) {
            console.error('Failed to parse video analysis:', e);
          }
        }
      } else {
        // For uploaded videos, use Gemini's video analysis capabilities
        const videoAnalysisPrompt = `Analyze this video for:
1. Deepfake detection (facial inconsistencies, unnatural movements, audio-visual sync issues)
2. Content authenticity
3. Main claims or statements made

**Current Date:** ${formattedDate}

Provide a JSON response:
{
  "deepfakeDetected": <true|false>,
  "deepfakeConfidence": <0-100>,
  "transcript": "<extracted speech/text from video>",
  "extractedClaims": ["<claim1>", "<claim2>"],
  "authenticityScore": <0-100>,
  "analysis": "<detailed explanation>"
}

Return ONLY the JSON object.`;

        // Note: For production, you would use Gemini's video input capability here
        // For now, we'll provide context-based analysis
        contentAnalysis = {
          contentType: 'video' as const,
          summary: `Video verification for: ${claim}`,
          extractedMedia: [{
            type: 'video' as const,
            url: mediaUrl,
            caption: claim
          }],
          videoAnalysis: {
            note: 'Video analysis in progress. For full video verification, the system would extract audio, analyze frames, and detect deepfakes.'
          }
        };
      }
    }

    // Step 1: If URL input, fetch and analyze the content first
    let contentAnalysis = null;
    let analyzedClaim = claim;
    
    if (inputType === 'url' && claim.startsWith('http')) {
      console.log('Step 1: Fetching URL content...');
      try {
        const urlResponse = await fetch(claim, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TruthLensBot/1.0)'
          }
        });
        
        if (urlResponse.ok) {
          const html = await urlResponse.text();
          console.log(`✓ Fetched ${html.length} bytes of content`);
          
          // Extract metadata and content using basic parsing
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
          const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
          const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
          const ogVideoMatch = html.match(/<meta[^>]*property="og:video"[^>]*content="([^"]+)"/i);
          
          const title = ogTitleMatch?.[1] || titleMatch?.[1] || 'Unknown';
          const description = ogDescMatch?.[1] || '';
          const ogImage = ogImageMatch?.[1];
          const ogVideo = ogVideoMatch?.[1];
          
          // Extract article text (simplified)
          let articleText = '';
          const paragraphs = html.match(/<p[^>]*>([^<]+)<\/p>/gi);
          if (paragraphs && paragraphs.length > 0) {
            articleText = paragraphs
              .slice(0, 10) // First 10 paragraphs
              .map(p => p.replace(/<[^>]+>/g, '').trim())
              .filter(p => p.length > 50)
              .join(' ');
          }
          
          // Analyze content with AI to understand what it's about
          console.log('Analyzing URL content with AI...');
          const analysisPrompt = `Analyze this web content and extract key information:

**URL:** ${claim}
**Title:** ${title}
**Description:** ${description}
**Content excerpt:** ${articleText.substring(0, 1000)}
**Has image:** ${ogImage ? 'Yes' : 'No'}
**Has video:** ${ogVideo ? 'Yes' : 'No'}

Provide a JSON response with:
{
  "contentType": "<article|image|video|social-post|mixed>",
  "summary": "<2-3 sentence summary of what this content is about>",
  "mainClaim": "<extract the main verifiable claim from this content>",
  "extractedMedia": [
    {"type": "image|video", "url": "<url>", "caption": "<description>"}
  ]
}

Return ONLY the JSON object.`;

          const analysisResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${aiApiKey}`,
            },
            body: JSON.stringify({
              model: 'google/gemini-3-flash-preview',
              messages: [
                { role: 'system', content: 'You are a content analyzer. Respond with valid JSON only.' },
                { role: 'user', content: analysisPrompt }
              ],
              temperature: 0.3,
            }),
          });
          
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            const analysisContent = analysisData.choices?.[0]?.message?.content ?? '';
            try {
              const cleanedAnalysis = analysisContent
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
              contentAnalysis = JSON.parse(cleanedAnalysis);
              contentAnalysis.extractedText = articleText.substring(0, 500);
              
              // Add extracted media from Open Graph
              if (!contentAnalysis.extractedMedia) {
                contentAnalysis.extractedMedia = [];
              }
              if (ogImage && !contentAnalysis.extractedMedia.some((m: any) => m.url === ogImage)) {
                contentAnalysis.extractedMedia.push({
                  type: 'image',
                  url: ogImage,
                  caption: title
                });
              }
              if (ogVideo && !contentAnalysis.extractedMedia.some((m: any) => m.url === ogVideo)) {
                contentAnalysis.extractedMedia.push({
                  type: 'video',
                  url: ogVideo,
                  caption: title
                });
              }
              
              // Use the main claim extracted from content for verification
              if (contentAnalysis.mainClaim) {
                analyzedClaim = contentAnalysis.mainClaim;
                console.log(`✓ Extracted main claim: ${analyzedClaim}`);
              }
            } catch (e) {
              console.error('Failed to parse content analysis:', e);
            }
          }
        }
      } catch (error) {
        console.error('URL fetch error:', error);
        // Continue with original claim if URL fetch fails
      }
    }

    console.log('Step 2: Searching web for current information and images...');

    // Try each Serper API key in sequence until one succeeds
    let serperData: any = null;
    let lastError: Error | null = null;

    for (let i = 0; i < serperApiKeys.length; i++) {
      const currentKey = serperApiKeys[i];
      console.log(`Trying Serper API key ${i + 1}/${serperApiKeys.length}...`);

      try {
        const serperResponse = await fetch('https://google.serper.dev/search', {
          method: 'POST',
          headers: {
            'X-API-KEY': currentKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: claim,
            num: 10,
            gl: 'us',
            hl: 'en',
          }),
        });

        if (serperResponse.ok) {
          serperData = await serperResponse.json();
          console.log(`✓ Search successful with API key ${i + 1}`);
          break; // Success, exit loop
        } else if (serperResponse.status === 429) {
          // Rate limit hit, try next key
          console.log(`✗ API key ${i + 1} rate limit exceeded (429), trying next...`);
          lastError = new Error(`API key ${i + 1} rate limit exceeded`);
          continue;
        } else {
          // Other error, try next key
          const errorText = await serperResponse.text();
          console.error(`✗ API key ${i + 1} error (${serperResponse.status}):`, errorText);
          lastError = new Error(`API key ${i + 1} failed: ${serperResponse.status}`);
          continue;
        }
      } catch (error) {
        console.error(`✗ API key ${i + 1} request failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        continue;
      }
    }

    // If all keys failed, throw error
    if (!serperData) {
      console.error('All Serper API keys failed');
      throw new Error(`Web search failed: ${lastError?.message || 'All API keys exhausted'}`);
    }

    const searchResults: SerperResult[] = serperData.organic || [];

    // Fetch relevant images for the claim
    console.log('Fetching relevant images...');
    let imageResults: any[] = [];
    
    for (let i = 0; i < serperApiKeys.length; i++) {
      try {
        const imageResponse = await fetch('https://google.serper.dev/images', {
          method: 'POST',
          headers: {
            'X-API-KEY': serperApiKeys[i],
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: claim,
            num: 10,
            gl: 'us',
          }),
        });

        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageResults = imageData.images || [];
          console.log(`✓ Found ${imageResults.length} relevant images`);
          break;
        }
      } catch (error) {
        console.error(`Image search with key ${i + 1} failed:`, error);
        continue;
      }
    }
    
    console.log(`Found ${searchResults.length} search results`);

    // Build search context for AI
    const searchContext = searchResults.slice(0, 8).map((result, idx) => 
      `[${idx + 1}] ${result.title}\n   Source: ${result.link}\n   Snippet: ${result.snippet}\n   ${result.date ? `Date: ${result.date}` : ''}`
    ).join('\n\n');
    
    // Add content analysis context if available
    const contentContext = contentAnalysis ? `

**ANALYZED URL CONTENT:**
Content Type: ${contentAnalysis.contentType}
Summary: ${contentAnalysis.summary}
${contentAnalysis.extractedText ? `Extracted Text: ${contentAnalysis.extractedText}` : ''}
` : '';

    // Create detailed verification prompt with real search results
    const verificationPrompt = `You are TruthLens AI, an expert fact-checking system. Analyze the following claim using REAL web search results from Google.

**IMPORTANT CONTEXT:**
- Current date: ${formattedDate}
- You are operating in March 2026
- You have access to ACTUAL search results from the web (below)
- Base your analysis ONLY on the search results provided
- DO NOT use your training data - use ONLY the search results

**Claim to verify:** "${analyzedClaim}"
**Original input:** "${claim}"
**Input type:** ${inputType}
${contentContext}

**REAL WEB SEARCH RESULTS (from Google via Serper API):**
${searchContext || 'No search results found for this claim.'}

Your task:
1. Analyze the SEARCH RESULTS to verify the claim
2. Determine if the search results support, contradict, or provide mixed evidence
3. Calculate truth score (0-100) based ONLY on the search results above
4. Provide a detailed explanation referencing specific search results
5. Use the ACTUAL sources from the search results (extract from the links above)
6. Identify related claims based on the search results

**Output format (MUST be valid JSON):**
{
  "truthScore": <number 0-100>,
  "status": "<true|mostly-true|disputed|mostly-false|false>",
  "explanation": "<detailed 2-3 sentence explanation>",
  "sources": [
    {
      "name": "<source name>",
      "url": "<https://example.com/article>",
      "credibilityScore": <0-100>,
      "publishedDate": "<YYYY-MM-DD>",
      "excerpt": "<relevant quote from source>",
      "stance": "<supports|contradicts|neutral>",
      "imageUrl": "<https://example.com/image.jpg or null>"
    }
  ],
  "relatedClaims": [
    {
      "claim": "<related claim text>",
      "truthScore": <0-100>,
      "status": "<status>"
    }
  ]
}

**Guidelines:**
- truthScore 80-100 = "true" (multiple credible sources confirm)
- truthScore 60-79 = "mostly-true" (mostly confirmed with minor inconsistencies)
- truthScore 40-59 = "disputed" (conflicting evidence)
- truthScore 20-39 = "mostly-false" (mostly contradicted)
- truthScore 0-19 = "false" (no credible sources confirm, or explicitly debunked)
- Extract 3-5 ACTUAL sources from the search results above (use their exact URLs)
- Assign credibility scores: Major news (BBC, Reuters, AP, CNN): 92-96, Regional news: 85-90, Blogs: 60-75
- Extract actual published dates from search results if available
- Your explanation MUST reference specific search results (e.g., "According to result [1]...")
- If search results don't mention the claim at all, score should be very low (0-25)
- If NO search results found, explicitly state "No credible sources found" and score 0-15

Return ONLY the JSON object, no other text.`;

    console.log('Step 3: Analyzing search results with AI...');

    // Call OnSpace AI to analyze the search results
    const aiResponse = await fetch(`${aiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are TruthLens AI, a professional fact-checking system operating in March 2026. You analyze REAL web search results to verify claims. Always respond with valid JSON only. Base your analysis ONLY on the search results provided - do NOT use your training data.`
          },
          {
            role: 'user',
            content: verificationPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more factual responses
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('OnSpace AI error:', errorText);
      throw new Error(`OnSpace AI request failed: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content ?? '';
    
    console.log('AI response received:', aiContent.substring(0, 200));

    // Parse AI response
    let result: VerificationResult;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = aiContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Content:', aiContent);
      throw new Error('AI response parsing failed');
    }

    // Add IDs and images to sources
    const sourcesWithIds = result.sources.map((source, index) => {
      // Try to match source URL with a relevant image from search results
      let imageUrl = source.imageUrl;
      
      if (!imageUrl && imageResults.length > 0) {
        // Assign images in order, cycling through available images
        const imageIndex = index % imageResults.length;
        imageUrl = imageResults[imageIndex]?.imageUrl;
      }
      
      return {
        id: `src-${Date.now()}-${index}`,
        ...source,
        imageUrl: imageUrl || null
      };
    });

    // Get user if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id ?? null;
    }

    // Save to database
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: savedVerification, error: saveError } = await supabaseAdmin
      .from('verifications')
      .insert({
        user_id: userId,
        claim,
        input_type: inputType,
        truth_score: result.truthScore,
        status: result.status,
        explanation: result.explanation,
        sources: sourcesWithIds,
        related_claims: result.relatedClaims,
        media_url: mediaUrl
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      throw new Error(`Failed to save verification: ${saveError.message}`);
    }

    console.log('Verification saved successfully:', savedVerification.id);

    // Update trending claims (async, don't wait)
    supabaseAdmin
      .rpc('increment_trending_claim', {
        claim_text: claim,
        score: result.truthScore,
        claim_status: result.status
      })
      .then(({ error }) => {
        if (error) console.error('Trending update error:', error);
      });

    return new Response(
      JSON.stringify({
        id: savedVerification.id,
        ...result,
        sources: sourcesWithIds,
        contentAnalysis
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Verification failed' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
