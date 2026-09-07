import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@16";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CartItemInput {
  modelId: string;
  title: string;
  price: number;
  image_url: string;
  slug: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse(401, { error: "Missing authorization header" });
    }

    const supabaseAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } } as any,
    });

    const { data: userData, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse(401, { error: "Unauthorized" });
    }
    const userId = userData.user.id;
    const userEmail = userData.user.email;

    const body: { items: CartItemInput[] } = await req.json();
    const items = body.items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return jsonResponse(400, { error: "Cart is empty" });
    }

    const total = items.reduce((sum, i) => sum + i.price, 0);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Look up seller info for each model to determine commission rates
    const modelIds = items.map((i) => i.modelId);
    const { data: models } = await supabaseAdmin
      .from("models")
      .select("id, seller_id, is_free, price")
      .in("id", modelIds);

    const sellerIds = [...new Set((models ?? []).map((m: any) => m.seller_id).filter(Boolean))];
    const { data: sellers } = await supabaseAdmin
      .from("sellers")
      .select("id, commission_rate")
      .in("id", sellerIds);

    const sellerMap = new Map<string, number>();
    (sellers ?? []).forEach((s: any) => sellerMap.set(s.id, Number(s.commission_rate) || 0.70));

    // Create order in pending state
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({ user_id: userId, total, status: "pending" })
      .select("*")
      .single();

    if (orderError) {
      return jsonResponse(500, { error: "Failed to create order" });
    }

    // Build order items with commission data
    const orderItems = items.map((item) => {
      const model = (models ?? []).find((m: any) => m.id === item.modelId);
      const sellerId = model?.seller_id ?? null;
      const commissionRate = sellerId ? (sellerMap.get(sellerId) ?? 0.70) : 0.70;
      const sellerEarnings = item.price > 0 ? Math.round(item.price * commissionRate * 100) / 100 : 0;
      const platformFee = Math.round((item.price - sellerEarnings) * 100) / 100;

      return {
        order_id: order.id,
        model_id: item.modelId,
        model_title: item.title,
        price: item.price,
        seller_id: sellerId,
        commission_rate: commissionRate,
        seller_earnings: sellerEarnings,
        platform_fee: platformFee,
      };
    });
    await supabaseAdmin.from("order_items").insert(orderItems);

    // If everything is free, complete the order without Stripe
    if (total === 0) {
      await supabaseAdmin.from("orders").update({ status: "completed" }).eq("id", order.id);
      return jsonResponse(200, { freeOrder: true, redirectUrl: `/dashboard?tab=purchases&status=success` });
    }

    // Create Stripe Checkout Session
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });
    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${origin}/dashboard?tab=purchases&status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?status=cancelled`,
      customer_email: userEmail || undefined,
      client_reference_id: order.id,
      line_items: items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { name: item.title },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      })),
    });

    await supabaseAdmin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    return jsonResponse(200, { url: session.url });
  } catch (err) {
    return jsonResponse(500, { error: err instanceof Error ? err.message : "Internal server error" });
  }
});

function jsonResponse(status: number, body: any) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
