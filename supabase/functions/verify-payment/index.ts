import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    // Create Supabase client with service role for updating orders
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse request body
    const { sessionId, orderId } = await req.json();
    logStep("Request parsed", { sessionId, orderId });

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    
    logStep("Session retrieved", { 
      status: session.status, 
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total 
    });

    if (session.payment_status === "paid") {
      // Update order status to confirmed/paid
      const orderIdToUpdate = orderId || session.metadata?.order_id;
      
      if (orderIdToUpdate) {
        const { error: updateError } = await supabaseClient
          .from("orders")
          .update({ 
            status: "confirmed",
            notes: `Card payment confirmed. Stripe Session: ${sessionId}`,
            updated_at: new Date().toISOString()
          })
          .eq("id", orderIdToUpdate);

        if (updateError) {
          logStep("Error updating order", { error: updateError.message });
        } else {
          logStep("Order updated to confirmed", { orderId: orderIdToUpdate });
        }

        // Get order details for confirmation email
        const { data: order } = await supabaseClient
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderIdToUpdate)
          .single();

        if (order) {
          // Get user email
          const { data: profile } = await supabaseClient
            .from("profiles")
            .select("email, full_name")
            .eq("user_id", order.user_id)
            .single();

          if (profile?.email) {
            // Send confirmation email
            try {
              await supabaseClient.functions.invoke("order-confirmation", {
                body: {
                  email: profile.email,
                  customerName: profile.full_name || "Valued Customer",
                  orderNumber: order.order_number,
                  orderId: order.id,
                  orderDate: order.created_at,
                  items: order.order_items,
                  subtotal: order.total_amount,
                  shipping: 0,
                  discount: order.discount_amount || 0,
                  total: order.total_amount,
                  shippingAddress: order.shipping_address,
                  shippingCity: order.shipping_city,
                  shippingPostalCode: order.shipping_postal_code || "",
                  paymentMethod: "card",
                },
              });
              logStep("Confirmation email sent");
            } catch (emailError) {
              logStep("Failed to send confirmation email", { error: emailError });
            }
          }
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          paid: true,
          sessionId: session.id,
          orderId: orderIdToUpdate
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          paid: false,
          status: session.payment_status 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
