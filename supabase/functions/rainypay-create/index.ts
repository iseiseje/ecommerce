import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { amount, redirect_url } = await req.json();

    if (!amount || amount <= 0) {
      throw new Error("Invalid amount");
    }

    // 1. Create Order in Supabase
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({ user_id: user.id, amount, status: 'pending' })
      .select('id')
      .single();

    if (orderError) throw orderError;
    if (!order) throw new Error("Gagal membuat pesanan di database. Coba lagi.");

    // 2. Call RainyPay API
    const RAINYPAY_API_KEY = Deno.env.get('RAINYPAY_API_KEY');
    const RAINYPAY_WEBHOOK_URL = Deno.env.get('RAINYPAY_WEBHOOK_URL'); // e.g. https://<project>.supabase.co/functions/v1/rainypay-webhook

    if (!RAINYPAY_API_KEY) {
      throw new Error("RAINYPAY_API_KEY belum dikonfigurasi di server.");
    }

    const payload: any = {
      amount: parseInt(amount),
      external_id: order.id,
      description: "Order Checkout",
      fee_mode: "customer", // customer pays the fee
      expiry_minutes: 15,
    };

    // RainyPay hanya menerima http/https untuk redirect URL
    if (redirect_url && redirect_url.startsWith('http')) {
      payload.success_redirect_url = redirect_url;
      payload.failed_redirect_url = redirect_url;
    } else {
      payload.success_redirect_url = "https://axkgduqdqwnyvhzpkrnj.supabase.co"; // Fallback URL valid
      payload.failed_redirect_url = "https://axkgduqdqwnyvhzpkrnj.supabase.co";
    }

    if (RAINYPAY_WEBHOOK_URL) {
      payload.webhook_url = RAINYPAY_WEBHOOK_URL;
    }

    const res = await fetch("https://rainyfeel.com/api/rainypay/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RAINYPAY_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `create-order-${order.id}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = 'Failed to create payment in RainyPay';
      try {
         const errJson = JSON.parse(errText);
         errMsg = errJson.message || errMsg;
      } catch (e) {
         errMsg = errText || errMsg;
      }
      throw new Error(errMsg);
    }

    const data = await res.json();

    // 3. Update Order with checkout_url
    await supabaseClient
      .from('orders')
      .update({ checkout_url: data.payment.checkout_url })
      .eq('id', order.id);

    return new Response(JSON.stringify({ checkout_url: data.payment.checkout_url, order_id: order.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error) || "Unknown error";
    console.error("Checkout Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
