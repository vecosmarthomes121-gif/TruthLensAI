import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if og-image already exists
    const { data: existing } = await supabaseAdmin.storage
      .from('verification-media')
      .list('', { search: 'og-image.jpg' });

    if (existing && existing.length > 0) {
      const { data: urlData } = supabaseAdmin.storage
        .from('verification-media')
        .getPublicUrl('og-image.jpg');
      return new Response(
        JSON.stringify({ success: true, message: 'Already uploaded', url: urlData.publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the og-image from the request body (as URL) or from origin
    let imageUrl: string;
    try {
      const body = await req.json();
      imageUrl = body.imageUrl;
    } catch {
      return new Response(
        JSON.stringify({ error: 'Provide {"imageUrl": "https://your-site.com/og-image.jpg"} in the request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the image
    console.log('Fetching OG image from:', imageUrl);
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch image: ${imageRes.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('verification-media')
      .upload('og-image.jpg', imageBuffer, {
        contentType,
        upsert: true,
        cacheControl: '31536000', // 1 year cache
      });

    if (error) {
      console.error('Storage upload error:', error);
      return new Response(
        JSON.stringify({ error: `Storage error: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('verification-media')
      .getPublicUrl('og-image.jpg');

    console.log('OG image uploaded successfully:', urlData.publicUrl);

    return new Response(
      JSON.stringify({ success: true, url: urlData.publicUrl, path: data.path }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
