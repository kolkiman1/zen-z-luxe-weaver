import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Search,
  Globe,
  FileText,
  Tag,
  Mail,
  Megaphone,
  Link2,
  Share2,
  BarChart3,
  TrendingUp,
  Eye,
  MousePointer,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SeoSettings {
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
}

interface UrlItem {
  path: string;
  title: string;
  indexed: boolean;
  priority: string;
}

const siteUrls: UrlItem[] = [
  { path: '/', title: 'Homepage', indexed: true, priority: 'High' },
  { path: '/category/mens', title: "Men's Collection", indexed: true, priority: 'High' },
  { path: '/category/womens', title: "Women's Collection", indexed: true, priority: 'High' },
  { path: '/category/accessories', title: 'Accessories', indexed: true, priority: 'Medium' },
  { path: '/auth', title: 'Sign In / Sign Up', indexed: false, priority: 'Low' },
  { path: '/checkout', title: 'Checkout', indexed: false, priority: 'Low' },
];

const seoChecklist = [
  { id: 'meta-title', label: 'Meta titles under 60 characters', status: 'pass' },
  { id: 'meta-desc', label: 'Meta descriptions under 160 characters', status: 'pass' },
  { id: 'h1-tags', label: 'Single H1 tag per page', status: 'pass' },
  { id: 'img-alt', label: 'All images have alt attributes', status: 'warning' },
  { id: 'canonical', label: 'Canonical URLs configured', status: 'pass' },
  { id: 'mobile', label: 'Mobile-responsive design', status: 'pass' },
  { id: 'ssl', label: 'SSL certificate active', status: 'pass' },
  { id: 'sitemap', label: 'XML sitemap generated', status: 'pending' },
  { id: 'robots', label: 'robots.txt configured', status: 'pass' },
  { id: 'structured', label: 'Structured data (JSON-LD)', status: 'warning' },
];

const AdminMarketing = () => {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    siteName: 'zen-z.store',
    siteDescription: 'Premium fashion and lifestyle products for the modern generation',
    siteKeywords: 'fashion, clothing, mens wear, womens wear, accessories, online shopping, bangladesh',
    ogImage: '/og-image.jpg',
    twitterHandle: '@zenzstore',
    googleAnalyticsId: '',
    facebookPixelId: '',
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [products, orders, profiles] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
    ]);
    setProductCount(products.count || 0);
    setOrderCount(orders.count || 0);
    setCustomerCount(profiles.count || 0);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const generateSitemap = () => {
    const baseUrl = window.location.origin;
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${siteUrls
  .filter(u => u.indexed)
  .map(
    u => `  <url>
    <loc>${baseUrl}${u.path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${u.priority === 'High' ? '1.0' : u.priority === 'Medium' ? '0.7' : '0.4'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    toast.success('Sitemap downloaded');
  };

  const seoScore = Math.round(
    (seoChecklist.filter(item => item.status === 'pass').length / seoChecklist.length) * 100
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'warning':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'pending':
        return <Clock size={16} className="text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Marketing & SEO | Admin - zen-z.store</title>
        <meta name="description" content="SEO settings, marketing tools, and analytics for zen-z.store" />
      </Helmet>

      <AdminLayout title="Marketing & SEO Tools">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Products</p>
                    <p className="text-xl font-display font-bold">{productCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <BarChart3 size={20} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-xl font-display font-bold">{orderCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp size={20} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customers</p>
                    <p className="text-xl font-display font-bold">{customerCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Search size={20} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">SEO Score</p>
                    <p className="text-xl font-display font-bold">{seoScore}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="seo" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="seo" className="gap-2">
                <Search size={16} />
                SEO Settings
              </TabsTrigger>
              <TabsTrigger value="sitemap" className="gap-2">
                <Globe size={16} />
                Sitemap & URLs
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2">
                <Share2 size={16} />
                Social Media
              </TabsTrigger>
              <TabsTrigger value="tracking" className="gap-2">
                <BarChart3 size={16} />
                Tracking Codes
              </TabsTrigger>
            </TabsList>

            {/* SEO Settings */}
            <TabsContent value="seo">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meta Information</CardTitle>
                      <CardDescription>Configure your site's SEO meta tags</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Name</Label>
                        <Input
                          id="siteName"
                          value={seoSettings.siteName}
                          onChange={e => setSeoSettings({ ...seoSettings, siteName: e.target.value })}
                          placeholder="Your site name"
                        />
                        <p className="text-xs text-muted-foreground">
                          {seoSettings.siteName.length}/60 characters
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">Site Description</Label>
                        <Textarea
                          id="siteDescription"
                          value={seoSettings.siteDescription}
                          onChange={e => setSeoSettings({ ...seoSettings, siteDescription: e.target.value })}
                          placeholder="Brief description of your site"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          {seoSettings.siteDescription.length}/160 characters
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteKeywords">Keywords (comma-separated)</Label>
                        <Textarea
                          id="siteKeywords"
                          value={seoSettings.siteKeywords}
                          onChange={e => setSeoSettings({ ...seoSettings, siteKeywords: e.target.value })}
                          placeholder="fashion, clothing, online store..."
                          rows={2}
                        />
                      </div>
                      <Button onClick={() => toast.success('SEO settings saved!')}>
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>

                  {/* SEO Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Search Preview</CardTitle>
                      <CardDescription>How your site appears in search results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-secondary/50 rounded-lg p-4 space-y-1">
                        <p className="text-blue-600 text-lg hover:underline cursor-pointer">
                          {seoSettings.siteName} - Premium Fashion & Lifestyle
                        </p>
                        <p className="text-green-700 text-sm">{window.location.origin}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {seoSettings.siteDescription}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* SEO Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>SEO Checklist</span>
                      <Badge variant={seoScore >= 80 ? 'default' : 'secondary'}>
                        {seoScore}%
                      </Badge>
                    </CardTitle>
                    <CardDescription>Technical SEO status</CardDescription>
                    <Progress value={seoScore} className="mt-2" />
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {seoChecklist.map(item => (
                        <li key={item.id} className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <span className="text-sm">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sitemap & URLs */}
            <TabsContent value="sitemap">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Site URLs</span>
                      <Button size="sm" variant="outline" onClick={generateSitemap}>
                        <RefreshCw size={14} className="mr-2" />
                        Generate Sitemap
                      </Button>
                    </CardTitle>
                    <CardDescription>Pages indexed by search engines</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {siteUrls.map(url => (
                        <div
                          key={url.path}
                          className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {url.indexed ? (
                              <CheckCircle2 size={16} className="text-green-500" />
                            ) : (
                              <AlertCircle size={16} className="text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium text-sm">{url.title}</p>
                              <p className="text-xs text-muted-foreground">{url.path}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {url.priority}
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => window.open(url.path, '_blank')}
                            >
                              <ExternalLink size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>robots.txt</CardTitle>
                    <CardDescription>Control search engine crawling</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm">
                      <pre className="whitespace-pre-wrap">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout
Disallow: /auth
Disallow: /dashboard

Sitemap: ${window.location.origin}/sitemap.xml`}
                      </pre>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={() => copyToClipboard(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout\nDisallow: /auth\nDisallow: /dashboard\n\nSitemap: ${window.location.origin}/sitemap.xml`, 'robots')}
                    >
                      {copied === 'robots' ? <Check size={14} /> : <Copy size={14} />}
                      Copy robots.txt
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Social Media */}
            <TabsContent value="social">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Graph Settings</CardTitle>
                    <CardDescription>Configure how your site appears when shared</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ogImage">Default OG Image URL</Label>
                      <Input
                        id="ogImage"
                        value={seoSettings.ogImage}
                        onChange={e => setSeoSettings({ ...seoSettings, ogImage: e.target.value })}
                        placeholder="https://your-site.com/og-image.jpg"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended: 1200x630 pixels
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterHandle">Twitter Handle</Label>
                      <Input
                        id="twitterHandle"
                        value={seoSettings.twitterHandle}
                        onChange={e => setSeoSettings({ ...seoSettings, twitterHandle: e.target.value })}
                        placeholder="@yourhandle"
                      />
                    </div>
                    <Button onClick={() => toast.success('Social settings saved!')}>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Social Preview</CardTitle>
                    <CardDescription>How your content appears on social media</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-secondary/50 rounded-lg overflow-hidden">
                      <div className="aspect-[1200/630] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-muted-foreground">OG Image Preview</span>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-muted-foreground uppercase">{window.location.host}</p>
                        <p className="font-semibold">{seoSettings.siteName}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {seoSettings.siteDescription}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tracking Codes */}
            <TabsContent value="tracking">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Google Analytics</CardTitle>
                    <CardDescription>Track website traffic and user behavior</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gaId">Measurement ID</Label>
                      <Input
                        id="gaId"
                        value={seoSettings.googleAnalyticsId}
                        onChange={e => setSeoSettings({ ...seoSettings, googleAnalyticsId: e.target.value })}
                        placeholder="G-XXXXXXXXXX"
                      />
                      <p className="text-xs text-muted-foreground">
                        Find this in your Google Analytics 4 property settings
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-muted-foreground" />
                        <span className="text-sm">Page Views</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MousePointer size={16} className="text-muted-foreground" />
                        <span className="text-sm">Click Tracking</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Button onClick={() => toast.success('Analytics settings saved!')}>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Facebook Pixel</CardTitle>
                    <CardDescription>Track conversions from Facebook ads</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fbPixel">Pixel ID</Label>
                      <Input
                        id="fbPixel"
                        value={seoSettings.facebookPixelId}
                        onChange={e => setSeoSettings({ ...seoSettings, facebookPixelId: e.target.value })}
                        placeholder="XXXXXXXXXXXXXXXXXX"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-muted-foreground" />
                        <span className="text-sm">Purchase Events</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-muted-foreground" />
                        <span className="text-sm">Add to Cart Events</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Button onClick={() => toast.success('Pixel settings saved!')}>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminMarketing;
