import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { HmacSha256 } from "https://deno.land/std@0.160.0/hash/sha256.ts";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // 1. Get headers and raw body
    const rawBody = await req.text();
    const timestamp = req.headers.get("X-RainyPay-Timestamp") || "";
    const signature = req.headers.get("X-RainyPay-Signature") || "";
    const webhookSecret = Deno.env.get('RAINYPAY_WEBHOOK_SECRET') || "";

    if (!webhookSecret) {
      console.error("RAINYPAY_WEBHOOK_SECRET is missing");
      return new Response("Configuration error", { status: 500 });
    }

    // 2. Verify signature
    const payloadToSign = `${timestamp}.${rawBody}`;
    const hmac = new HmacSha256(webhookSecret);
    hmac.update(payloadToSign);
    const expectedSignature = `sha256=${hmac.hex()}`;

    if (expectedSignature !== signature) {
      console.error("Invalid signature");
      return new Response(JSON.stringify({ ok: false, error: "invalid_signature" }), { status: 401 });
    }

    // 3. Process the event
    const body = JSON.parse(rawBody);
    
    if (body.event === 'payment.paid') {
      const externalId = body.payment.external_id;

      // Update order status in Supabase using Service Role Key (to bypass RLS)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error } = await supabaseAdmin
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', externalId);

      if (error) {
        console.error("Failed to update order:", error);
        return new Response("Failed to update database", { status: 500 });
      }
    }

    return new Response(JSON.stringify({ ok: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
});
