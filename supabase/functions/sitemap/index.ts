import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/xml',
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

    // Fetch site settings for canonical URL
    const { data: seoData, error: seoError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'seo')
      .maybeSingle();

    if (seoError) {
      console.error('Error fetching SEO settings:', seoError);
    }

    const baseUrl = (seoData?.value as { canonicalUrl?: string })?.canonicalUrl || 'https://gen-zee.store';

    // Fetch all products with proper error handling
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('slug, updated_at, category')
      .order('updated_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching products:', productsError);
    }

    // Get unique categories
    const categories = [...new Set(products?.map(p => p.category) || [])];

    // Static pages with proper priority
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'daily' },
      { url: '/wishlist', priority: '0.6', changefreq: 'weekly' },
    ];

    // Build sitemap XML with proper XML escaping
    const escapeXml = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${escapeXml(baseUrl)}${escapeXml(page.url)}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    }

    // Add category pages
    for (const category of categories) {
      sitemap += `  <url>
    <loc>${escapeXml(baseUrl)}/category/${escapeXml(category)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    // Add "all" category
    sitemap += `  <url>
    <loc>${escapeXml(baseUrl)}/category/all</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

    // Add product pages
    if (products) {
      for (const product of products) {
        const lastmod = new Date(product.updated_at).toISOString().split('T')[0];
        sitemap += `  <url>
    <loc>${escapeXml(baseUrl)}/product/${escapeXml(product.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
      }
    }

    sitemap += `</urlset>`;

    console.log(`Sitemap generated with ${staticPages.length} static pages, ${categories.length} categories, and ${products?.length || 0} products`);

    return new Response(sitemap, {
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Return a minimal valid sitemap on error
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://gen-zee.store</loc>
    <priority>1.0</priority>
  </url>
</urlset>`,
      { headers: corsHeaders }
    );
  }
});
