import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface OrderItemRow {
  id: string;
  seller_id: string;
  seller_earnings: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse(401, { error: "Missing authorization header" });
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser();
    if (userError || !userData.user) return jsonResponse(401, { error: "Unauthorized" });

    const { paypalOrderId } = await req.json() as { paypalOrderId?: string };
    if (!paypalOrderId) return jsonResponse(400, { error: "Missing PayPal order ID" });

    const supabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("paypal_order_id", paypalOrderId)
      .eq("user_id", userData.user.id)
      .single();
    if (orderError || !order) return jsonResponse(404, { error: "PayPal order was not found" });
    if (order.status === "completed") return jsonResponse(200, { success: true });
    if (order.status !== "pending") return jsonResponse(409, { error: "Order is no longer payable" });

    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${paypalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: "{}",
    });
    const capture = await response.json();
    if (!response.ok) throw new Error(capture.message || `PayPal capture failed (${response.status})`);
    if (capture.status !== "COMPLETED") return jsonResponse(402, { error: "PayPal payment was not completed" });

    const captureId = capture.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
    await supabase.from("orders").update({ status: "completed", paypal_capture_id: captureId }).eq("id", order.id).eq("status", "pending");
    const { data: orderItems } = await supabase.from("order_items").select("id, seller_id, seller_earnings").eq("order_id", order.id).not("seller_id", "is", null).gt("seller_earnings", 0);
    if (orderItems?.length) {
      await supabase.from("seller_earnings").insert((orderItems as OrderItemRow[]).map((item) => ({ seller_id: item.seller_id, order_id: order.id, order_item_id: item.id, amount: item.seller_earnings, status: "pending" })));
    }
    return jsonResponse(200, { success: true });
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