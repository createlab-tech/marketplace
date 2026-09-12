import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface ModelRow {
  id: string;
  seller_id: string | null;
}

interface SellerRow {
  id: string;
  commission_rate: number | string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse(401, { error: "Missing authorization header" });

    const supabaseAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !userData.user) return jsonResponse(401, { error: "Unauthorized" });

    const body: { items: CartItemInput[] } = await req.json();
    const items = body.items;
    if (!items?.length) return jsonResponse(400, { error: "Cart is empty" });

    const total = Math.round(items.reduce((sum, item) => sum + item.price, 0) * 100) / 100;
    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const modelIds = items.map((item) => item.modelId);
    const { data: models } = await supabase.from("models").select("id, seller_id").in("id", modelIds);
    const modelRows = (models ?? []) as ModelRow[];
    const sellerIds = [...new Set(modelRows.map((model) => model.seller_id).filter((id): id is string => Boolean(id)))];
    const { data: sellers } = await supabase.from("sellers").select("id, commission_rate").in("id", sellerIds);
    const sellerMap = new Map<string, number>();
    const sellerRows = (sellers ?? []) as SellerRow[];
    sellerRows.forEach((seller) => sellerMap.set(seller.id, Number(seller.commission_rate) || 0.70));

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ user_id: userData.user.id, total, status: "pending", payment_provider: "paypal" })
      .select("id")
      .single();
    if (orderError || !order) return jsonResponse(500, { error: "Failed to create order" });

    await supabase.from("order_items").insert(items.map((item) => {
      const sellerId = modelRows.find((model) => model.id === item.modelId)?.seller_id ?? null;
      const commissionRate = sellerId ? (sellerMap.get(sellerId) ?? 0.70) : 0.70;
      const sellerEarnings = item.price > 0 ? Math.round(item.price * commissionRate * 100) / 100 : 0;
      return {
        order_id: order.id,
        model_id: item.modelId,
        model_title: item.title,
        price: item.price,
        seller_id: sellerId,
        commission_rate: commissionRate,
        seller_earnings: sellerEarnings,
        platform_fee: Math.round((item.price - sellerEarnings) * 100) / 100,
      };
    }));

    if (total === 0) {
      await supabase.from("orders").update({ status: "completed" }).eq("id", order.id);
      return jsonResponse(200, { freeOrder: true, redirectUrl: "/dashboard?tab=purchases&status=success" });
    }

    const accessToken = await getPayPalAccessToken();
    const origin = req.headers.get("origin") || "http://localhost:5173";
    const paypalOrder = await paypalRequest("/v2/checkout/orders", accessToken, {
      intent: "CAPTURE",
      purchase_units: [{ reference_id: order.id, amount: { currency_code: "USD", value: total.toFixed(2) } }],
      application_context: {
        brand_name: "CreateLab",
        user_action: "PAY_NOW",
        return_url: `${origin}/cart?paypal=success`,
        cancel_url: `${origin}/cart?paypal=cancelled`,
      },
    });
    await supabase.from("orders").update({ paypal_order_id: paypalOrder.id }).eq("id", order.id);

    const approvalUrl = paypalOrder.links?.find((link: { rel: string }) => link.rel === "approve")?.href;
    if (!approvalUrl) return jsonResponse(502, { error: "PayPal approval URL was not returned" });
    return jsonResponse(200, { url: approvalUrl });
  } catch (error) {
    return jsonResponse(500, { error: error instanceof Error ? error.message : "Internal server error" });
  }
});

async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET")?.trim();
  if (!clientId || !clientSecret) throw new Error("PayPal is not configured");
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const payload = await response.json().catch(() => null) as { access_token?: string; error?: string; error_description?: string } | null;
  if (!response.ok || !payload?.access_token) {
    const reason = payload?.error_description || payload?.error || "unknown error";
    throw new Error(`PayPal authentication failed (${response.status}): ${reason}`);
  }
  return payload.access_token;
}

async function paypalRequest(path: string, token: string, body: unknown) {
  const response = await fetch(`${paypalBaseUrl()}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `PayPal request failed (${response.status})`);
  return data;
}

function paypalBaseUrl() {
  const configuredUrl = Deno.env.get("PAYPAL_API_BASE_URL")?.trim().replace(/\/+$/, "");
  if (configuredUrl) return configuredUrl;
  const environment = Deno.env.get("PAYPAL_ENVIRONMENT")?.trim().toLowerCase() || "sandbox";
  if (environment === "live") return "https://api-m.paypal.com";
  if (environment === "sandbox") return "https://api-m.sandbox.paypal.com";
  throw new Error("PAYPAL_ENVIRONMENT must be either sandbox or live");
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}