import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityEventRequest {
  eventType: 'failed_login' | 'rate_limit_hit' | 'suspicious_activity' | 'unauthorized_access';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SecurityEventRequest = await req.json();
    const { 
      eventType, 
      userId, 
      userEmail, 
      ipAddress, 
      userAgent, 
      details, 
      severity = 'medium' 
    } = body;

    console.log(`Logging security event: ${eventType}`, { userId, userEmail, severity });

    // Insert security event
    const { data: securityEvent, error: insertError } = await supabase
      .from('security_events')
      .insert({
        event_type: eventType,
        user_id: userId || null,
        user_email: userEmail || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        details: details || {},
        severity,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert security event:", insertError);
      throw new Error("Failed to log security event");
    }

    console.log(`Security event logged: ${securityEvent.id}`);

    // Send notification for high/critical events
    if (severity === 'high' || severity === 'critical') {
      try {
        const notifyResponse = await fetch(`${supabaseUrl}/functions/v1/admin-notify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            type: 'security_event',
            eventType,
            severity,
            userEmail,
            details,
          }),
        });

        if (!notifyResponse.ok) {
          console.error("Failed to send notification:", await notifyResponse.text());
        } else {
          console.log("Security notification sent successfully");
        }
      } catch (notifyError) {
        console.error("Error sending security notification:", notifyError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, eventId: securityEvent.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Security event logging error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
