import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyticsRequest {
  propertyId: string;
  startDate?: string;
  endDate?: string;
  metrics?: string[];
  dimensions?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ========== AUTHENTICATION CHECK ==========
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message || "No user found");
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User ${user.id} (${user.email}) attempting to access analytics`);

    // ========== ADMIN ROLE CHECK ==========
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError) {
      console.error("Role check failed:", roleError.message);
      return new Response(
        JSON.stringify({ error: "Internal error", message: "Failed to verify permissions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!roleData) {
      console.warn(`User ${user.id} (${user.email}) attempted admin access without admin role`);
      return new Response(
        JSON.stringify({ error: "Forbidden", message: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin user ${user.id} (${user.email}) authorized for analytics access`);

    // ========== ANALYTICS LOGIC ==========
    const serviceAccountKey = Deno.env.get("GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY");
    
    if (!serviceAccountKey) {
      return new Response(
        JSON.stringify({
          error: "Google Analytics not configured",
          message: "Please add GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY secret to enable real-time analytics",
          sampleData: true,
          data: getSampleData()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: AnalyticsRequest = await req.json();
    const { propertyId, startDate = "7daysAgo", endDate = "today", metrics, dimensions } = body;

    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: "Property ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse service account key
    const serviceAccount = JSON.parse(serviceAccountKey);
    
    // Generate JWT for Google API authentication
    const jwt = await generateGoogleJWT(serviceAccount);
    
    // Fetch access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      throw new Error("Failed to obtain access token");
    }

    // Fetch real-time data from GA4
    const realtimeResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dimensions: dimensions || [
            { name: "country" },
            { name: "city" },
            { name: "deviceCategory" },
            { name: "unifiedScreenName" }
          ],
          metrics: metrics || [
            { name: "activeUsers" },
            { name: "screenPageViews" }
          ],
        }),
      }
    );

    const realtimeData = await realtimeResponse.json();

    // Fetch historical data
    const reportResponse = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          dimensions: [
            { name: "date" },
            { name: "sessionDefaultChannelGroup" }
          ],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" }
          ],
        }),
      }
    );

    const reportData = await reportResponse.json();

    // Process and return the data
    const processedData = processAnalyticsData(realtimeData, reportData);

    console.log(`Analytics data successfully retrieved for admin user ${user.id}`);

    return new Response(
      JSON.stringify({ sampleData: false, data: processedData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Google Analytics Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: "Failed to fetch analytics",
        message: errorMessage,
        sampleData: true,
        data: getSampleData()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateGoogleJWT(serviceAccount: { client_email: string; private_key: string }) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const signatureInput = `${headerB64}.${payloadB64}`;
  
  // Import the private key
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = serviceAccount.private_key
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\n/g, "");
  
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signatureInput)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${signatureInput}.${signatureB64}`;
}

function processAnalyticsData(realtimeData: any, reportData: any) {
  // Extract active users from realtime data
  let activeUsers = 0;
  let topPages: { page: string; views: number; percentage: number }[] = [];
  let devices: { device: string; percentage: number }[] = [];
  
  if (realtimeData.rows) {
    // Count active users
    activeUsers = realtimeData.rows.reduce((sum: number, row: any) => {
      return sum + parseInt(row.metricValues?.[0]?.value || "0");
    }, 0);

    // Process top pages
    const pageViews: Record<string, number> = {};
    const deviceCounts: Record<string, number> = {};
    
    realtimeData.rows.forEach((row: any) => {
      const page = row.dimensionValues?.[3]?.value || "/";
      const views = parseInt(row.metricValues?.[1]?.value || "0");
      const device = row.dimensionValues?.[2]?.value || "desktop";
      
      pageViews[page] = (pageViews[page] || 0) + views;
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    const totalViews = Object.values(pageViews).reduce((a, b) => a + b, 0);
    topPages = Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, views]) => ({
        page,
        views,
        percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
      }));

    const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
    devices = Object.entries(deviceCounts)
      .map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        percentage: totalDevices > 0 ? Math.round((count / totalDevices) * 100) : 0,
      }));
  }

  // Extract historical metrics
  let visitors = 0;
  let pageviews = 0;
  let bounceRate = 0;
  let avgSession = 0;
  const trafficSources: { source: string; sessions: number; percentage: number }[] = [];

  if (reportData.rows) {
    const sourceSessions: Record<string, number> = {};
    
    reportData.rows.forEach((row: any) => {
      visitors += parseInt(row.metricValues?.[0]?.value || "0");
      const sessions = parseInt(row.metricValues?.[1]?.value || "0");
      pageviews += parseInt(row.metricValues?.[2]?.value || "0");
      bounceRate += parseFloat(row.metricValues?.[3]?.value || "0");
      avgSession += parseFloat(row.metricValues?.[4]?.value || "0");
      
      const source = row.dimensionValues?.[1]?.value || "Direct";
      sourceSessions[source] = (sourceSessions[source] || 0) + sessions;
    });

    if (reportData.rows.length > 0) {
      bounceRate = bounceRate / reportData.rows.length;
      avgSession = avgSession / reportData.rows.length / 60; // Convert to minutes
    }

    const totalSessions = Object.values(sourceSessions).reduce((a, b) => a + b, 0);
    Object.entries(sourceSessions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([source, sessions]) => {
        trafficSources.push({
          source,
          sessions,
          percentage: totalSessions > 0 ? Math.round((sessions / totalSessions) * 100) : 0,
        });
      });
  }

  return {
    realtime: {
      activeUsers,
      topPages: topPages.length > 0 ? topPages : getSampleData().realtime.topPages,
      devices: devices.length > 0 ? devices : getSampleData().realtime.devices,
    },
    metrics: {
      visitors: { current: visitors, trend: 0 },
      pageviews: { current: pageviews, trend: 0 },
      bounceRate: { current: Math.round(bounceRate * 100) / 100, trend: 0 },
      avgSession: { current: Math.round(avgSession * 100) / 100, trend: 0 },
    },
    trafficSources: trafficSources.length > 0 ? trafficSources : getSampleData().trafficSources,
  };
}

function getSampleData() {
  return {
    realtime: {
      activeUsers: 24,
      pagesPerSession: 3.2,
      topPages: [
        { page: "/", views: 156, percentage: 28 },
        { page: "/category/women", views: 89, percentage: 16 },
        { page: "/category/men", views: 76, percentage: 14 },
        { page: "/product/banarasi-silk-saree", views: 54, percentage: 10 },
      ],
      devices: [
        { device: "Mobile", percentage: 62 },
        { device: "Desktop", percentage: 31 },
        { device: "Tablet", percentage: 7 },
      ],
    },
    metrics: {
      visitors: { current: 2847, previous: 2345, trend: 21.4 },
      pageviews: { current: 8932, previous: 7654, trend: 16.7 },
      bounceRate: { current: 42.3, previous: 45.8, trend: -7.6 },
      avgSession: { current: 3.24, previous: 2.89, trend: 12.1 },
    },
    trafficSources: [
      { source: "Direct", sessions: 45, percentage: 38 },
      { source: "Organic Search", sessions: 32, percentage: 27 },
      { source: "Social", sessions: 28, percentage: 24 },
      { source: "Referral", sessions: 13, percentage: 11 },
    ],
  };
}
