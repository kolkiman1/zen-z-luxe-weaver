import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { themePreviewStorage } from '@/contexts/ThemeContext';
import { useThemeSettings, useUpdateThemeSettings, type ThemeId } from '@/hooks/useThemeSettings';

type ThemeOption = {
  id: ThemeId;
  name: string;
  description: string;
};

const themes: ThemeOption[] = [
  {
    id: 'artisan',
    name: 'Artisan Boutique',
    description: 'Warm, textured, boutique vibe with soft shapes and earthy tones.',
  },
  {
    id: 'editorial',
    name: 'Editorial Luxury',
    description: 'High-fashion editorial layout with refined light palette and airy spacing.',
  },
  {
    id: 'brutalist',
    name: 'Brutalist Streetwear',
    description: 'Sharp, high-contrast, grid-forward styling with bold typography.',
  },
];

const AdminThemes = () => {
  const { data: themeSettings, isLoading } = useThemeSettings();
  const updateTheme = useUpdateThemeSettings();
  const [selected, setSelected] = useState<ThemeId>('editorial');

  useEffect(() => {
    if (themeSettings?.activeTheme) setSelected(themeSettings.activeTheme);
  }, [themeSettings?.activeTheme]);

  const activeTheme = themeSettings?.activeTheme ?? 'editorial';

  const selectedMeta = useMemo(() => themes.find(t => t.id === selected), [selected]);

  const handlePreview = () => {
    themePreviewStorage.enable(selected);
    toast.success('Preview enabled', { description: `Previewing: ${selectedMeta?.name ?? selected}` });
  };

  const handleStopPreview = () => {
    themePreviewStorage.disable();
    toast.message('Preview disabled');
  };

  const handleApply = async () => {
    try {
      await updateTheme.mutateAsync({ activeTheme: selected });
      themePreviewStorage.disable();
      toast.success('Theme applied', { description: `Active theme is now: ${selectedMeta?.name ?? selected}` });
    } catch (e) {
      console.error(e);
      toast.error('Failed to apply theme');
    }
  };

  return (
    <>
      <Helmet>
        <title>Themes | Admin</title>
      </Helmet>

      <AdminLayout title="Themes">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>Theme Manager</span>
                  <Badge variant="secondary" className="whitespace-nowrap">
                    Active: {activeTheme}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose a theme, click <span className="font-medium text-foreground">Preview</span> to see it instantly (admin-only), then
                  <span className="font-medium text-foreground"> Apply</span> to publish it for everyone.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {themes.map((t) => {
                    const isSelected = selected === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelected(t.id)}
                        className={
                          `text-left rounded-xl border p-4 transition-colors ` +
                          (isSelected
                            ? 'border-primary/40 bg-primary/10'
                            : 'border-border/50 hover:border-border hover:bg-secondary/20')
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-lg leading-tight">{t.name}</p>
                            <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                          </div>
                          {activeTheme === t.id && (
                            <Badge className="shrink-0" variant="secondary">Current</Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button onClick={handlePreview} disabled={isLoading} className="btn-primary">
                    Preview
                  </Button>
                  <Button variant="outline" onClick={handleStopPreview} disabled={isLoading}>
                    Stop Preview
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleApply}
                    disabled={isLoading || updateTheme.isPending}
                    className="sm:ml-auto"
                  >
                    {updateTheme.isPending ? 'Applying…' : 'Apply to Everyone'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-7">
            <Card className="border-border/50 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>Live Preview</span>
                  <span className="text-xs text-muted-foreground">Updates instantly when you click Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden border border-border/50 bg-card">
                  <iframe
                    title="Storefront Preview"
                    src="/"
                    className="w-full h-[680px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminThemes;
