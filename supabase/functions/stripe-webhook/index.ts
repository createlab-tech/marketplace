import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@16";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err instanceof Error ? err.message : "unknown"}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.client_reference_id;
      const paymentIntentId = session.payment_intent as string;

      if (orderId) {
        await supabase
          .from("orders")
          .update({ status: "completed", stripe_payment_intent_id: paymentIntentId })
          .eq("id", orderId);

        // Record seller earnings for each paid order item
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("id, seller_id, seller_earnings")
          .eq("order_id", orderId)
          .not("seller_id", "is", null)
          .gt("seller_earnings", 0);

        if (orderItems && orderItems.length > 0) {
          const earnings = orderItems.map((item: any) => ({
            seller_id: item.seller_id,
            order_id: orderId,
            order_item_id: item.id,
            amount: item.seller_earnings,
            status: "pending",
          }));
          await supabase.from("seller_earnings").insert(earnings);
        }
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.client_reference_id;

      if (orderId) {
        await supabase
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", orderId)
          .eq("status", "pending");
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .eq("status", "pending");
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
