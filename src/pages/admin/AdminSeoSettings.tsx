import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Image, AtSign, Link, Loader2, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImage: string;
  twitterHandle: string;
  canonicalUrl: string;
}

const defaultSettings: SeoSettings = {
  siteTitle: 'zen-z.store | Premium Fashion for the Next Generation',
  siteDescription: 'Discover premium fashion, exquisite jewelry, and luxury accessories at zen-z.store.',
  keywords: 'premium fashion, luxury clothing, Bangladesh, jewelry, accessories',
  ogImage: '',
  twitterHandle: '',
  canonicalUrl: 'https://zen-z.store',
};

const AdminSeoSettings = () => {
  const [settings, setSettings] = useState<SeoSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
                  <Label htmlFor="ogImage">Default OG Image URL</Label>
                  <Input
                    id="ogImage"
                    value={settings.ogImage}
                    onChange={(e) => handleChange('ogImage', e.target.value)}
                    placeholder="https://yourdomain.com/og-image.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended size: 1200x630 pixels. This image will be used when your pages are shared.
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
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSeoSettings;
