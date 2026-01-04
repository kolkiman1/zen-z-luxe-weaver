import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber, email, phone } = await req.json();

    // Input validation
    if (!orderNumber || typeof orderNumber !== "string") {
      console.log("Missing or invalid order number");
      return new Response(
        JSON.stringify({ error: "Order number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email && !phone) {
      console.log("Missing email and phone");
      return new Response(
        JSON.stringify({ error: "Email or phone number is required for verification" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log("Invalid email format:", email);
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate phone format if provided (Bangladesh format)
    if (phone) {
      const cleaned = phone.replace(/[\s\-\+]/g, "");
      const bdPhoneRegex = /^(?:\+?880)?0?1[3-9]\d{8}$/;
      if (!bdPhoneRegex.test(cleaned)) {
        console.log("Invalid phone format:", phone);
        return new Response(
          JSON.stringify({ error: "Invalid phone number format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Initialize Supabase client with service role for unrestricted access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Looking up order:", orderNumber);

    // Find order by order_number (only guest orders - user_id is null)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber.trim().toUpperCase())
      .is("user_id", null)
      .maybeSingle();

    if (orderError) {
      console.error("Database error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to lookup order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order) {
      console.log("Order not found or not a guest order:", orderNumber);
      return new Response(
        JSON.stringify({ error: "Order not found. Please check your order number." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract guest info from notes to verify ownership
    // Format: "... | GUEST ORDER | Name: ... | Email: ... | Phone: ..."
    const notes = order.notes || "";
    const emailMatch = notes.match(/Email:\s*([^\s|]+)/i);
    const phoneMatch = notes.match(/Phone:\s*([^\s|]+)/i);
    
    const orderEmail = emailMatch ? emailMatch[1].toLowerCase().trim() : null;
    const orderPhone = phoneMatch ? phoneMatch[1].replace(/[\s\-\+]/g, "") : null;

    console.log("Order contact info - Email:", orderEmail, "Phone:", orderPhone);

    // Verify ownership by email or phone
    let verified = false;

    if (email && orderEmail) {
      verified = email.toLowerCase().trim() === orderEmail;
    }

    if (!verified && phone && orderPhone) {
      const cleanedInputPhone = phone.replace(/[\s\-\+]/g, "");
      // Normalize both to last 10 digits for comparison
      const normalizedOrder = orderPhone.slice(-10);
      const normalizedInput = cleanedInputPhone.slice(-10);
      verified = normalizedOrder === normalizedInput;
    }

    if (!verified) {
      console.log("Verification failed for order:", orderNumber);
      return new Response(
        JSON.stringify({ error: "Verification failed. Please check your email or phone number." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Order verified, fetching items");

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    if (itemsError) {
      console.error("Failed to fetch order items:", itemsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch order details" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract customer name from notes
    const nameMatch = notes.match(/Name:\s*([^|]+)/i);
    const customerName = nameMatch ? nameMatch[1].trim() : "Guest";

    // Return sanitized order data (exclude sensitive internal notes)
    const sanitizedOrder = {
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
      customer_name: customerName,
    };

    console.log("Successfully returning order data for:", orderNumber);

    return new Response(
      JSON.stringify({ order: sanitizedOrder, items }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
