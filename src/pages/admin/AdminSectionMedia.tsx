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
import { useSectionMedia, useUpdateSectionMedia, SectionMedia, defaultSectionMedia } from '@/hooks/useSectionMedia';
import { supabase } from '@/integrations/supabase/client';

type SectionKey = keyof SectionMedia;

interface SectionConfig {
  key: SectionKey;
  title: string;
  description: string;
  allowNone: boolean;
}

const sections: SectionConfig[] = [
  { key: 'hero', title: 'Hero Section', description: 'Main landing hero banner', allowNone: false },
  { key: 'categories', title: 'Categories Section', description: 'Shop by category area', allowNone: true },
  { key: 'featuredProducts', title: 'Featured Products', description: 'Featured collection background', allowNone: true },
  { key: 'newArrivals', title: 'New Arrivals', description: 'Latest products section', allowNone: false },
  { key: 'brandBanner', title: 'Brand Banner', description: 'Brand story parallax section', allowNone: false },
];

const AdminSectionMedia = () => {
  const { data: sectionMedia, isLoading } = useSectionMedia();
  const updateMutation = useUpdateSectionMedia();
  const [localMedia, setLocalMedia] = useState<SectionMedia>(defaultSectionMedia);
  const [uploading, setUploading] = useState<SectionKey | null>(null);
  const [previewSection, setPreviewSection] = useState<SectionKey | null>(null);

  useEffect(() => {
    if (sectionMedia) {
      setLocalMedia(sectionMedia);
    }
  }, [sectionMedia]);

  const handleTypeChange = (section: SectionKey, type: 'image' | 'video' | 'none') => {
    setLocalMedia(prev => ({
      ...prev,
      [section]: { ...prev[section], type, url: type === 'none' ? '' : prev[section].url },
    }));
  };

  const handleUrlChange = (section: SectionKey, url: string) => {
    setLocalMedia(prev => ({
      ...prev,
      [section]: { ...prev[section], url },
    }));
  };

  const handleOverlayChange = (section: SectionKey, opacity: number) => {
    setLocalMedia(prev => ({
      ...prev,
      [section]: { ...prev[section], overlayOpacity: opacity },
    }));
  };

  const handleUpload = async (section: SectionKey, file: File) => {
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

    setUploading(section);

    try {
      const fileName = `section-media/${section}-${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage
        .from('seo-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from('seo-images').getPublicUrl(fileName);

      setLocalMedia(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
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
      await updateMutation.mutateAsync(localMedia);
      toast.success('Section media settings saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleClear = (section: SectionKey) => {
    const config = sections.find(s => s.key === section);
    setLocalMedia(prev => ({
      ...prev,
      [section]: {
        type: config?.allowNone ? 'none' : 'image',
        url: '',
        overlayOpacity: 70,
      },
    }));
  };

  if (isLoading) {
    return (
      <AdminLayout title="Section Media">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Section Media">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Section Media</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage background images and videos for frontend sections
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            {sections.map(section => (
              <TabsTrigger
                key={section.key}
                value={section.key}
                className="flex-1 min-w-[100px] text-xs sm:text-sm py-2"
              >
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map(section => (
            <TabsContent key={section.key} value={section.key} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {localMedia[section.key].type === 'video' ? (
                      <Video className="w-5 h-5 text-primary" />
                    ) : (
                      <Image className="w-5 h-5 text-primary" />
                    )}
                    {section.title}
                  </CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Media Type Selection */}
                  <div className="space-y-2">
                    <Label>Media Type</Label>
                    <Select
                      value={localMedia[section.key].type}
                      onValueChange={(v) => handleTypeChange(section.key, v as 'image' | 'video' | 'none')}
                    >
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        {section.allowNone && <SelectItem value="none">None (Default)</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  {localMedia[section.key].type !== 'none' && (
                    <>
                      {/* URL Input */}
                      <div className="space-y-2">
                        <Label>Media URL</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            value={localMedia[section.key].url}
                            onChange={(e) => handleUrlChange(section.key, e.target.value)}
                            placeholder={`Enter ${localMedia[section.key].type} URL or upload`}
                            className="flex-1"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setPreviewSection(previewSection === section.key ? null : section.key)}
                              disabled={!localMedia[section.key].url}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleClear(section.key)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <Label>Upload File</Label>
                        <div className="flex items-center gap-4">
                          <label className="flex-1">
                            <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                              {uploading === section.key ? (
                                <Loader2 className="w-6 h-6 mx-auto animate-spin text-primary" />
                              ) : (
                                <>
                                  <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    Click to upload {localMedia[section.key].type}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Max: {localMedia[section.key].type === 'video' ? '50MB' : '10MB'}
                                  </p>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              className="hidden"
                              accept={localMedia[section.key].type === 'video' ? 'video/*' : 'image/*'}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUpload(section.key, file);
                              }}
                              disabled={uploading === section.key}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Overlay Opacity */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label>Overlay Opacity</Label>
                          <span className="text-sm text-muted-foreground">
                            {localMedia[section.key].overlayOpacity || 70}%
                          </span>
                        </div>
                        <Slider
                          value={[localMedia[section.key].overlayOpacity || 70]}
                          onValueChange={([v]) => handleOverlayChange(section.key, v)}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      {/* Preview */}
                      {previewSection === section.key && localMedia[section.key].url && (
                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                            {localMedia[section.key].type === 'video' ? (
                              <video
                                src={localMedia[section.key].url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={localMedia[section.key].url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div
                              className="absolute inset-0 bg-background"
                              style={{ opacity: (localMedia[section.key].overlayOpacity || 70) / 100 }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <p className="text-foreground font-medium bg-background/50 px-4 py-2 rounded">
                                Sample Text Preview
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSectionMedia;
