import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
  orderNumber: string;
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderConfirmationRequest = await req.json();
    console.log("Sending order confirmation to:", data.email);

    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 500;">${item.product_name}</div>
          ${item.size || item.color ? `<div style="color: #6b7280; font-size: 12px;">${[item.size, item.color].filter(Boolean).join(' / ')}</div>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatPrice(item.price)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `
      )
      .join("");

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #f3f4f6; padding-bottom: 24px;">
      <h1 style="margin: 0; font-size: 28px; color: #111827;">Gen-zee.store</h1>
      <p style="margin: 8px 0 0; color: #6b7280;">Premium Fashion & Lifestyle</p>
    </div>

    <!-- Success Icon -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; background-color: #10b981; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">✓</span>
      </div>
    </div>

    <h2 style="text-align: center; margin: 0 0 8px; font-size: 24px; color: #111827;">Order Confirmed!</h2>
    <p style="text-align: center; color: #6b7280; margin: 0 0 32px;">Thank you for your order, ${data.customerName || 'valued customer'}!</p>

    <!-- Order Info -->
    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Order Number</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600; font-family: monospace;">${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Order Date</td>
          <td style="padding: 4px 0; text-align: right;">${new Date(data.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Payment Method</td>
          <td style="padding: 4px 0; text-align: right; text-transform: capitalize;">${data.paymentMethod}</td>
        </tr>
      </table>
    </div>

    <!-- Items Table -->
    <h3 style="margin: 0 0 16px; font-size: 16px; color: #111827;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #f9fafb;">
          <th style="padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">Item</th>
          <th style="padding: 12px; text-align: center; font-size: 12px; text-transform: uppercase; color: #6b7280;">Qty</th>
          <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Price</th>
          <th style="padding: 12px; text-align: right; font-size: 12px; text-transform: uppercase; color: #6b7280;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="border-top: 2px solid #f3f4f6; padding-top: 16px; margin-bottom: 24px;">
      <table style="width: 100%; max-width: 250px; margin-left: auto; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
          <td style="padding: 8px 0; text-align: right;">${formatPrice(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
          <td style="padding: 8px 0; text-align: right;">${data.shipping === 0 ? 'Free' : formatPrice(data.shipping)}</td>
        </tr>
        ${data.discount > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: #10b981;">Discount</td>
          <td style="padding: 8px 0; text-align: right; color: #10b981;">-${formatPrice(data.discount)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #111827;">
          <td style="padding: 12px 0; font-weight: 700; font-size: 18px;">Total</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px;">${formatPrice(data.total)}</td>
        </tr>
      </table>
    </div>

    <!-- Shipping Address -->
    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #6b7280;">Shipping Address</h4>
      <p style="margin: 0; font-weight: 500;">${data.shippingCity}</p>
      <p style="margin: 4px 0 0; color: #6b7280;">${data.shippingAddress}</p>
      ${data.shippingPostalCode ? `<p style="margin: 4px 0 0; color: #6b7280;">${data.shippingPostalCode}</p>` : ''}
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Need help? Contact us at support@gen-zee.store</p>
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Gen-zee.store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    console.log("Attempting to send order confirmation email to:", data.email);
    console.log("Order details:", { orderNumber: data.orderNumber, items: data.items?.length });

    const emailResponse = await resend.emails.send({
      from: "Gen-zee.store <onboarding@resend.dev>",
      to: [data.email],
      subject: `Order Confirmed - ${data.orderNumber}`,
      html: emailHtml,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
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
