import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

interface NewOrderRequest {
  orderId: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  totalAmount: number;
  items: OrderItem[];
  shippingAddress: string;
  shippingCity: string;
  paymentMethod: string;
}

const formatPrice = (amount: number) => `৳${amount.toLocaleString('en-BD')}`;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const orderData: NewOrderRequest = await req.json();

    console.log("Processing new order notification:", orderData.orderNumber);

    // Fetch all admin users with their notification preferences
    const { data: adminRoles, error: rolesError } = await supabaseClient
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admins found to notify");
      return new Response(JSON.stringify({ message: "No admins to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get admin profiles with emails
    const adminUserIds = adminRoles.map(role => role.user_id);
    
    const { data: adminProfiles, error: profilesError } = await supabaseClient
      .from("profiles")
      .select("user_id, email, full_name")
      .in("user_id", adminUserIds);

    if (profilesError) {
      console.error("Error fetching admin profiles:", profilesError);
      throw profilesError;
    }

    // Check notification preferences for each admin
    const { data: notificationSettings, error: settingsError } = await supabaseClient
      .from("admin_notification_settings")
      .select("*")
      .in("user_id", adminUserIds);

    // Build list of admins to notify
    const adminsToNotify: Array<{ email: string; name: string }> = [];

    for (const profile of adminProfiles || []) {
      if (!profile.email) continue;

      // Find notification settings for this admin
      const settings = notificationSettings?.find(s => s.user_id === profile.user_id);
      
      // Default to sending notifications if no settings exist
      const shouldNotify = !settings || (settings.email_notifications !== false);
      
      if (shouldNotify) {
        adminsToNotify.push({
          email: profile.email,
          name: profile.full_name || "Admin"
        });
      }
    }

    if (adminsToNotify.length === 0) {
      console.log("No admins opted in for notifications");
      return new Response(JSON.stringify({ message: "No admins opted in for notifications" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Build email content
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.product_name}</strong>
          ${item.size ? `<br><span style="color: #666; font-size: 12px;">Size: ${item.size}</span>` : ''}
          ${item.color ? `<br><span style="color: #666; font-size: 12px;">Color: ${item.color}</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 30px; text-align: center;">
            <h1 style="color: #000; margin: 0; font-size: 24px;">🛒 New Order Received!</h1>
            <p style="color: rgba(0,0,0,0.7); margin: 10px 0 0 0; font-size: 14px;">Order ${orderData.orderNumber}</p>
          </div>

          <!-- Order Summary -->
          <div style="padding: 30px;">
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333;">Order Details</h2>
              <p style="margin: 5px 0; color: #666;"><strong>Order ID:</strong> ${orderData.orderNumber}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Customer:</strong> ${orderData.customerName || 'N/A'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> ${orderData.customerEmail || 'N/A'}</p>
              <p style="margin: 5px 0; color: #666;"><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
            </div>

            <!-- Items Table -->
            <h3 style="margin: 20px 0 10px; font-size: 16px; color: #333;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="padding: 12px; text-align: left; font-weight: 600;">Product</th>
                  <th style="padding: 12px; text-align: center; font-weight: 600;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-weight: 600;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #FFD700;">
                  <td colspan="2" style="padding: 15px; font-weight: bold; font-size: 16px;">Total Amount</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px;">${formatPrice(orderData.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Shipping Address -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px;">
              <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">📍 Delivery Address</h3>
              <p style="margin: 0; color: #666; line-height: 1.6;">
                ${orderData.shippingAddress}<br>
                ${orderData.shippingCity}
              </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get("SITE_URL") || "https://gen-zee.store"}/admin/orders" 
                 style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                View Order in Dashboard
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              This is an automated notification from Gen-zee Store Admin System
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails to all admins
    const emailPromises = adminsToNotify.map(admin => 
      resend.emails.send({
        from: "Gen-zee Orders <orders@gen-zee.store>",
        to: [admin.email],
        subject: `🛒 New Order: ${orderData.orderNumber} - ${formatPrice(orderData.totalAmount)}`,
        html: emailHtml,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Notifications sent: ${successCount} success, ${failCount} failed`);

    // Log the email notification
    await supabaseClient.from("email_logs").insert({
      email_type: "new_order_admin_notification",
      recipient_email: adminsToNotify.map(a => a.email).join(", "),
      order_id: orderData.orderId,
      order_number: orderData.orderNumber,
      status: failCount === 0 ? "sent" : "partial",
      provider_response: { 
        success: successCount, 
        failed: failCount,
        admins_notified: adminsToNotify.map(a => a.email)
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      notified: successCount,
      failed: failCount 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in new-order-notification function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
