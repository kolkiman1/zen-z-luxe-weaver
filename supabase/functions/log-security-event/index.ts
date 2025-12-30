import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityEventRequest {
  eventType: 'failed_login' | 'rate_limit_hit' | 'suspicious_activity' | 'unauthorized_access' | 
             'brute_force_attempt' | 'session_anomaly' | 'suspicious_ip' | 'account_lockout' |
             'password_reset_abuse' | 'invalid_token';
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  country?: string;
  city?: string;
  requestPath?: string;
}

// Brute force detection - track failed attempts per IP/email
const failedAttempts = new Map<string, { count: number; firstAttempt: number; blocked: boolean }>();
const BRUTE_FORCE_CONFIG = {
  maxAttempts: 5,           // Max failed attempts before flagging
  windowMs: 15 * 60 * 1000, // 15 minute window
  blockDuration: 30 * 60 * 1000, // 30 minute block
};

function checkBruteForce(identifier: string): { isBruteForce: boolean; attemptCount: number } {
  const now = Date.now();
  const record = failedAttempts.get(identifier);
  
  if (!record) {
    failedAttempts.set(identifier, { count: 1, firstAttempt: now, blocked: false });
    return { isBruteForce: false, attemptCount: 1 };
  }
  
  // Reset if window expired
  if (now - record.firstAttempt > BRUTE_FORCE_CONFIG.windowMs) {
    failedAttempts.set(identifier, { count: 1, firstAttempt: now, blocked: false });
    return { isBruteForce: false, attemptCount: 1 };
  }
  
  record.count++;
  
  // Check if brute force threshold exceeded
  if (record.count >= BRUTE_FORCE_CONFIG.maxAttempts) {
    record.blocked = true;
    failedAttempts.set(identifier, record);
    return { isBruteForce: true, attemptCount: record.count };
  }
  
  failedAttempts.set(identifier, record);
  return { isBruteForce: false, attemptCount: record.count };
}

// Suspicious IP detection patterns
const suspiciousPatterns = {
  knownBadUserAgents: [
    'sqlmap', 'nikto', 'nessus', 'burpsuite', 'nmap', 'masscan',
    'python-requests', 'curl/', 'wget/', 'scrapy'
  ],
  suspiciousHeaders: ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'],
};

function detectSuspiciousActivity(req: Request): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const userAgent = req.headers.get('user-agent')?.toLowerCase() || '';
  
  // Check for suspicious user agents
  for (const badAgent of suspiciousPatterns.knownBadUserAgents) {
    if (userAgent.includes(badAgent)) {
      reasons.push(`Suspicious user agent: ${badAgent}`);
    }
  }
  
  // Check for suspicious headers (potential header injection)
  for (const header of suspiciousPatterns.suspiciousHeaders) {
    if (req.headers.get(header)) {
      reasons.push(`Suspicious header present: ${header}`);
    }
  }
  
  return { suspicious: reasons.length > 0, reasons };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for suspicious activity in the request itself
    const suspiciousCheck = detectSuspiciousActivity(req);
    
    const body: SecurityEventRequest = await req.json();
    const { 
      eventType, 
      userId, 
      userEmail, 
      ipAddress, 
      userAgent, 
      details, 
      severity = 'medium',
      country,
      city,
      requestPath
    } = body;

    console.log(`Logging security event: ${eventType}`, { userId, userEmail, severity, ipAddress });

    // Enhanced brute force detection for failed logins
    let enhancedSeverity = severity;
    let enhancedDetails = { ...details };
    
    if (eventType === 'failed_login') {
      const identifier = userEmail || ipAddress || 'unknown';
      const bruteForceCheck = checkBruteForce(identifier);
      
      enhancedDetails.attempt_count = bruteForceCheck.attemptCount;
      
      if (bruteForceCheck.isBruteForce) {
        // Log brute force attempt as a separate high-severity event
        await supabase.from('security_events').insert({
          event_type: 'brute_force_attempt',
          user_email: userEmail,
          ip_address: ipAddress,
          user_agent: userAgent,
          details: {
            attempt_count: bruteForceCheck.attemptCount,
            window_minutes: BRUTE_FORCE_CONFIG.windowMs / 60000,
            blocked: true,
          },
          severity: 'high',
          country,
          city,
          request_path: requestPath,
          blocked: true,
        });
        
        // Escalate severity of the failed login
        enhancedSeverity = 'high';
        enhancedDetails.brute_force_detected = true;
      }
    }
    
    // Add suspicious activity detection results to details
    if (suspiciousCheck.suspicious) {
      enhancedDetails.suspicious_patterns = suspiciousCheck.reasons;
      if (enhancedSeverity === 'low' || enhancedSeverity === 'medium') {
        enhancedSeverity = 'high';
      }
    }

    // Insert security event
    const { data: securityEvent, error: insertError } = await supabase
      .from('security_events')
      .insert({
        event_type: eventType,
        user_id: userId || null,
        user_email: userEmail || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        details: enhancedDetails,
        severity: enhancedSeverity,
        country: country || null,
        city: city || null,
        request_path: requestPath || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert security event:", insertError);
      throw new Error("Failed to log security event");
    }

    console.log(`Security event logged: ${securityEvent.id}`);

    // Send notification for high/critical events
    if (enhancedSeverity === 'high' || enhancedSeverity === 'critical') {
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
            severity: enhancedSeverity,
            userEmail,
            details: enhancedDetails,
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
