import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Video, Upload, Save, Eye, Trash2, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCategoryBanners, useUpdateCategoryBanners, CategoryBanners, CategoryBanner, defaultCategoryBanners } from '@/hooks/useCategoryBanners';
import { supabase } from '@/integrations/supabase/client';

interface CategoryConfig {
  key: string;
  title: string;
  description: string;
}

const categories: CategoryConfig[] = [
  { key: 'men', title: "Men's Collection", description: 'Banner for the men category page' },
  { key: 'women', title: "Women's Collection", description: 'Banner for the women category page' },
  { key: 'jewelry', title: 'Jewelry', description: 'Banner for the jewelry category page' },
  { key: 'accessories', title: 'Accessories', description: 'Banner for the accessories category page' },
  { key: 'all', title: 'All Products', description: 'Banner for the all products page' },
  { key: 'new-arrivals', title: 'New Arrivals', description: 'Banner for the new arrivals page' },
];

const AdminCategoryBanners = () => {
  const { data: categoryBanners, isLoading } = useCategoryBanners();
  const updateMutation = useUpdateCategoryBanners();
  const [localBanners, setLocalBanners] = useState<CategoryBanners>(defaultCategoryBanners);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewCategory, setPreviewCategory] = useState<string | null>(null);

  useEffect(() => {
    if (categoryBanners) {
      setLocalBanners(categoryBanners);
    }
  }, [categoryBanners]);

  const handleChange = (category: string, field: keyof CategoryBanner, value: string | number) => {
    setLocalBanners(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value },
    }));
  };

  const handleUpload = async (category: string, file: File) => {
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast.error('Please upload an image or video file');
      return;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${isVideo ? '50MB' : '10MB'}`);
      return;
    }

    setUploading(category);

    try {
      const fileName = `category-banners/${category}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('seo-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from('seo-images').getPublicUrl(fileName);

      setLocalBanners(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          type: isVideo ? 'video' : 'image',
          url: publicUrl.publicUrl,
        },
      }));

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(localBanners);
      toast.success('Category banners saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleClear = (category: string) => {
    setLocalBanners(prev => ({
      ...prev,
      [category]: {
        type: 'image',
        url: '',
        overlayOpacity: 60,
        headline: prev[category]?.headline || '',
        description: prev[category]?.description || '',
      },
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Category Banners">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Category Banners">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Category Banners</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage banner images and content for each category page
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="men" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            {categories.map(cat => (
              <TabsTrigger key={cat.key} value={cat.key} className="flex-1 min-w-[80px] text-xs sm:text-sm py-2">
                {cat.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => {
            const banner = localBanners[cat.key] || defaultCategoryBanners[cat.key];
            return (
              <TabsContent key={cat.key} value={cat.key} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {banner?.type === 'video' ? (
                        <Video className="w-5 h-5 text-primary" />
                      ) : (
                        <Image className="w-5 h-5 text-primary" />
                      )}
                      {cat.title}
                    </CardTitle>
                    <CardDescription>{cat.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Content Fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input
                          value={banner?.headline || ''}
                          onChange={e => handleChange(cat.key, 'headline', e.target.value)}
                          placeholder="Category headline"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={banner?.description || ''}
                          onChange={e => handleChange(cat.key, 'description', e.target.value)}
                          placeholder="Category description"
                        />
                      </div>
                    </div>

                    {/* Media Type */}
                    <div className="space-y-2">
                      <Label>Media Type</Label>
                      <Select
                        value={banner?.type || 'image'}
                        onValueChange={v => handleChange(cat.key, 'type', v)}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-2">
                      <Label>Media URL</Label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          value={banner?.url || ''}
                          onChange={e => handleChange(cat.key, 'url', e.target.value)}
                          placeholder={`Enter ${banner?.type || 'image'} URL or upload`}
                          className="flex-1"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPreviewCategory(previewCategory === cat.key ? null : cat.key)}
                            disabled={!banner?.url}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleClear(cat.key)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label>Upload File</Label>
                      <label className="block">
                        <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                          {uploading === cat.key ? (
                            <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
                          ) : (
                            <>
                              <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Click to upload {banner?.type || 'image'}</p>
                              <p className="text-xs text-muted-foreground mt-1">Max: {banner?.type === 'video' ? '50MB' : '10MB'}</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept={banner?.type === 'video' ? 'video/*' : 'image/*'}
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(cat.key, file);
                          }}
                          disabled={uploading === cat.key}
                        />
                      </label>
                    </div>

                    {/* Overlay Opacity */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Overlay Opacity</Label>
                        <span className="text-sm text-muted-foreground">{banner?.overlayOpacity || 60}%</span>
                      </div>
                      <Slider
                        value={[banner?.overlayOpacity || 60]}
                        onValueChange={([v]) => handleChange(cat.key, 'overlayOpacity', v)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                    </div>

                    {/* Preview */}
                    {previewCategory === cat.key && banner?.url && (
                      <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-border">
                          {banner.type === 'video' ? (
                            <video src={banner.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                          ) : (
                            <img src={banner.url} alt="Preview" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-background" style={{ opacity: (banner.overlayOpacity || 60) / 100 }} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                            <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">{banner.headline}</h2>
                            <p className="text-muted-foreground">{banner.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminCategoryBanners;
