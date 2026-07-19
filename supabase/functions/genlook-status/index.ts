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
    const { generation_id } = await req.json();

    if (!GENLOOK_API_KEY) {
      throw new Error("GENLOOK_API_KEY is not set.");
    }
    
    if (!generation_id) {
      throw new Error("generation_id is required.");
    }

    const res = await fetch(`https://api.genlook.app/tryon/v1/generations/${generation_id}`, {
      method: "GET",
      headers: { "x-api-key": GENLOOK_API_KEY },
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to fetch status');
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
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
