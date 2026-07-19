import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const GENLOOK_API_KEY = Deno.env.get('GENLOOK_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { product_external_id, product_name, product_image_url, image_base64 } = await req.json();

    if (!GENLOOK_API_KEY) {
      throw new Error("GENLOOK_API_KEY is not set.");
    }

    if (!image_base64) {
      throw new Error("Customer image (image_base64) is required.");
    }

    // Convert base64 to Blob/File for Genlook API
    const byteCharacters = atob(image_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('file', blob, 'customer.jpg');
    formData.append('crop', 'false');

    // 1. Upload Customer Image
    const uploadRes = await fetch("https://api.genlook.app/tryon/v1/images/upload", {
      method: "POST",
      headers: { "x-api-key": GENLOOK_API_KEY },
      body: formData,
    });
    
    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      throw new Error(err.message || 'Failed to upload image to Genlook');
    }
    
    const { imageId } = await uploadRes.json();

    // 2. Trigger Try-On
    const tryOnPayload = {
      products: [{
        externalId: product_external_id,
        title: product_name,
        description: product_name,
        images: [{ source: { url: product_image_url } }]
      }],
      person: {
        image: { source: { id: imageId } }
      }
    };

    const tryOnRes = await fetch("https://api.genlook.app/tryon/v1/try-on", {
      method: "POST",
      headers: {
        "x-api-key": GENLOOK_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(tryOnPayload)
    });

    if (!tryOnRes.ok) {
      const err = await tryOnRes.json();
      throw new Error(err.message || 'Failed to start try-on');
    }

    const { generationId } = await tryOnRes.json();

    return new Response(JSON.stringify({ generationId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
