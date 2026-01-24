import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  user_email: string | null;
  ip_address: string | null;
  created_at: string;
  resolved: boolean;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  highEvents: number;
  mediumEvents: number;
  lowEvents: number;
  unresolvedEvents: number;
  eventsByType: Record<string, number>;
  topIPs: { ip: string; count: number }[];
  topEmails: { email: string; count: number }[];
}

function getEventTypeLabel(eventType: string): string {
  const labels: Record<string, string> = {
    failed_login: 'Failed Login Attempts',
    rate_limit_hit: 'Rate Limit Violations',
    suspicious_activity: 'Suspicious Activity',
    unauthorized_access: 'Unauthorized Access',
    brute_force_attempt: 'Brute Force Attempts',
    session_anomaly: 'Session Anomalies',
    suspicious_ip: 'Suspicious IP Detections',
    account_lockout: 'Account Lockouts',
    password_reset_abuse: 'Password Reset Abuse',
    invalid_token: 'Invalid Token Usage',
  };
  return labels[eventType] || eventType;
}

function getSeverityEmoji(severity: string): string {
  const emojis: Record<string, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
  };
  return emojis[severity] || '⚪';
}

function generateHtmlReport(stats: SecurityStats, weekStart: string, weekEnd: string): string {
  const eventTypesHtml = Object.entries(stats.eventsByType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `
      <tr>
        <td style="padding: 8px 16px; border-bottom: 1px solid #e5e7eb;">${getEventTypeLabel(type)}</td>
        <td style="padding: 8px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">${count}</td>
      </tr>
    `).join('');

  const topIPsHtml = stats.topIPs.slice(0, 5).map(({ ip, count }) => `
    <tr>
      <td style="padding: 8px 16px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${ip || 'Unknown'}</td>
      <td style="padding: 8px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">${count}</td>
    </tr>
  `).join('');

  const topEmailsHtml = stats.topEmails.slice(0, 5).map(({ email, count }) => `
    <tr>
      <td style="padding: 8px 16px; border-bottom: 1px solid #e5e7eb;">${email || 'Unknown'}</td>
      <td style="padding: 8px 16px; border-bottom: 1px solid #e5e7eb; text-align: right;">${count}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .card { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 32px; border-radius: 8px 8px 0 0; text-align: center; }
        .title { font-size: 24px; font-weight: 600; margin: 0 0 8px 0; }
        .subtitle { font-size: 14px; opacity: 0.8; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: 700; }
        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .section-title { font-size: 16px; font-weight: 600; margin: 24px 0 12px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 12px 16px; background: #f1f5f9; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; }
        .critical { color: #ef4444; }
        .high { color: #f97316; }
        .medium { color: #eab308; }
        .low { color: #22c55e; }
        .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
        .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">🛡️ Weekly Security Report</h1>
          <p class="subtitle">${weekStart} - ${weekEnd}</p>
        </div>
        
        <div class="card">
          ${stats.criticalEvents > 0 || stats.highEvents > 0 ? `
            <div class="alert-box">
              <strong>⚠️ Attention Required</strong>
              <p style="margin: 8px 0 0;">There were ${stats.criticalEvents} critical and ${stats.highEvents} high severity events this week that may require your attention.</p>
            </div>
          ` : `
            <div class="success-box">
              <strong>✅ All Clear</strong>
              <p style="margin: 8px 0 0;">No critical or high severity security events were detected this week.</p>
            </div>
          `}

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${stats.totalEvents}</div>
              <div class="stat-label">Total Events</div>
            </div>
            <div class="stat-card">
              <div class="stat-value ${stats.unresolvedEvents > 0 ? 'high' : 'low'}">${stats.unresolvedEvents}</div>
              <div class="stat-label">Unresolved</div>
            </div>
            <div class="stat-card">
              <div class="stat-value critical">${stats.criticalEvents}</div>
              <div class="stat-label">Critical</div>
            </div>
            <div class="stat-card">
              <div class="stat-value high">${stats.highEvents}</div>
              <div class="stat-label">High</div>
            </div>
          </div>

          <h3 class="section-title">Events by Type</h3>
          <table>
            <thead>
              <tr>
                <th>Event Type</th>
                <th style="text-align: right;">Count</th>
              </tr>
            </thead>
            <tbody>
              ${eventTypesHtml || '<tr><td colspan="2" style="padding: 16px; text-align: center; color: #64748b;">No events recorded</td></tr>'}
            </tbody>
          </table>

          ${stats.topIPs.length > 0 ? `
            <h3 class="section-title">Top IP Addresses</h3>
            <table>
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th style="text-align: right;">Events</th>
                </tr>
              </thead>
              <tbody>
                ${topIPsHtml}
              </tbody>
            </table>
          ` : ''}

          ${stats.topEmails.length > 0 ? `
            <h3 class="section-title">Most Affected Users</h3>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th style="text-align: right;">Events</th>
                </tr>
              </thead>
              <tbody>
                ${topEmailsHtml}
              </tbody>
            </table>
          ` : ''}
        </div>

        <div class="footer">
          <p>This report was automatically generated by Gen-zee.store security monitoring.</p>
          <p>To manage your notification preferences, visit the Security Dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured, skipping weekly report");
      return new Response(
        JSON.stringify({ success: false, message: "Email service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekStart = weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const weekEnd = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    console.log(`Generating weekly security report for ${weekStart} - ${weekEnd}`);

    // Fetch security events from the last 7 days
    const { data: events, error: eventsError } = await supabase
      .from('security_events')
      .select('*')
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false });

    if (eventsError) {
      console.error("Error fetching security events:", eventsError);
      throw new Error("Failed to fetch security events");
    }

    const typedEvents = (events || []) as SecurityEvent[];

    // Calculate statistics
    const stats: SecurityStats = {
      totalEvents: typedEvents.length,
      criticalEvents: typedEvents.filter(e => e.severity === 'critical').length,
      highEvents: typedEvents.filter(e => e.severity === 'high').length,
      mediumEvents: typedEvents.filter(e => e.severity === 'medium').length,
      lowEvents: typedEvents.filter(e => e.severity === 'low').length,
      unresolvedEvents: typedEvents.filter(e => !e.resolved).length,
      eventsByType: {},
      topIPs: [],
      topEmails: [],
    };

    // Count events by type
    typedEvents.forEach(event => {
      stats.eventsByType[event.event_type] = (stats.eventsByType[event.event_type] || 0) + 1;
    });

    // Get top IPs
    const ipCounts: Record<string, number> = {};
    typedEvents.forEach(event => {
      if (event.ip_address) {
        ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1;
      }
    });
    stats.topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count);

    // Get top affected emails
    const emailCounts: Record<string, number> = {};
    typedEvents.forEach(event => {
      if (event.user_email) {
        emailCounts[event.user_email] = (emailCounts[event.user_email] || 0) + 1;
      }
    });
    stats.topEmails = Object.entries(emailCounts)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count);

    // Get all admins who have email notifications enabled for security events
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admins found to send report to");
      return new Response(
        JSON.stringify({ success: true, message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminUserIds = adminRoles.map(r => r.user_id);

    // Get notification settings
    const { data: notificationSettings } = await supabase
      .from('admin_notification_settings')
      .select('*')
      .in('user_id', adminUserIds);

    // Get admin emails
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, email')
      .in('user_id', adminUserIds);

    // Filter admins who want security notifications
    const adminsToNotify = profiles?.filter(profile => {
      const settings = notificationSettings?.find(s => s.user_id === profile.user_id);
      // Default to true if no settings exist
      if (!settings) return true;
      return settings.email_notifications && settings.notify_on_security_events;
    }) || [];

    if (adminsToNotify.length === 0) {
      console.log("No admins opted in for security reports");
      return new Response(
        JSON.stringify({ success: true, message: "No admins opted in for reports" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate HTML report
    const htmlContent = generateHtmlReport(stats, weekStart, weekEnd);

    // Send emails
    const emailPromises = adminsToNotify.map(async (admin): Promise<boolean> => {
      if (!admin.email) return false;

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Zen Zee Store Security <security@gen-zee.store>",
            to: [admin.email],
            subject: `🛡️ Weekly Security Report - ${weekEnd}`,
            html: htmlContent,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to send report to ${admin.email}: ${errorText}`);
          return false;
        }

        console.log(`Weekly report sent to ${admin.email}`);
        return true;
      } catch (error) {
        console.error(`Error sending report to ${admin.email}:`, error);
        return false;
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r).length;

    console.log(`Weekly security report sent to ${successCount}/${adminsToNotify.length} admins`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Report sent to ${successCount} admins`,
        stats: {
          totalEvents: stats.totalEvents,
          criticalEvents: stats.criticalEvents,
          highEvents: stats.highEvents,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Weekly security report error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
