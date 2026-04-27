import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify JWT manually since we disabled it at the API Gateway to allow OPTIONS requests
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: userError?.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Cloudinary config from environment
    const cloudinaryUrlRaw = Deno.env.get('CLOUDINARY_URL');
    if (!cloudinaryUrlRaw) {
      console.error('Missing CLOUDINARY_URL env var');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const urlPattern = /^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/;
    const match = cloudinaryUrlRaw.match(urlPattern);
    if (!match) {
      console.error('Invalid CLOUDINARY_URL format');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [_, apiKey, apiSecret, cloudName] = match;

    // Parse FormData from request
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No image file received' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Allowed: JPEG, PNG, GIF, WebP.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upload to Cloudinary REST API
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = 'blog_images';

    // Generate signature: SHA-1 of string "folder=blog_images&timestamp=TIMESTAMPAPI_SECRET"
    const signString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    
    // We must hash it using Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(signString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Prepare upload payload
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('api_key', apiKey);
    uploadFormData.append('timestamp', timestamp);
    uploadFormData.append('signature', signature);
    uploadFormData.append('folder', folder);

    const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const clRes = await fetch(cloudinaryUploadUrl, {
      method: 'POST',
      body: uploadFormData,
    });

    if (!clRes.ok) {
      const clError = await clRes.text();
      console.error('Cloudinary upload err:', clRes.status, clError);
      return new Response(JSON.stringify({ error: 'Failed to upload image to Cloudinary' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clData = await clRes.json();
    
    // Generate optimized URL with f_auto,q_auto
    // Example secure_url: https://res.cloudinary.com/cloudName/image/upload/v12345/blog_images/filename.png
    // Needs to become: https://res.cloudinary.com/cloudName/image/upload/f_auto,q_auto/v12345/blog_images/filename.png
    const secureUrl = clData.secure_url;
    let optimizedUrl = secureUrl;
    
    if (secureUrl) {
      const parts = secureUrl.split('/upload/');
      if (parts.length === 2) {
        optimizedUrl = `${parts[0]}/upload/f_auto,q_auto/${parts[1]}`;
      }
    }

    return new Response(JSON.stringify({ url: optimizedUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message || String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
