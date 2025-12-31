import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Image, AtSign, Link, Loader2, RefreshCw, Upload, FileText, ExternalLink, Search } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SeoAnalyzer } from '@/components/admin/SeoAnalyzer';

interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImage: string;
  twitterHandle: string;
  canonicalUrl: string;
}

const defaultSettings: SeoSettings = {
  siteTitle: 'Gen-zee.store | Premium Fashion for the Next Generation',
  siteDescription: 'Discover premium fashion, exquisite jewelry, and luxury accessories at Gen-zee.store.',
  keywords: 'premium fashion, luxury clothing, Bangladesh, jewelry, accessories',
  ogImage: '',
  twitterHandle: '',
  canonicalUrl: 'https://gen-zee.store',
};

const AdminSeoSettings = () => {
  const [settings, setSettings] = useState<SeoSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'seo')
      .maybeSingle();

    if (error) {
      console.error('Error fetching SEO settings:', error);
    } else if (data?.value) {
      setSettings({ ...defaultSettings, ...(data.value as unknown as Partial<SeoSettings>) });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'seo')
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('site_settings')
        .update({ value: settings as unknown as Record<string, never> })
        .eq('key', 'seo'));
    } else {
      ({ error } = await supabase
        .from('site_settings')
        .insert([{ key: 'seo', value: settings as unknown as Record<string, never> }]));
    }

    if (error) {
      toast.error('Failed to save SEO settings');
    } else {
      toast.success('SEO settings saved successfully');
    }
    setSaving(false);
  };

  const handleChange = (field: keyof SeoSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `og-image-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('seo-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('seo-images')
        .getPublicUrl(fileName);

      handleChange('ogImage', publicUrl);
      toast.success('OG image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sitemapUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sitemap`;
  const robotsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/robots`;

  if (loading) {
    return (
      <AdminLayout title="SEO Settings">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="SEO Settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display">SEO Settings</h1>
            <p className="text-muted-foreground">Configure meta tags, Open Graph, and social sharing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchSettings}>
              <RefreshCw size={16} className="mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="opengraph">Open Graph</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap & Robots</TabsTrigger>
            <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe size={20} />
                  Basic SEO
                </CardTitle>
                <CardDescription>
                  Configure the default meta tags for your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Site Title</Label>
                  <Input
                    id="siteTitle"
                    value={settings.siteTitle}
                    onChange={(e) => handleChange('siteTitle', e.target.value)}
                    placeholder="Your Site Name | Tagline"
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.siteTitle.length}/60 characters (recommended max)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Meta Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={settings.siteDescription}
                    onChange={(e) => handleChange('siteDescription', e.target.value)}
                    placeholder="A brief description of your website..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {settings.siteDescription.length}/160 characters (recommended max)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Textarea
                    id="keywords"
                    value={settings.keywords}
                    onChange={(e) => handleChange('keywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3..."
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated list of keywords
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="canonicalUrl">Canonical URL</Label>
                  <div className="flex items-center gap-2">
                    <Link size={16} className="text-muted-foreground" />
                    <Input
                      id="canonicalUrl"
                      value={settings.canonicalUrl}
                      onChange={(e) => handleChange('canonicalUrl', e.target.value)}
                      placeholder="https://yourdomain.com"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The primary URL of your website (without trailing slash)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
              <CardHeader>
                <CardTitle>Search Preview</CardTitle>
                <CardDescription>How your site may appear in Google search results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                  <p className="text-primary text-lg hover:underline cursor-pointer">
                    {settings.siteTitle || 'Your Site Title'}
                  </p>
                  <p className="text-sm text-green-600">{settings.canonicalUrl}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {settings.siteDescription || 'Your site description will appear here...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opengraph" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image size={20} />
                  Open Graph Settings
                </CardTitle>
                <CardDescription>
                  Configure how your content appears when shared on social media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ogImage">Default OG Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="ogImage"
                      value={settings.ogImage}
                      onChange={(e) => handleChange('ogImage', e.target.value)}
                      placeholder="https://yourdomain.com/og-image.jpg"
                      className="flex-1"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span className="ml-2">Upload</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 1200x630 pixels. Upload directly or paste an image URL.
                  </p>
                </div>

                {settings.ogImage && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="border rounded-lg overflow-hidden max-w-md">
                      <img 
                        src={settings.ogImage} 
                        alt="OG Preview" 
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Share Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Social Share Preview</CardTitle>
                <CardDescription>How your content will look when shared on Facebook/LinkedIn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-w-md bg-background">
                  {settings.ogImage ? (
                    <img 
                      src={settings.ogImage} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <Image size={48} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">
                      {settings.canonicalUrl.replace('https://', '').replace('http://', '')}
                    </p>
                    <p className="font-medium line-clamp-1">{settings.siteTitle || 'Your Site Title'}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {settings.siteDescription || 'Your description here...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AtSign size={20} />
                  Social Media
                </CardTitle>
                <CardDescription>
                  Connect your social media accounts for better engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterHandle">Twitter/X Handle</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">@</span>
                    <Input
                      id="twitterHandle"
                      value={settings.twitterHandle.replace('@', '')}
                      onChange={(e) => handleChange('twitterHandle', `@${e.target.value.replace('@', '')}`)}
                      placeholder="yourhandle"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your Twitter/X username (without @)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Twitter Card Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Twitter Card Preview</CardTitle>
                <CardDescription>How your content will look when shared on Twitter/X</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-xl overflow-hidden max-w-md bg-background">
                  {settings.ogImage ? (
                    <img 
                      src={settings.ogImage} 
                      alt="Preview" 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <Image size={48} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <p className="font-medium line-clamp-1">{settings.siteTitle || 'Your Site Title'}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {settings.siteDescription || 'Your description here...'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {settings.canonicalUrl.replace('https://', '').replace('http://', '')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sitemap" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Dynamic Sitemap
                </CardTitle>
                <CardDescription>
                  Your sitemap is automatically generated with all products and categories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sitemap URL</p>
                      <p className="text-sm text-muted-foreground break-all">{sitemapUrl}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={sitemapUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} className="mr-2" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">What's included:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Homepage and static pages</li>
                    <li>All category pages (dynamically generated)</li>
                    <li>All product pages with last modified dates</li>
                    <li>Proper priority and changefreq values</li>
                  </ul>
                </div>

                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Tip:</strong> Submit this sitemap URL to Google Search Console and Bing Webmaster Tools for better indexing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText size={20} />
                  Dynamic robots.txt
                </CardTitle>
                <CardDescription>
                  Your robots.txt is dynamically generated with sitemap URL and crawl rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">robots.txt URL</p>
                      <p className="text-sm text-muted-foreground break-all">{robotsUrl}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={robotsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} className="mr-2" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">What's configured:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Allow all major crawlers (Googlebot, Bingbot, etc.)</li>
                    <li>Appropriate crawl delays</li>
                    <li>Disallow admin, auth, and checkout pages</li>
                    <li>Dynamic sitemap URL included</li>
                    <li>Host directive with canonical URL</li>
                  </ul>
                </div>

                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Note:</strong> For production, you may want to configure your server to serve this at /robots.txt or use a redirect.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <SeoAnalyzer />
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSeoSettings;
