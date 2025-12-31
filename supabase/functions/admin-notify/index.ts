import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: 'admin_action' | 'security_event';
  action?: string;
  actorEmail?: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  eventType?: string;
  severity?: string;
  userEmail?: string;
}

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    admin_added: 'Added Admin',
    admin_removed: 'Removed Admin',
    admin_invite_created: 'Created Admin Invite',
    admin_invite_cancelled: 'Cancelled Admin Invite',
    product_created: 'Created Product',
    product_updated: 'Updated Product',
    product_deleted: 'Deleted Product',
    order_status_updated: 'Updated Order Status',
    discount_created: 'Created Discount',
    discount_updated: 'Updated Discount',
    discount_deleted: 'Deleted Discount',
    announcement_created: 'Created Announcement',
    announcement_updated: 'Updated Announcement',
    announcement_deleted: 'Deleted Announcement',
    campaign_created: 'Created Campaign',
    campaign_deleted: 'Deleted Campaign',
    inquiry_updated: 'Updated Inquiry',
  };
  return labels[action] || action;
};

const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444',
  };
  return colors[severity] || '#6b7280';
};

const getSecurityEventLabel = (eventType: string): string => {
  const labels: Record<string, string> = {
    failed_login: 'Failed Login Attempt',
    rate_limit_hit: 'Rate Limit Exceeded',
    suspicious_activity: 'Suspicious Activity Detected',
    unauthorized_access: 'Unauthorized Access Attempt',
  };
  return labels[eventType] || eventType;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping email notifications");
      return new Response(
        JSON.stringify({ success: false, message: "Email notifications not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: NotificationRequest = await req.json();
    const { type, action, actorEmail, targetType, details, eventType, severity, userEmail } = body;

    console.log(`Processing ${type} notification:`, body);

    // Get all admins who have email notifications enabled
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw new Error("Failed to fetch admin roles");
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admins found to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get notification settings for admins
    const adminUserIds = adminRoles.map(r => r.user_id);
    const { data: notificationSettings } = await supabase
      .from('admin_notification_settings')
      .select('*')
      .in('user_id', adminUserIds);

    // Get admin emails from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .in('user_id', adminUserIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error("Failed to fetch admin profiles");
    }

    // Filter admins based on notification preferences
    const adminsToNotify = profiles?.filter(profile => {
      const settings = notificationSettings?.find(s => s.user_id === profile.user_id);
      
      // Skip the actor for admin actions (don't notify yourself)
      if (type === 'admin_action' && profile.email === actorEmail) {
        return false;
      }

      // If no settings, default to receiving notifications
      if (!settings) {
        return true;
      }

      // Check if email notifications are enabled
      if (!settings.email_notifications) {
        return false;
      }

      // Check notification type preferences
      if (type === 'admin_action' && !settings.notify_on_admin_actions) {
        return false;
      }

      if (type === 'security_event') {
        if (!settings.notify_on_security_events) {
          return false;
        }
        // Check if only critical notifications
        if (settings.notify_on_critical_only && severity !== 'critical') {
          return false;
        }
      }

      return true;
    }) || [];

    if (adminsToNotify.length === 0) {
      console.log("No admins want to receive this notification");
      return new Response(
        JSON.stringify({ success: true, message: "No admins opted in for this notification" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email content
    let subject: string;
    let htmlContent: string;
    const timestamp = new Date().toLocaleString('en-US', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    });

    if (type === 'admin_action') {
      subject = `[Admin Alert] ${getActionLabel(action || '')} - Gen-zee.store`;
      
      const detailsHtml = details ? Object.entries(details)
        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
        .join('') : '';

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 500; background: #0f172a; color: white; }
            .content { color: #374151; line-height: 1.6; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <h1 class="title">Admin Action Notification</h1>
              </div>
              <div class="content">
                <p><span class="badge">${getActionLabel(action || '')}</span></p>
                <p><strong>Performed by:</strong> ${actorEmail}</p>
                <p><strong>Target:</strong> ${targetType}</p>
                <p><strong>Time:</strong> ${timestamp}</p>
                ${detailsHtml ? `<h3>Details</h3><ul>${detailsHtml}</ul>` : ''}
              </div>
              <div class="footer">
                <p>You received this email because you're an admin at Gen-zee.store</p>
                <p>To manage notification settings, visit the Admin Dashboard.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      // Security event
      const severityColor = getSeverityColor(severity || 'low');
      subject = `[Security Alert] ${getSecurityEventLabel(eventType || '')} - Gen-zee.store`;
      
      const detailsHtml = details ? Object.entries(details)
        .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
        .join('') : '';

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header { border-bottom: 2px solid ${severityColor}; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-size: 20px; font-weight: 600; color: #0f172a; margin: 0; }
            .severity { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 14px; font-weight: 500; background: ${severityColor}; color: white; text-transform: uppercase; }
            .content { color: #374151; line-height: 1.6; }
            .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 16px 0; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <h1 class="title">🚨 Security Alert</h1>
              </div>
              <div class="content">
                <p><span class="severity">${severity?.toUpperCase()}</span></p>
                <div class="alert-box">
                  <strong>${getSecurityEventLabel(eventType || '')}</strong>
                  ${userEmail ? `<p>User: ${userEmail}</p>` : ''}
                </div>
                <p><strong>Time:</strong> ${timestamp}</p>
                ${detailsHtml ? `<h3>Details</h3><ul>${detailsHtml}</ul>` : ''}
              </div>
              <div class="footer">
                <p>You received this email because you're an admin at Gen-zee.store</p>
                <p>To manage notification settings, visit the Security Dashboard.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send emails to all admins using Resend API
    const emailPromises = adminsToNotify.map(async (admin): Promise<boolean> => {
      try {
        if (!admin.email) {
          console.log(`No email for admin ${admin.user_id}`);
          return false;
        }

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Gen-Zee Store <onboarding@resend.dev>",
            to: [admin.email],
            subject,
            html: htmlContent,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error(`Failed to send email to ${admin.email}: ${errorText}`);
          return false;
        }

        const result = await emailResponse.json();
        console.log(`Email sent to ${admin.email}:`, result);
        return true;
      } catch (emailError) {
        console.error(`Failed to send email to ${admin.email}:`, emailError);
        return false;
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r: boolean) => r).length;

    console.log(`Successfully sent ${successCount}/${adminsToNotify.length} notification emails`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Sent ${successCount} notifications`,
        count: successCount 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Admin notification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
