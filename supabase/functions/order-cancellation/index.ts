import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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

interface OrderCancellationRequest {
  email: string;
  customerName?: string;
  orderNumber: string;
  orderDate: string;
  cancellationDate: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode?: string;
  paymentMethod: string;
  reason?: string;
}

const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderCancellationRequest = await req.json();
    console.log("Sending order cancellation to:", data.email);

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
  <title>Order Cancellation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #f3f4f6; padding-bottom: 24px;">
      <h1 style="margin: 0; font-size: 28px; color: #111827;">Gen-zee.store</h1>
      <p style="margin: 8px 0 0; color: #6b7280;">Premium Fashion & Lifestyle</p>
    </div>

    <!-- Cancelled Icon -->
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; background-color: #ef4444; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 32px;">✕</span>
      </div>
    </div>

    <h2 style="text-align: center; margin: 0 0 8px; font-size: 24px; color: #111827;">Order Cancelled</h2>
    <p style="text-align: center; color: #6b7280; margin: 0 0 32px;">Your order has been cancelled, ${data.customerName || 'valued customer'}.</p>

    <!-- Order Info -->
    <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #fecaca;">
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
          <td style="padding: 4px 0; color: #6b7280;">Cancellation Date</td>
          <td style="padding: 4px 0; text-align: right;">${new Date(data.cancellationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6b7280;">Status</td>
          <td style="padding: 4px 0; text-align: right; color: #ef4444; font-weight: 600;">CANCELLED</td>
        </tr>
      </table>
    </div>

    <!-- Cancellation Notice -->
    <div style="background-color: #fffbeb; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #fde68a;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        <strong>Refund Information:</strong> If you have already made a payment, your refund will be processed within 5-7 business days. For bKash/Nagad payments, the amount will be returned to your original payment method.
      </p>
    </div>

    <!-- Items Table (Cancelled Invoice) -->
    <h3 style="margin: 0 0 16px; font-size: 16px; color: #111827;">Cancelled Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; opacity: 0.7;">
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
          <td style="padding: 8px 0; text-align: right; text-decoration: line-through; color: #9ca3af;">${formatPrice(data.subtotal)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Shipping</td>
          <td style="padding: 8px 0; text-align: right; text-decoration: line-through; color: #9ca3af;">${data.shipping === 0 ? 'Free' : formatPrice(data.shipping)}</td>
        </tr>
        ${data.discount > 0 ? `
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Discount</td>
          <td style="padding: 8px 0; text-align: right; text-decoration: line-through; color: #9ca3af;">-${formatPrice(data.discount)}</td>
        </tr>
        ` : ''}
        <tr style="border-top: 2px solid #ef4444;">
          <td style="padding: 12px 0; font-weight: 700; font-size: 18px; color: #ef4444;">Refund Amount</td>
          <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #ef4444;">${formatPrice(data.total)}</td>
        </tr>
      </table>
    </div>

    <!-- Shipping Address -->
    <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 8px; font-size: 14px; text-transform: uppercase; color: #6b7280;">Original Shipping Address</h4>
      <p style="margin: 0; font-weight: 500;">${data.shippingCity}</p>
      <p style="margin: 4px 0 0; color: #6b7280;">${data.shippingAddress}</p>
      ${data.shippingPostalCode ? `<p style="margin: 4px 0 0; color: #6b7280;">${data.shippingPostalCode}</p>` : ''}
    </div>

    <!-- Continue Shopping CTA -->
    <div style="text-align: center; margin-bottom: 24px;">
      <p style="color: #6b7280; margin: 0 0 16px;">We're sorry to see this order cancelled. We hope to serve you again soon!</p>
      <a href="https://gen-zee.store" style="display: inline-block; background-color: #111827; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">Continue Shopping</a>
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

    const emailResponse = await resend.emails.send({
      from: "Gen-zee.store <onboarding@resend.dev>",
      to: [data.email],
      subject: `Order Cancelled - ${data.orderNumber}`,
      html: emailHtml,
    });

    console.log("Order cancellation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order cancellation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
