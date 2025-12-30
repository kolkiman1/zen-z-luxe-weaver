import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch SEO settings to get canonical URL
    const { data: seoSettings, error: seoError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'seo')
      .maybeSingle();

    if (seoError) {
      console.error('Error fetching SEO settings:', seoError);
    }

    // Safely access the value with type guard
    const seoValue = seoSettings?.value as { canonicalUrl?: string } | null;
    const canonicalUrl = seoValue?.canonicalUrl || 'https://zen-z.store';
    const sitemapUrl = `${supabaseUrl}/functions/v1/sitemap`;

    const robotsTxt = `# robots.txt for zen-z.store
# Generated dynamically

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /
Crawl-delay: 2

# Disallow admin and auth pages
Disallow: /admin/
Disallow: /auth
Disallow: /checkout
Disallow: /dashboard
Disallow: /orders

# Sitemap location
Sitemap: ${sitemapUrl}

# Host
Host: ${canonicalUrl}
`;

    console.log('Generated robots.txt with sitemap:', sitemapUrl);

    return new Response(robotsTxt, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    // Return a basic robots.txt on error
    return new Response(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /auth
`, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
});
