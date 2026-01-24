import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  price: number;
}

interface OrderConfirmationRequest {
  email: string;
  customerName?: string;
  customerPhone?: string;
  orderNumber: string;
  orderId?: string;
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode?: string;
  paymentMethod: string;
}

const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

// Initialize Supabase client for logging
const getSupabaseClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(supabaseUrl, supabaseServiceKey);
};

const logEmailStatus = async (
  orderId: string | null,
  orderNumber: string,
  recipientEmail: string,
  status: 'sent' | 'failed',
  providerResponse: any,
  errorMessage: string | null
) => {
  try {
    const supabase = getSupabaseClient();
    await supabase.from('email_logs').insert({
      order_id: orderId,
      order_number: orderNumber,
      email_type: 'order_confirmation',
      recipient_email: recipientEmail,
      status,
      provider_response: providerResponse,
      error_message: errorMessage,
    });
  } catch (err) {
    console.error("Failed to log email status:", err);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderConfirmationRequest = await req.json();
    console.log("Sending order confirmation to:", data.email);

    const orderDate = new Date(data.orderDate);
    const formattedDate = orderDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const itemsHtml = data.items
      .map(
        (item, index) => `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f9fafb'};">
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
          <div style="font-weight: 600; color: #111827;">${item.product_name}</div>
          ${item.size || item.color ? `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${[item.size, item.color].filter(Boolean).join(' • ')}</div>` : ''}
        </td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 14px; color: #374151;">${item.quantity}</td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; color: #374151;">${formatPrice(item.price)}</td>
        <td style="padding: 14px 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `
      )
      .join("");

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${data.orderNumber}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Invoice Header -->
    <div style="background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 40px; text-align: center;">
      <h1 style="margin: 0; font-size: 32px; color: #ffffff; font-weight: 700; letter-spacing: -0.5px;">ZEN ZEE</h1>
      <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">Premium Fashion & Lifestyle</p>
    </div>

    <!-- Invoice Title & Status -->
    <div style="padding: 32px 40px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h2 style="margin: 0; font-size: 28px; color: #111827; font-weight: 700;">INVOICE</h2>
        <p style="margin: 8px 0 0; color: #6b7280; font-size: 14px;">#${data.orderNumber}</p>
      </div>
      <div style="text-align: right;">
        <span style="display: inline-block; background-color: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; text-transform: uppercase;">Order Confirmed</span>
      </div>
    </div>

    <!-- Invoice Details Grid -->
    <div style="padding: 32px 40px; background-color: #f9fafb;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 20px;">
            <h4 style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Bill To</h4>
            <p style="margin: 0; font-weight: 600; font-size: 16px; color: #111827;">${data.customerName || 'Valued Customer'}</p>
            <p style="margin: 6px 0 0; color: #4b5563; font-size: 14px;">${data.shippingAddress}</p>
            <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px;">${data.shippingCity}${data.shippingPostalCode ? `, ${data.shippingPostalCode}` : ''}</p>
            <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px;">${data.email}</p>
            ${data.customerPhone ? `<p style="margin: 4px 0 0; color: #4b5563; font-size: 14px;">${data.customerPhone}</p>` : ''}
          </td>
          <td style="width: 50%; vertical-align: top; text-align: right;">
            <table style="margin-left: auto; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 13px; text-align: left; padding-right: 24px;">Invoice Date</td>
                <td style="padding: 6px 0; color: #111827; font-size: 13px; font-weight: 500; text-align: right;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 13px; text-align: left; padding-right: 24px;">Order Number</td>
                <td style="padding: 6px 0; color: #111827; font-size: 13px; font-weight: 600; font-family: 'Courier New', monospace; text-align: right;">${data.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 13px; text-align: left; padding-right: 24px;">Payment Method</td>
                <td style="padding: 6px 0; color: #111827; font-size: 13px; font-weight: 500; text-transform: capitalize; text-align: right;">${data.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6b7280; font-size: 13px; text-align: left; padding-right: 24px;">Status</td>
                <td style="padding: 6px 0; text-align: right;">
                  <span style="color: #166534; font-size: 13px; font-weight: 600;">Paid</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <div style="padding: 32px 40px;">
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background-color: #1f2937;">
            <th style="padding: 14px 16px; text-align: left; font-size: 11px; text-transform: uppercase; color: #ffffff; font-weight: 600; letter-spacing: 0.5px;">Description</th>
            <th style="padding: 14px 16px; text-align: center; font-size: 11px; text-transform: uppercase; color: #ffffff; font-weight: 600; letter-spacing: 0.5px;">Qty</th>
            <th style="padding: 14px 16px; text-align: right; font-size: 11px; text-transform: uppercase; color: #ffffff; font-weight: 600; letter-spacing: 0.5px;">Unit Price</th>
            <th style="padding: 14px 16px; text-align: right; font-size: 11px; text-transform: uppercase; color: #ffffff; font-weight: 600; letter-spacing: 0.5px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
    </div>

    <!-- Totals Section -->
    <div style="padding: 0 40px 32px;">
      <table style="width: 100%; max-width: 320px; margin-left: auto; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Subtotal</td>
          <td style="padding: 10px 0; text-align: right; font-size: 14px; color: #374151;">${formatPrice(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Shipping & Handling</td>
          <td style="padding: 10px 0; text-align: right; font-size: 14px; color: #374151;">${data.shipping === 0 ? 'FREE' : formatPrice(data.shipping)}</td>
        </tr>
        ${data.discount > 0 ? `
        <tr>
          <td style="padding: 10px 0; color: #059669; font-size: 14px;">Discount</td>
          <td style="padding: 10px 0; text-align: right; font-size: 14px; color: #059669; font-weight: 500;">-${formatPrice(data.discount)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #1f2937;">
          <td style="padding: 16px 0; font-weight: 700; font-size: 18px; color: #111827;">Total Due</td>
          <td style="padding: 16px 0; text-align: right; font-weight: 700; font-size: 20px; color: #111827;">${formatPrice(data.total)}</td>
        </tr>
      </table>
    </div>

    <!-- Shipping Info -->
    <div style="margin: 0 40px 32px; padding: 24px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
      <h4 style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #166534; font-weight: 600; letter-spacing: 0.5px;">Shipping To</h4>
      <p style="margin: 0; font-weight: 600; color: #111827; font-size: 15px;">${data.customerName || 'Valued Customer'}</p>
      <p style="margin: 6px 0 0; color: #4b5563; font-size: 14px;">${data.shippingAddress}</p>
      <p style="margin: 4px 0 0; color: #4b5563; font-size: 14px;">${data.shippingCity}${data.shippingPostalCode ? ` - ${data.shippingPostalCode}` : ''}</p>
    </div>

    <!-- Thank You Note -->
    <div style="margin: 0 40px 32px; text-align: center; padding: 24px; background-color: #fef3c7; border-radius: 8px;">
      <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: 600;">Thank you for shopping with Zen Zee!</p>
      <p style="margin: 8px 0 0; font-size: 14px; color: #a16207;">We appreciate your business and hope you enjoy your purchase.</p>
    </div>

    <!-- Footer -->
    <div style="background-color: #1f2937; padding: 32px 40px; text-align: center;">
      <p style="color: #9ca3af; font-size: 14px; margin: 0 0 8px;">Questions about your order?</p>
      <p style="margin: 0;">
        <a href="mailto:support@zen-zee.store" style="color: #60a5fa; text-decoration: none; font-weight: 500;">support@zen-zee.store</a>
      </p>
      <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #374151;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">Zen Zee Store</p>
        <p style="color: #6b7280; font-size: 12px; margin: 4px 0 0;">Premium Fashion & Lifestyle</p>
        <p style="color: #4b5563; font-size: 11px; margin: 16px 0 0;">© ${new Date().getFullYear()} Zen Zee. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    console.log("Attempting to send order confirmation email to:", data.email);
    console.log("Order details:", { orderNumber: data.orderNumber, items: data.items?.length });

    const emailResponse = await resend.emails.send({
      from: "Zen Zee Store <order-confirmation@gen-zee.store>",
      to: [data.email],
      subject: `Invoice #${data.orderNumber} - Order Confirmed | Zen Zee`,
      html: emailHtml,
    });

    if (emailResponse?.error) {
      console.error("Resend error (order-confirmation):", emailResponse.error);
      
      // Log failed email
      await logEmailStatus(
        data.orderId || null,
        data.orderNumber,
        data.email,
        'failed',
        emailResponse,
        emailResponse.error.message
      );

      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error.message }),
        {
          status: 502,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Order confirmation email sent successfully:", emailResponse);

    // Log successful email
    await logEmailStatus(
      data.orderId || null,
      data.orderNumber,
      data.email,
      'sent',
      emailResponse,
      null
    );

    return new Response(JSON.stringify({ success: true, data: emailResponse.data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order confirmation:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return new Response(
      JSON.stringify({ error: error.message, details: error }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
