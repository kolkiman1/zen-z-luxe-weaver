import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CreateGuestOrderPayload = {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  order: {
    total_amount: number;
    discount_code_id: string | null;
    discount_amount: number;
    shipping_address: string;
    shipping_city: string;
    shipping_postal_code: string | null;
    payment_method: string;
    notes?: string;
    status?: string;
  };
  items: Array<{
    product_id: string;
    product_name: string;
    product_image?: string | null;
    quantity: number;
    size?: string | null;
    color?: string | null;
    price: number;
  }>;
};

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidBDPhone = (phone: string) => {
  const cleaned = phone.replace(/[\s\-\+]/g, "");
  const bdPhoneRegex = /^(?:\+?880)?0?1[3-9]\d{8}$/;
  return bdPhoneRegex.test(cleaned);
};

const makeOrderNumber = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const nonce = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${nonce}`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as CreateGuestOrderPayload;

    if (!body?.customer?.email || !body?.customer?.phone) {
      return new Response(JSON.stringify({ error: "Email and phone are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidEmail(body.customer.email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isValidBDPhone(body.customer.phone)) {
      return new Response(JSON.stringify({ error: "Invalid phone number format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body?.order || typeof body.order.total_amount !== "number") {
      return new Response(JSON.stringify({ error: "Order payload is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "At least one item is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const orderNumber = makeOrderNumber();
    const guestNote = ` | GUEST ORDER | Name: ${body.customer.name} | Email: ${body.customer.email} | Phone: ${body.customer.phone}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: null,
        order_number: orderNumber,
        total_amount: body.order.total_amount,
        discount_code_id: body.order.discount_code_id ?? null,
        discount_amount: body.order.discount_amount ?? 0,
        shipping_address: body.order.shipping_address,
        shipping_city: body.order.shipping_city,
        shipping_postal_code: body.order.shipping_postal_code ?? null,
        payment_method: body.order.payment_method || "cod",
        notes: `${body.order.notes ?? ""}${guestNote}`.trim(),
        status: body.order.status ?? "pending",
      })
      .select("*")
      .single();

    if (orderError || !order) {
      console.error("Failed to create guest order", orderError);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderItems = body.items.map((it) => ({
      order_id: order.id,
      product_id: it.product_id,
      product_name: it.product_name,
      product_image: it.product_image ?? null,
      quantity: it.quantity,
      size: it.size ?? null,
      color: it.color ?? null,
      price: it.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      console.error("Failed to create guest order items", itemsError);
      // Best-effort cleanup to avoid orphan orders
      await supabase.from("orders").delete().eq("id", order.id);
      return new Response(JSON.stringify({ error: "Failed to create order items" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          discount_amount: order.discount_amount,
          shipping_address: order.shipping_address,
          shipping_city: order.shipping_city,
          shipping_postal_code: order.shipping_postal_code,
          payment_method: order.payment_method,
          created_at: order.created_at,
          updated_at: order.updated_at,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
