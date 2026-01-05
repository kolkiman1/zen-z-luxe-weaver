import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, Loader2, Megaphone, Video, Image, Plus, Trash2, 
  GripVertical, Eye, EyeOff, Clock, Zap, Gift, Truck, Sparkles,
  Upload, Link as LinkIcon, Play, Pause, Layout, Type, ArrowRight, RotateCcw
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAnnouncementBar, useUpdateAnnouncementBar, AnnouncementBarSettings, defaultAnnouncementSettings, Promotion } from '@/hooks/useAnnouncementBar';
import { useVideoShowcase, useUpdateVideoShowcase, VideoShowcaseSettings, defaultVideoShowcaseSettings, ProductHighlight } from '@/hooks/useVideoShowcase';
import { useHeroContent, useUpdateHeroContent, HeroContentSettings, defaultHeroContent, HeroCategory } from '@/hooks/useHeroContent';
import { supabase } from '@/integrations/supabase/client';
import LivePreviewPanel from '@/components/admin/LivePreviewPanel';

const iconOptions = [
  { value: 'zap', label: 'Flash/Sale', icon: Zap },
  { value: 'gift', label: 'Gift', icon: Gift },
  { value: 'truck', label: 'Shipping', icon: Truck },
  { value: 'clock', label: 'Time/Limited', icon: Clock },
  { value: 'sparkles', label: 'New/Special', icon: Sparkles },
];

const AdminSectionMaterials = () => {
  const { data: announcementSettings, isLoading: announcementLoading } = useAnnouncementBar();
  const { data: videoSettings, isLoading: videoLoading } = useVideoShowcase();
  const { data: heroSettings, isLoading: heroLoading } = useHeroContent();
  const updateAnnouncementMutation = useUpdateAnnouncementBar();
  const updateVideoMutation = useUpdateVideoShowcase();
  const updateHeroMutation = useUpdateHeroContent();

  const [localAnnouncement, setLocalAnnouncement] = useState<AnnouncementBarSettings>(defaultAnnouncementSettings);
  const [localVideo, setLocalVideo] = useState<VideoShowcaseSettings>(defaultVideoShowcaseSettings);
  const [localHero, setLocalHero] = useState<HeroContentSettings>(defaultHeroContent);
  const [uploading, setUploading] = useState(false);
  
  // Store original settings for reset functionality
  const originalAnnouncementRef = useRef<AnnouncementBarSettings | null>(null);
  const originalVideoRef = useRef<VideoShowcaseSettings | null>(null);
  const originalHeroRef = useRef<HeroContentSettings | null>(null);

  useEffect(() => {
    if (announcementSettings) {
      setLocalAnnouncement(announcementSettings);
      if (!originalAnnouncementRef.current) {
        originalAnnouncementRef.current = JSON.parse(JSON.stringify(announcementSettings));
      }
    }
  }, [announcementSettings]);

  useEffect(() => {
    if (videoSettings) {
      setLocalVideo(videoSettings);
      if (!originalVideoRef.current) {
        originalVideoRef.current = JSON.parse(JSON.stringify(videoSettings));
      }
    }
  }, [videoSettings]);

  useEffect(() => {
    if (heroSettings) {
      setLocalHero(heroSettings);
      if (!originalHeroRef.current) {
        originalHeroRef.current = JSON.parse(JSON.stringify(heroSettings));
      }
    }
  }, [heroSettings]);

  // Reset handlers
  const handleResetHero = () => {
    if (originalHeroRef.current) {
      setLocalHero(JSON.parse(JSON.stringify(originalHeroRef.current)));
      toast.success('Hero section reset to saved state');
    }
  };

  const handleResetAnnouncement = () => {
    if (originalAnnouncementRef.current) {
      setLocalAnnouncement(JSON.parse(JSON.stringify(originalAnnouncementRef.current)));
      toast.success('Announcement bar reset to saved state');
    }
  };

  const handleResetVideo = () => {
    if (originalVideoRef.current) {
      setLocalVideo(JSON.parse(JSON.stringify(originalVideoRef.current)));
      toast.success('Video showcase reset to saved state');
    }
  };

  // Announcement Bar handlers
  const handleAddPromotion = () => {
    const newPromo: Promotion = {
      id: `promo-${Date.now()}`,
      text: 'New Promotion',
      highlight: 'Shop Now',
      link: '/',
      icon: 'zap',
      enabled: true,
    };
    setLocalAnnouncement(prev => ({
      ...prev,
      promotions: [...prev.promotions, newPromo],
    }));
  };

  const handleRemovePromotion = (id: string) => {
    setLocalAnnouncement(prev => ({
      ...prev,
      promotions: prev.promotions.filter(p => p.id !== id),
    }));
  };

  const handlePromoChange = (id: string, field: keyof Promotion, value: string | boolean) => {
    setLocalAnnouncement(prev => ({
      ...prev,
      promotions: prev.promotions.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  // Video Showcase handlers
  const handleAddHighlight = () => {
    const newHighlight: ProductHighlight = {
      id: `highlight-${Date.now()}`,
      name: 'New Product',
      category: 'Category',
      price: '৳0',
      image: '/products/placeholder.jpg',
      link: '/product/new',
      enabled: true,
    };
    setLocalVideo(prev => ({
      ...prev,
      productHighlights: [...prev.productHighlights, newHighlight],
    }));
  };

  const handleRemoveHighlight = (id: string) => {
    setLocalVideo(prev => ({
      ...prev,
      productHighlights: prev.productHighlights.filter(h => h.id !== id),
    }));
  };

  const handleHighlightChange = (id: string, field: keyof ProductHighlight, value: string | boolean) => {
    setLocalVideo(prev => ({
      ...prev,
      productHighlights: prev.productHighlights.map(h => 
        h.id === id ? { ...h, [field]: value } : h
      ),
    }));
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File too large. Max 100MB');
      return;
    }

    setUploading(true);

    try {
      const fileName = `video-showcase/video-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('seo-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from('seo-images').getPublicUrl(fileName);

      setLocalVideo(prev => ({
        ...prev,
        videoUrl: publicUrl.publicUrl,
      }));

      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleHighlightImageUpload = async (highlightId: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      const fileName = `product-highlights/${highlightId}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('seo-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from('seo-images').getPublicUrl(fileName);

      handleHighlightChange(highlightId, 'image', publicUrl.publicUrl);
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      await updateAnnouncementMutation.mutateAsync(localAnnouncement);
      originalAnnouncementRef.current = JSON.parse(JSON.stringify(localAnnouncement));
      toast.success('Announcement bar settings saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleSaveVideo = async () => {
    try {
      await updateVideoMutation.mutateAsync(localVideo);
      originalVideoRef.current = JSON.parse(JSON.stringify(localVideo));
      toast.success('Video showcase settings saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    }
  };

  // Hero handlers
  const handleAddCategory = () => {
    const newCat: HeroCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      href: '/category/new',
      colorFrom: 'gray-500/20',
      colorTo: 'slate-500/20',
      enabled: true,
    };
    setLocalHero(prev => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  const handleRemoveCategory = (id: string) => {
    setLocalHero(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
    }));
  };

  const handleCategoryChange = (id: string, field: keyof HeroCategory, value: string | boolean) => {
    setLocalHero(prev => ({
      ...prev,
      categories: prev.categories.map(c => 
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleSaveHero = async () => {
    try {
      await updateHeroMutation.mutateAsync(localHero);
      originalHeroRef.current = JSON.parse(JSON.stringify(localHero));
      toast.success('Hero section settings saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    }
  };

  if (announcementLoading || videoLoading || heroLoading) {
    return (
      <AdminLayout title="Section Materials">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Section Materials">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Section Materials</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage promotional content, video showcase, and section materials
          </p>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            <TabsTrigger value="hero" className="flex-1 min-w-[120px] text-xs sm:text-sm py-2 gap-2">
              <Layout className="w-4 h-4" />
              Hero Section
            </TabsTrigger>
            <TabsTrigger value="announcement" className="flex-1 min-w-[120px] text-xs sm:text-sm py-2 gap-2">
              <Megaphone className="w-4 h-4" />
              Announcement Bar
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 min-w-[120px] text-xs sm:text-sm py-2 gap-2">
              <Video className="w-4 h-4" />
              Video Showcase
            </TabsTrigger>
          </TabsList>

          {/* Hero Section Tab */}
          <TabsContent value="hero" className="mt-6 space-y-6">
            {/* Live Preview */}
            <LivePreviewPanel type="hero" heroData={localHero} />
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-primary" />
                    Hero Section Content
                  </CardTitle>
                  <CardDescription>Edit the main hero section headline, description, and category pills</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleResetHero} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveHero} disabled={updateHeroMutation.isPending} className="gap-2">
                    {updateHeroMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Badge Settings */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    Badge Text
                  </Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Prefix</Label>
                      <Input
                        value={localHero.badgePrefix}
                        onChange={(e) => setLocalHero(prev => ({ ...prev, badgePrefix: e.target.value }))}
                        placeholder="Bangladesh's"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Highlight (Gold)</Label>
                      <Input
                        value={localHero.badgeHighlight}
                        onChange={(e) => setLocalHero(prev => ({ ...prev, badgeHighlight: e.target.value }))}
                        placeholder="Biggest"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Suffix</Label>
                      <Input
                        value={localHero.badgeSuffix}
                        onChange={(e) => setLocalHero(prev => ({ ...prev, badgeSuffix: e.target.value }))}
                        placeholder="Fashion Destination"
                      />
                    </div>
                  </div>
                  {/* Badge Preview */}
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground mb-2 block">Preview:</Label>
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm">
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span className="text-primary">{localHero.badgePrefix}</span>
                      <span className="text-gold font-bold">{localHero.badgeHighlight}</span>
                      <span className="text-muted-foreground">{localHero.badgeSuffix}</span>
                    </span>
                  </div>
                </div>

                {/* Heading Settings */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Main Heading
                  </Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Line 1</Label>
                      <Input
                        value={localHero.headingLine1}
                        onChange={(e) => setLocalHero(prev => ({ ...prev, headingLine1: e.target.value }))}
                        placeholder="Redefine"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Line 2 (Gold Gradient)</Label>
                      <Input
                        value={localHero.headingLine2}
                        onChange={(e) => setLocalHero(prev => ({ ...prev, headingLine2: e.target.value }))}
                        placeholder="Your Style"
                      />
                    </div>
                  </div>
                  {/* Heading Preview */}
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <Label className="text-xs text-muted-foreground mb-2 block">Preview:</Label>
                    <div className="font-display font-bold text-3xl tracking-tight">
                      <div>{localHero.headingLine1}</div>
                      <div className="text-gradient-gold">{localHero.headingLine2}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Description</Label>
                  <Textarea
                    value={localHero.description}
                    onChange={(e) => setLocalHero(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Curated collections that blend tradition with contemporary elegance..."
                    rows={3}
                  />
                </div>

                {/* CTA Buttons */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Call-to-Action Buttons</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg space-y-4">
                      <Label className="font-medium">Primary Button</Label>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Button Text</Label>
                        <Input
                          value={localHero.primaryButtonText}
                          onChange={(e) => setLocalHero(prev => ({ ...prev, primaryButtonText: e.target.value }))}
                          placeholder="Explore Collection"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Link URL</Label>
                        <Input
                          value={localHero.primaryButtonLink}
                          onChange={(e) => setLocalHero(prev => ({ ...prev, primaryButtonLink: e.target.value }))}
                          placeholder="/category/new-arrivals"
                        />
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg space-y-4">
                      <Label className="font-medium">Secondary Button</Label>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Button Text</Label>
                        <Input
                          value={localHero.secondaryButtonText}
                          onChange={(e) => setLocalHero(prev => ({ ...prev, secondaryButtonText: e.target.value }))}
                          placeholder="Our Story"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Link URL</Label>
                        <Input
                          value={localHero.secondaryButtonLink}
                          onChange={(e) => setLocalHero(prev => ({ ...prev, secondaryButtonLink: e.target.value }))}
                          placeholder="/about"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Category Pills</Label>
                    <Button onClick={handleAddCategory} size="sm" variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Category
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {localHero.categories.map((cat, index) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <span className="font-medium">Category {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={cat.enabled}
                              onCheckedChange={(checked) => handleCategoryChange(cat.id, 'enabled', checked)}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveCategory(cat.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={cat.name}
                              onChange={(e) => handleCategoryChange(cat.id, 'name', e.target.value)}
                              placeholder="Women"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link</Label>
                            <Input
                              value={cat.href}
                              onChange={(e) => handleCategoryChange(cat.id, 'href', e.target.value)}
                              placeholder="/category/women"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color From</Label>
                            <Input
                              value={cat.colorFrom}
                              onChange={(e) => handleCategoryChange(cat.id, 'colorFrom', e.target.value)}
                              placeholder="rose-500/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Color To</Label>
                            <Input
                              value={cat.colorTo}
                              onChange={(e) => handleCategoryChange(cat.id, 'colorTo', e.target.value)}
                              placeholder="pink-500/20"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {localHero.categories.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <ArrowRight className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No categories added yet</p>
                        <Button onClick={handleAddCategory} variant="outline" size="sm" className="mt-2">
                          Add Your First Category
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Announcement Bar Tab */}
          <TabsContent value="announcement" className="mt-6 space-y-6">
            {/* Live Preview */}
            <LivePreviewPanel type="announcement" announcementData={localAnnouncement} />
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Announcement Bar Settings
                  </CardTitle>
                  <CardDescription>Configure the floating announcement bar at the top of the page</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleResetAnnouncement} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveAnnouncement} disabled={updateAnnouncementMutation.isPending} className="gap-2">
                    {updateAnnouncementMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* General Settings */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Enable Announcement Bar</Label>
                      <p className="text-sm text-muted-foreground">Show/hide the announcement bar</p>
                    </div>
                    <Switch
                      checked={localAnnouncement.enabled}
                      onCheckedChange={(checked) => setLocalAnnouncement(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Show Countdown Timer</Label>
                      <p className="text-sm text-muted-foreground">Display sale countdown</p>
                    </div>
                    <Switch
                      checked={localAnnouncement.showCountdown}
                      onCheckedChange={(checked) => setLocalAnnouncement(prev => ({ ...prev, showCountdown: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Auto-Rotate Promotions</Label>
                      <p className="text-sm text-muted-foreground">Automatically cycle through promotions</p>
                    </div>
                    <Switch
                      checked={localAnnouncement.autoRotate}
                      onCheckedChange={(checked) => setLocalAnnouncement(prev => ({ ...prev, autoRotate: checked }))}
                    />
                  </div>

                  <div className="space-y-2 p-4 border rounded-lg">
                    <Label>Countdown Days</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[localAnnouncement.countdownDays]}
                        onValueChange={([value]) => setLocalAnnouncement(prev => ({ ...prev, countdownDays: value }))}
                        min={1}
                        max={30}
                        step={1}
                        className="flex-1"
                      />
                      <span className="w-12 text-right font-medium">{localAnnouncement.countdownDays}d</span>
                    </div>
                  </div>
                </div>

                {/* Promotions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Promotions</Label>
                    <Button onClick={handleAddPromotion} size="sm" variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Promotion
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {localAnnouncement.promotions.map((promo, index) => (
                      <motion.div
                        key={promo.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <span className="font-medium">Promotion {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={promo.enabled}
                              onCheckedChange={(checked) => handlePromoChange(promo.id, 'enabled', checked)}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemovePromotion(promo.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Text</Label>
                            <Input
                              value={promo.text}
                              onChange={(e) => handlePromoChange(promo.id, 'text', e.target.value)}
                              placeholder="Promotion text"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Highlight</Label>
                            <Input
                              value={promo.highlight || ''}
                              onChange={(e) => handlePromoChange(promo.id, 'highlight', e.target.value)}
                              placeholder="Highlighted text"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link</Label>
                            <Input
                              value={promo.link || ''}
                              onChange={(e) => handlePromoChange(promo.id, 'link', e.target.value)}
                              placeholder="/category/sale"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Icon</Label>
                            <Select
                              value={promo.icon}
                              onValueChange={(value) => handlePromoChange(promo.id, 'icon', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map(option => {
                                  const IconComponent = option.icon;
                                  return (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <IconComponent className="w-4 h-4" />
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {localAnnouncement.promotions.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <Megaphone className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No promotions added yet</p>
                        <Button onClick={handleAddPromotion} variant="outline" size="sm" className="mt-2">
                          Add Your First Promotion
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Video Showcase Tab */}
          <TabsContent value="video" className="mt-6 space-y-6">
            {/* Live Preview */}
            <LivePreviewPanel type="video" videoData={localVideo} />
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    Video Showcase Settings
                  </CardTitle>
                  <CardDescription>Configure the video showcase section on the homepage</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleResetVideo} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveVideo} disabled={updateVideoMutation.isPending} className="gap-2">
                    {updateVideoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* General Settings */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Enable Section</Label>
                      <p className="text-sm text-muted-foreground">Show video showcase</p>
                    </div>
                    <Switch
                      checked={localVideo.enabled}
                      onCheckedChange={(checked) => setLocalVideo(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Autoplay Video</Label>
                      <p className="text-sm text-muted-foreground">Auto-start when visible</p>
                    </div>
                    <Switch
                      checked={localVideo.autoplay}
                      onCheckedChange={(checked) => setLocalVideo(prev => ({ ...prev, autoplay: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label>Show Controls</Label>
                      <p className="text-sm text-muted-foreground">Play/pause buttons</p>
                    </div>
                    <Switch
                      checked={localVideo.showControls}
                      onCheckedChange={(checked) => setLocalVideo(prev => ({ ...prev, showControls: checked }))}
                    />
                  </div>
                </div>

                {/* Video Upload */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Video Source</Label>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Video URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={localVideo.videoUrl}
                          onChange={(e) => setLocalVideo(prev => ({ ...prev, videoUrl: e.target.value }))}
                          placeholder="Enter video URL or upload"
                          className="flex-1"
                        />
                        <label className="cursor-pointer">
                          <Button variant="outline" size="icon" disabled={uploading} asChild>
                            <div>
                              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            </div>
                          </Button>
                          <input
                            type="file"
                            className="hidden"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleVideoUpload(file);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Video Preview */}
                    {localVideo.videoUrl && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                        <video
                          src={localVideo.videoUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          autoPlay
                        />
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          <div className="px-2 py-1 bg-black/60 rounded text-xs text-white flex items-center gap-1">
                            <Play className="w-3 h-3" /> Preview
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Settings */}
                <div className="space-y-4">
                  <Label className="text-lg font-semibold">Section Content</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tagline</Label>
                      <Input
                        value={localVideo.tagline}
                        onChange={(e) => setLocalVideo(prev => ({ ...prev, tagline: e.target.value }))}
                        placeholder="Featured Collection"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Headline</Label>
                      <Input
                        value={localVideo.headline}
                        onChange={(e) => setLocalVideo(prev => ({ ...prev, headline: e.target.value }))}
                        placeholder="Experience the"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Headline Highlight</Label>
                      <Input
                        value={localVideo.headlineHighlight}
                        onChange={(e) => setLocalVideo(prev => ({ ...prev, headlineHighlight: e.target.value }))}
                        placeholder="Elegance"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Side Headline</Label>
                      <Input
                        value={localVideo.sideHeadline}
                        onChange={(e) => setLocalVideo(prev => ({ ...prev, sideHeadline: e.target.value }))}
                        placeholder="Trending This Season"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={localVideo.description}
                        onChange={(e) => setLocalVideo(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Discover our handpicked collection..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Product Highlights */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Product Highlights</Label>
                    <Button onClick={handleAddHighlight} size="sm" variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {localVideo.productHighlights.map((highlight, index) => (
                      <motion.div
                        key={highlight.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <span className="font-medium">Product {index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={highlight.enabled}
                              onCheckedChange={(checked) => handleHighlightChange(highlight.id, 'enabled', checked)}
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveHighlight(highlight.id)}
                              className="text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                          {/* Image Preview */}
                          <div className="space-y-2">
                            <Label>Image</Label>
                            <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                              <img
                                src={highlight.image}
                                alt={highlight.name}
                                className="w-full h-full object-cover"
                              />
                              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Upload className="w-6 h-6 text-white" />
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleHighlightImageUpload(highlight.id, file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={highlight.name}
                              onChange={(e) => handleHighlightChange(highlight.id, 'name', e.target.value)}
                              placeholder="Product name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Category</Label>
                            <Input
                              value={highlight.category}
                              onChange={(e) => handleHighlightChange(highlight.id, 'category', e.target.value)}
                              placeholder="Category"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                              value={highlight.price}
                              onChange={(e) => handleHighlightChange(highlight.id, 'price', e.target.value)}
                              placeholder="৳0"
                            />
                          </div>
                          <div className="space-y-2 lg:col-span-2">
                            <Label>Link</Label>
                            <Input
                              value={highlight.link}
                              onChange={(e) => handleHighlightChange(highlight.id, 'link', e.target.value)}
                              placeholder="/product/slug"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {localVideo.productHighlights.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <Image className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No product highlights added yet</p>
                        <Button onClick={handleAddHighlight} variant="outline" size="sm" className="mt-2">
                          Add Your First Product
                        </Button>
                      </div>
                    )}
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

export default AdminSectionMaterials;
