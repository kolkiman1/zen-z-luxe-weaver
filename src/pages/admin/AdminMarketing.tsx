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
  Percent,
  Users,
  Target,
  Zap,
  Gift,
  Calendar,
  Send,
  MessageSquare,
  Image,
  Settings,
  Download,
  FileJson,
  Code,
  Star,
  Heart,
  ShoppingBag,
  Trash2,
  Loader2,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  googleTagManagerId: string;
  hotjarId: string;
}

interface UrlItem {
  path: string;
  title: string;
  indexed: boolean;
  priority: string;
  lastModified: string;
}

type DiscountType = 'percentage' | 'fixed';

interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrder: number;
  usageLimit: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipients: number;
  openRate: number;
  clickRate: number;
  scheduledAt?: string;
}

const siteUrls: UrlItem[] = [
  { path: '/', title: 'Homepage', indexed: true, priority: 'High', lastModified: '2024-01-15' },
  { path: '/category/mens', title: "Men's Collection", indexed: true, priority: 'High', lastModified: '2024-01-14' },
  { path: '/category/womens', title: "Women's Collection", indexed: true, priority: 'High', lastModified: '2024-01-14' },
  { path: '/category/accessories', title: 'Accessories', indexed: true, priority: 'Medium', lastModified: '2024-01-13' },
  { path: '/auth', title: 'Sign In / Sign Up', indexed: false, priority: 'Low', lastModified: '2024-01-10' },
  { path: '/checkout', title: 'Checkout', indexed: false, priority: 'Low', lastModified: '2024-01-10' },
];

const seoChecklist = [
  { id: 'meta-title', label: 'Meta titles optimized (under 60 chars)', status: 'pass', impact: 'high' },
  { id: 'meta-desc', label: 'Meta descriptions optimized (under 160 chars)', status: 'pass', impact: 'high' },
  { id: 'h1-tags', label: 'Single H1 tag per page', status: 'pass', impact: 'high' },
  { id: 'img-alt', label: 'All images have alt attributes', status: 'warning', impact: 'medium' },
  { id: 'canonical', label: 'Canonical URLs configured', status: 'pass', impact: 'high' },
  { id: 'mobile', label: 'Mobile-responsive design', status: 'pass', impact: 'high' },
  { id: 'ssl', label: 'SSL certificate active (HTTPS)', status: 'pass', impact: 'high' },
  { id: 'sitemap', label: 'XML sitemap generated', status: 'pending', impact: 'medium' },
  { id: 'robots', label: 'robots.txt configured', status: 'pass', impact: 'medium' },
  { id: 'structured', label: 'Schema markup (JSON-LD)', status: 'warning', impact: 'high' },
  { id: 'core-vitals', label: 'Core Web Vitals optimized', status: 'pass', impact: 'high' },
  { id: 'internal-links', label: 'Internal linking structure', status: 'pass', impact: 'medium' },
  { id: 'page-speed', label: 'Page load speed < 3s', status: 'pass', impact: 'high' },
  { id: 'og-tags', label: 'Open Graph tags configured', status: 'pass', impact: 'medium' },
];

interface NewDiscountCode {
  code: string;
  type: DiscountType;
  value: number;
  minOrder: number;
  usageLimit: number;
  expiresAt: string;
}

const mockCampaigns: EmailCampaign[] = [
  { id: '1', name: 'New Arrivals Alert', subject: '🔥 Fresh Styles Just Dropped!', status: 'sent', recipients: 1250, openRate: 32.5, clickRate: 8.2 },
  { id: '2', name: 'Weekend Sale', subject: 'Weekend Flash Sale - Up to 40% Off', status: 'scheduled', recipients: 1180, openRate: 0, clickRate: 0, scheduledAt: '2024-01-20T10:00:00' },
  { id: '3', name: 'Cart Abandonment', subject: 'You left something behind...', status: 'draft', recipients: 0, openRate: 0, clickRate: 0 },
];

const AdminMarketing = () => {
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [loadingCodes, setLoadingCodes] = useState(true);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(mockCampaigns);
  const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [newCode, setNewCode] = useState<NewDiscountCode>({ 
    code: '', 
    type: 'percentage', 
    value: 10, 
    minOrder: 500, 
    usageLimit: 100,
    expiresAt: defaultExpiry
  });
  const [seoSettings, setSeoSettings] = useState<SeoSettings>({
    siteName: 'zen-z.store',
    siteDescription: 'Premium fashion and lifestyle products for the modern generation. Shop trendy clothing, accessories, and more.',
    siteKeywords: 'fashion, clothing, mens wear, womens wear, accessories, online shopping, bangladesh, trendy, streetwear',
    ogImage: '/og-image.jpg',
    twitterHandle: '@zenzstore',
    googleAnalyticsId: '',
    facebookPixelId: '',
    googleTagManagerId: '',
    hotjarId: '',
  });

  useEffect(() => {
    fetchStats();
    fetchDiscountCodes();
  }, []);

  const fetchDiscountCodes = async () => {
    setLoadingCodes(true);
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching discount codes:', error);
    } else if (data) {
      setDiscountCodes(data.map(d => ({
        id: d.id,
        code: d.code,
        type: d.type as DiscountType,
        value: Number(d.value),
        minOrder: Number(d.min_order),
        usageLimit: d.usage_limit,
        usedCount: d.used_count,
        expiresAt: new Date(d.expires_at).toISOString().split('T')[0],
        isActive: d.is_active,
      })));
    }
    setLoadingCodes(false);
  };

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
    <lastmod>${u.lastModified}</lastmod>
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

  const generateSchemaMarkup = () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": seoSettings.siteName,
      "description": seoSettings.siteDescription,
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": seoSettings.siteName,
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/logo.png`
        }
      }
    };
    
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema.json';
    a.click();
    toast.success('Schema markup downloaded');
  };

  const addDiscountCode = async () => {
    if (!newCode.code.trim()) {
      toast.error('Please enter a discount code');
      return;
    }
    if (newCode.code.length > 20) {
      toast.error('Code must be 20 characters or less');
      return;
    }
    if (newCode.value <= 0) {
      toast.error('Value must be greater than 0');
      return;
    }

    const { data, error } = await supabase
      .from('discount_codes')
      .insert({
        code: newCode.code.toUpperCase().trim(),
        type: newCode.type,
        value: newCode.value,
        min_order: newCode.minOrder,
        usage_limit: newCode.usageLimit,
        expires_at: new Date(newCode.expiresAt).toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('This discount code already exists');
      } else {
        toast.error('Failed to create discount code');
        console.error(error);
      }
      return;
    }

    if (data) {
      setDiscountCodes(prev => [{
        id: data.id,
        code: data.code,
        type: data.type as DiscountType,
        value: Number(data.value),
        minOrder: Number(data.min_order),
        usageLimit: data.usage_limit,
        usedCount: data.used_count,
        expiresAt: new Date(data.expires_at).toISOString().split('T')[0],
        isActive: data.is_active,
      }, ...prev]);
    }
    
    const nextExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setNewCode({ code: '', type: 'percentage', value: 10, minOrder: 500, usageLimit: 100, expiresAt: nextExpiry });
    toast.success('Discount code created');
  };

  const toggleDiscountCode = async (id: string) => {
    const code = discountCodes.find(c => c.id === id);
    if (!code) return;

    const { error } = await supabase
      .from('discount_codes')
      .update({ is_active: !code.isActive })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update discount code');
      console.error(error);
      return;
    }

    setDiscountCodes(codes => codes.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
    toast.success(code.isActive ? 'Discount code deactivated' : 'Discount code activated');
  };

  const deleteDiscountCode = async (id: string) => {
    const { error } = await supabase
      .from('discount_codes')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete discount code');
      console.error(error);
      return;
    }

    setDiscountCodes(codes => codes.filter(c => c.id !== id));
    toast.success('Discount code deleted');
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

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Impact</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Low</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Marketing & SEO | Admin - zen-z.store</title>
        <meta name="description" content="Complete marketing toolkit with SEO, campaigns, discount codes, and analytics" />
      </Helmet>

      <AdminLayout title="Marketing Hub">
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
                    <ShoppingBag size={20} className="text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-xl font-display font-bold">{orderCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users size={20} className="text-blue-500" />
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
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg">
                    <Tag size={20} className="text-pink-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Codes</p>
                    <p className="text-xl font-display font-bold">{discountCodes.filter(c => c.isActive).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="seo" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="seo" className="gap-2">
                <Search size={16} />
                SEO
              </TabsTrigger>
              <TabsTrigger value="discounts" className="gap-2">
                <Percent size={16} />
                Discounts
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="gap-2">
                <Mail size={16} />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="sitemap" className="gap-2">
                <Globe size={16} />
                Sitemap
              </TabsTrigger>
              <TabsTrigger value="social" className="gap-2">
                <Share2 size={16} />
                Social
              </TabsTrigger>
              <TabsTrigger value="tracking" className="gap-2">
                <BarChart3 size={16} />
                Tracking
              </TabsTrigger>
              <TabsTrigger value="schema" className="gap-2">
                <Code size={16} />
                Schema
              </TabsTrigger>
            </TabsList>

            {/* SEO Settings */}
            <TabsContent value="seo">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meta Information</CardTitle>
                      <CardDescription>Configure your site's primary SEO meta tags</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="siteName">Site Title</Label>
                        <Input
                          id="siteName"
                          value={seoSettings.siteName}
                          onChange={e => setSeoSettings({ ...seoSettings, siteName: e.target.value })}
                          placeholder="Your site name"
                        />
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">
                            {seoSettings.siteName.length}/60 characters
                          </p>
                          {seoSettings.siteName.length > 60 && (
                            <p className="text-xs text-destructive">Too long for optimal display</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteDescription">Meta Description</Label>
                        <Textarea
                          id="siteDescription"
                          value={seoSettings.siteDescription}
                          onChange={e => setSeoSettings({ ...seoSettings, siteDescription: e.target.value })}
                          placeholder="Brief description of your site"
                          rows={3}
                        />
                        <div className="flex justify-between">
                          <p className="text-xs text-muted-foreground">
                            {seoSettings.siteDescription.length}/160 characters
                          </p>
                          {seoSettings.siteDescription.length > 160 && (
                            <p className="text-xs text-destructive">Will be truncated in search results</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="siteKeywords">Target Keywords</Label>
                        <Textarea
                          id="siteKeywords"
                          value={seoSettings.siteKeywords}
                          onChange={e => setSeoSettings({ ...seoSettings, siteKeywords: e.target.value })}
                          placeholder="fashion, clothing, online store..."
                          rows={2}
                        />
                        <p className="text-xs text-muted-foreground">
                          {seoSettings.siteKeywords.split(',').filter(k => k.trim()).length} keywords
                        </p>
                      </div>
                      <Button onClick={() => toast.success('SEO settings saved!')}>
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Google Search Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Google Search Preview</CardTitle>
                      <CardDescription>How your site appears in Google search results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-500" />
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {window.location.host} › shop
                          </div>
                        </div>
                        <p className="text-blue-600 dark:text-blue-400 text-xl hover:underline cursor-pointer mb-1">
                          {seoSettings.siteName} - Premium Fashion & Lifestyle Store
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {seoSettings.siteDescription}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            4.8 (120 reviews)
                          </span>
                          <span>৳299 - ৳9,999</span>
                          <span>In stock</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* SEO Checklist */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>SEO Health</span>
                        <Badge variant={seoScore >= 80 ? 'default' : seoScore >= 60 ? 'secondary' : 'destructive'}>
                          {seoScore}%
                        </Badge>
                      </CardTitle>
                      <Progress value={seoScore} className="mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {seoChecklist.map(item => (
                          <div key={item.id} className="flex items-start gap-3 p-2 hover:bg-secondary/50 rounded-lg transition-colors">
                            {getStatusIcon(item.status)}
                            <div className="flex-1">
                              <span className="text-sm">{item.label}</span>
                              <div className="mt-1">{getImpactBadge(item.impact)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button variant="outline" className="w-full justify-start gap-2" onClick={generateSitemap}>
                        <Download size={16} />
                        Download Sitemap
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" onClick={generateSchemaMarkup}>
                        <FileJson size={16} />
                        Export Schema Markup
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" onClick={() => window.open('https://search.google.com/search-console', '_blank')}>
                        <ExternalLink size={16} />
                        Google Search Console
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Discount Codes */}
            <TabsContent value="discounts">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Active Discount Codes</CardTitle>
                      <CardDescription>Manage promotional codes and offers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loadingCodes ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="animate-spin text-muted-foreground" size={24} />
                        </div>
                      ) : discountCodes.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Tag size={40} className="mx-auto mb-2 opacity-50" />
                          <p>No discount codes yet</p>
                          <p className="text-sm">Create your first promotional code</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {discountCodes.map(code => (
                            <div
                              key={code.id}
                              className={`flex items-center justify-between p-4 rounded-lg border ${
                                code.isActive ? 'bg-secondary/30' : 'bg-muted/50 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Tag className="text-primary" size={20} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-mono font-bold">{code.code}</p>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => copyToClipboard(code.code, code.id)}
                                    >
                                      {copied === code.id ? <Check size={12} /> : <Copy size={12} />}
                                    </Button>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {code.type === 'percentage' ? `${code.value}% off` : `৳${code.value} off`}
                                    {code.minOrder > 0 && ` on orders over ৳${code.minOrder}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                  <p className="text-sm font-medium">{code.usedCount}/{code.usageLimit} used</p>
                                  <Progress value={(code.usedCount / code.usageLimit) * 100} className="w-24 h-1.5 mt-1" />
                                </div>
                                <div className="text-right hidden md:block">
                                  <p className="text-xs text-muted-foreground">Expires</p>
                                  <p className="text-sm">{code.expiresAt}</p>
                                </div>
                                <Switch
                                  checked={code.isActive}
                                  onCheckedChange={() => toggleDiscountCode(code.id)}
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => deleteDiscountCode(code.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Create New Code</CardTitle>
                    <CardDescription>Add a new promotional discount</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input
                        value={newCode.code}
                        onChange={e => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                        placeholder="SUMMER20"
                        className="font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={newCode.type}
                          onValueChange={(v) => setNewCode({ ...newCode, type: v as 'percentage' | 'fixed' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Percentage</SelectItem>
                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Value</Label>
                        <Input
                          type="number"
                          value={newCode.value}
                          onChange={e => setNewCode({ ...newCode, value: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Min Order (৳)</Label>
                        <Input
                          type="number"
                          value={newCode.minOrder}
                          onChange={e => setNewCode({ ...newCode, minOrder: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Usage Limit</Label>
                        <Input
                          type="number"
                          value={newCode.usageLimit}
                          onChange={e => setNewCode({ ...newCode, usageLimit: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Expires On</Label>
                      <Input
                        type="date"
                        value={newCode.expiresAt}
                        onChange={e => setNewCode({ ...newCode, expiresAt: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <Button className="w-full" onClick={addDiscountCode}>
                      <Gift size={16} className="mr-2" />
                      Create Code
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Email Campaigns */}
            <TabsContent value="campaigns">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Email Campaigns</CardTitle>
                      <CardDescription>Create and manage email marketing campaigns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {campaigns.map(campaign => (
                          <div
                            key={campaign.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-secondary/30"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${
                                campaign.status === 'sent' ? 'bg-green-500/10' :
                                campaign.status === 'scheduled' ? 'bg-blue-500/10' :
                                'bg-muted'
                              }`}>
                                <Mail className={
                                  campaign.status === 'sent' ? 'text-green-500' :
                                  campaign.status === 'scheduled' ? 'text-blue-500' :
                                  'text-muted-foreground'
                                } size={20} />
                              </div>
                              <div>
                                <p className="font-medium">{campaign.name}</p>
                                <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              {campaign.status === 'sent' && (
                                <>
                                  <div className="text-center">
                                    <p className="text-lg font-bold text-green-500">{campaign.openRate}%</p>
                                    <p className="text-xs text-muted-foreground">Open Rate</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-lg font-bold text-blue-500">{campaign.clickRate}%</p>
                                    <p className="text-xs text-muted-foreground">Click Rate</p>
                                  </div>
                                </>
                              )}
                              {campaign.status === 'scheduled' && campaign.scheduledAt && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar size={14} />
                                  {new Date(campaign.scheduledAt).toLocaleDateString()}
                                </div>
                              )}
                              <Badge variant={
                                campaign.status === 'sent' ? 'default' :
                                campaign.status === 'scheduled' ? 'secondary' :
                                'outline'
                              }>
                                {campaign.status}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                <Settings size={16} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Campaign Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-secondary/50 rounded-lg text-center">
                        <p className="text-3xl font-bold text-primary">{customerCount}</p>
                        <p className="text-sm text-muted-foreground">Total Subscribers</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-500/10 rounded-lg text-center">
                          <p className="text-xl font-bold text-green-500">32.5%</p>
                          <p className="text-xs text-muted-foreground">Avg Open Rate</p>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                          <p className="text-xl font-bold text-blue-500">8.2%</p>
                          <p className="text-xs text-muted-foreground">Avg Click Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Campaign</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Campaign Name</Label>
                        <Input placeholder="Flash Sale Alert" />
                      </div>
                      <div className="space-y-2">
                        <Label>Subject Line</Label>
                        <Input placeholder="🔥 48-Hour Flash Sale!" />
                      </div>
                      <div className="space-y-2">
                        <Label>Template</Label>
                        <Select defaultValue="promo">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="promo">Promotional</SelectItem>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                            <SelectItem value="product">Product Launch</SelectItem>
                            <SelectItem value="abandoned">Cart Recovery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full">
                        <Send size={16} className="mr-2" />
                        Create Campaign
                      </Button>
                    </CardContent>
                  </Card>
                </div>
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
                        <Download size={14} className="mr-2" />
                        Download XML
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
                    <CardDescription>Control search engine crawling behavior</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400">
                      <pre className="whitespace-pre-wrap">
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout
Disallow: /auth
Disallow: /dashboard
Disallow: /api/

# Sitemap location
Sitemap: ${window.location.origin}/sitemap.xml

# Crawl-delay for bots
Crawl-delay: 1`}
                      </pre>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={() => copyToClipboard(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout\nDisallow: /auth\nDisallow: /dashboard\nDisallow: /api/\n\nSitemap: ${window.location.origin}/sitemap.xml\n\nCrawl-delay: 1`, 'robots')}
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
                    <CardDescription>Configure how your site appears when shared on social platforms</CardDescription>
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
                        Recommended: 1200x630 pixels for optimal display
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterHandle">Twitter/X Handle</Label>
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
                    <CardDescription>How your links appear on Facebook, Twitter, LinkedIn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border shadow-sm">
                      <div className="aspect-[1200/630] bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center relative">
                        <div className="text-center">
                          <Heart className="w-12 h-12 mx-auto text-primary/50 mb-2" />
                          <span className="text-muted-foreground">OG Image Preview</span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-900">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{window.location.host}</p>
                        <p className="font-semibold text-gray-900 dark:text-white mt-1">{seoSettings.siteName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
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
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="text-blue-500" />
                      Google Analytics 4
                    </CardTitle>
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
                    </div>
                    <div className="space-y-3">
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
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={16} className="text-muted-foreground" />
                          <span className="text-sm">E-commerce Events</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <Button onClick={() => toast.success('Analytics settings saved!')}>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="text-blue-600" />
                      Facebook Pixel
                    </CardTitle>
                    <CardDescription>Track conversions from Facebook/Meta ads</CardDescription>
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-muted-foreground" />
                          <span className="text-sm">Purchase Events</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={16} className="text-muted-foreground" />
                          <span className="text-sm">Add to Cart</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Eye size={16} className="text-muted-foreground" />
                          <span className="text-sm">View Content</span>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <Button onClick={() => toast.success('Pixel settings saved!')}>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="text-gray-500" />
                      Google Tag Manager
                    </CardTitle>
                    <CardDescription>Manage all your tracking tags in one place</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gtmId">Container ID</Label>
                      <Input
                        id="gtmId"
                        value={seoSettings.googleTagManagerId}
                        onChange={e => setSeoSettings({ ...seoSettings, googleTagManagerId: e.target.value })}
                        placeholder="GTM-XXXXXXX"
                      />
                    </div>
                    <Button onClick={() => toast.success('GTM settings saved!')}>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="text-orange-500" />
                      Hotjar
                    </CardTitle>
                    <CardDescription>Heatmaps, recordings, and user feedback</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hotjarId">Site ID</Label>
                      <Input
                        id="hotjarId"
                        value={seoSettings.hotjarId}
                        onChange={e => setSeoSettings({ ...seoSettings, hotjarId: e.target.value })}
                        placeholder="XXXXXXX"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <span className="text-sm">Heatmaps</span>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <span className="text-sm">Session Recordings</span>
                        <Switch />
                      </div>
                    </div>
                    <Button onClick={() => toast.success('Hotjar settings saved!')}>
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Schema Markup */}
            <TabsContent value="schema">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Schema Markup Generator</CardTitle>
                    <CardDescription>Generate structured data for rich search results</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-blue-500" />
                          <span className="text-sm">Website Schema</span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ShoppingBag size={16} className="text-green-500" />
                          <span className="text-sm">Product Schema</span>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Star size={16} className="text-yellow-500" />
                          <span className="text-sm">Review Schema</span>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} className="text-purple-500" />
                          <span className="text-sm">FAQ Schema</span>
                        </div>
                        <Badge variant="outline">Not Set</Badge>
                      </div>
                    </div>
                    <Button className="w-full" onClick={generateSchemaMarkup}>
                      <Download size={16} className="mr-2" />
                      Export All Schemas
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>JSON-LD Preview</CardTitle>
                    <CardDescription>Website structured data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-80">
                      <pre>{JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": seoSettings.siteName,
                        "description": seoSettings.siteDescription,
                        "url": window.location.origin,
                        "potentialAction": {
                          "@type": "SearchAction",
                          "target": `${window.location.origin}/search?q={query}`,
                          "query-input": "required name=query"
                        }
                      }, null, 2)}</pre>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 gap-2"
                      onClick={() => {
                        const schema = JSON.stringify({
                          "@context": "https://schema.org",
                          "@type": "WebSite",
                          "name": seoSettings.siteName,
                          "description": seoSettings.siteDescription,
                          "url": window.location.origin
                        }, null, 2);
                        copyToClipboard(schema, 'schema');
                      }}
                    >
                      {copied === 'schema' ? <Check size={14} /> : <Copy size={14} />}
                      Copy Schema
                    </Button>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Rich Results Test</CardTitle>
                    <CardDescription>Validate your structured data with Google</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Input
                        placeholder="Enter page URL to test..."
                        defaultValue={window.location.origin}
                        className="flex-1"
                      />
                      <Button onClick={() => window.open(`https://search.google.com/test/rich-results?url=${encodeURIComponent(window.location.origin)}`, '_blank')}>
                        <ExternalLink size={16} className="mr-2" />
                        Test in Google
                      </Button>
                    </div>
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
