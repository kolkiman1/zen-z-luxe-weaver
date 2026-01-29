import { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { themePreviewStorage } from '@/contexts/ThemeContext';
import { useThemeSettings, useUpdateThemeSettings, type ThemeId } from '@/hooks/useThemeSettings';
import { defaultThemePack, isThemeId, type ThemePackV1 } from '@/lib/themePack';

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
  const [previewStarted, setPreviewStarted] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (themeSettings?.activeTheme) setSelected(themeSettings.activeTheme);
  }, [themeSettings?.activeTheme]);

  const activeTheme = themeSettings?.activeTheme ?? 'editorial';

  const selectedMeta = useMemo(() => themes.find(t => t.id === selected), [selected]);

  const exportThemeJson = () => {
    const themePack = themeSettings?.themePack ?? defaultThemePack;
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      theme: {
        activeTheme: themeSettings?.activeTheme ?? selected,
        themePack,
      },
    };
    return JSON.stringify(payload, null, 2);
  };

  const downloadTheme = () => {
    try {
      const json = exportThemeJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-pack.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('Theme exported', { description: 'Downloaded a theme JSON file.' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to export theme');
    }
  };

  const copyThemeJson = async () => {
    try {
      const json = exportThemeJson();
      await navigator.clipboard.writeText(json);
      toast.success('Copied', { description: 'Theme JSON copied to clipboard.' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to copy');
    }
  };

  const validateImportedTheme = (obj: unknown): { activeTheme: ThemeId; themePack: ThemePackV1 } | null => {
    if (!obj || typeof obj !== 'object') return null;
    // Accept either raw ThemeSettings or the exported wrapper.
    const maybeAny = obj as any;
    const themeObj = maybeAny?.theme ?? maybeAny;
    const id = themeObj?.activeTheme;
    const pack = themeObj?.themePack;
    if (!isThemeId(id)) return null;
    // If pack isn't provided, fall back to defaults.
    const normalizedPack: ThemePackV1 = pack && typeof pack === 'object' ? pack : defaultThemePack;
    return { activeTheme: id, themePack: normalizedPack };
  };

  const handleImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const imported = validateImportedTheme(parsed);
      if (!imported) {
        toast.error('Invalid theme file', { description: 'Expected JSON with { activeTheme: "artisan"|"editorial"|"brutalist" }' });
        return;
      }

      // Import + Apply (as requested): publish immediately.
      await updateTheme.mutateAsync({
        activeTheme: imported.activeTheme,
        themePack: imported.themePack,
      } as any);
      themePreviewStorage.disable();
      setPreviewStarted(false);
      setSelected(imported.activeTheme);
      toast.success('Theme pack imported & applied', { description: `Active theme is now: ${themes.find(t => t.id === imported.activeTheme)?.name ?? imported.activeTheme}` });
    } catch (e) {
      console.error(e);
      toast.error('Failed to import theme');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handlePreview = () => {
    themePreviewStorage.enable(selected);
    setPreviewStarted(true);
    window.open('/', '_blank', 'noopener,noreferrer');
    toast.success('Preview enabled', { description: `Opened storefront preview for: ${selectedMeta?.name ?? selected}` });
  };

  // Auto-stop preview when leaving the Themes page or reloading.
  useEffect(() => {
    if (!previewStarted) return;

    const stop = () => {
      themePreviewStorage.disable();
      setPreviewStarted(false);
    };

    const onBeforeUnload = () => stop();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      stop();
    };
  }, [previewStarted]);

  const handleApply = async () => {
    try {
      await updateTheme.mutateAsync({
        activeTheme: selected,
        themePack: themeSettings?.themePack ?? defaultThemePack,
      });
      themePreviewStorage.disable();
      setPreviewStarted(false);
      toast.success('Theme applied', { description: `Active theme is now: ${selectedMeta?.name ?? selected}` });
    } catch (e) {
      console.error(e);
      toast.error('Failed to apply theme');
    }
  };

  const handleRestoreDefaults = async () => {
    try {
      await updateTheme.mutateAsync({
        activeTheme,
        themePack: defaultThemePack,
      } as any);
      themePreviewStorage.disable();
      setPreviewStarted(false);
      setSelected(activeTheme);
      toast.success('Defaults restored', { description: 'Theme tokens were reset to the built-in defaults and applied.' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to restore defaults');
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
                  Choose a theme, then click <span className="font-medium text-foreground">Preview in new tab</span> to open the storefront with an
                  admin-only preview applied. Preview automatically turns off when you leave this page.
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
                    Preview in new tab
                  </Button>

                  <input
                    ref={importInputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleImportFile(file);
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadTheme}
                    disabled={isLoading}
                  >
                    Export
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void copyThemeJson()}
                    disabled={isLoading}
                  >
                    Copy JSON
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => importInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    Import
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleRestoreDefaults()}
                    disabled={isLoading || updateTheme.isPending}
                  >
                    Restore defaults
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
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Use <span className="font-medium text-foreground">Preview in new tab</span> to view the storefront with your selected theme before
                  applying it for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminThemes;
