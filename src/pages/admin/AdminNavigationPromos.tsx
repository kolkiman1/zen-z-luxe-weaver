import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Sparkles } from 'lucide-react';
import {
  useNavigationPromos,
  useUpdateNavigationPromos,
  type NavigationPromosSettings,
} from '@/hooks/useNavigationPromos';

type ThemeId = 'artisan' | 'editorial' | 'brutalist';

const THEME_LABELS: Record<ThemeId, string> = {
  artisan: 'Artisan',
  editorial: 'Editorial',
  brutalist: 'Brutalist',
};

const AdminNavigationPromos = () => {
  const { data, isLoading } = useNavigationPromos();
  const update = useUpdateNavigationPromos();
  const [tab, setTab] = useState<ThemeId>('editorial');
  const [local, setLocal] = useState<NavigationPromosSettings | null>(null);

  useEffect(() => {
    if (data && !local) setLocal(data);
  }, [data, local]);

  const setField = (field: keyof NavigationPromosSettings[ThemeId], value: string) => {
    setLocal((prev) => {
      const base = prev ?? (data as NavigationPromosSettings);
      if (!base) return prev;
      return {
        ...base,
        [tab]: {
          ...base[tab],
          [field]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!local) return;
    try {
      await update.mutateAsync(local);
      toast.success('Navigation promos saved', { description: 'Promo blocks updated for all themes.' });
    } catch (e) {
      console.error(e);
      toast.error('Failed to save promos');
    }
  };

  return (
    <>
      <Helmet>
        <title>Navigation Promos | Admin</title>
      </Helmet>

      <AdminLayout title="Navigation Promos">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Navigation Promos</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Configure the promo blocks shown inside the menu for each theme.
            </p>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Promo Block Settings
                </CardTitle>
                <CardDescription>
                  Changes apply immediately after saving (storefront reads from backend settings).
                </CardDescription>
              </div>
              <Button onClick={() => void handleSave()} disabled={isLoading || update.isPending || !local} className="gap-2">
                {update.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </Button>
            </CardHeader>

            <CardContent>
              <Tabs value={tab} onValueChange={(v) => setTab(v as ThemeId)}>
                <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
                  {(Object.keys(THEME_LABELS) as ThemeId[]).map((t) => (
                    <TabsTrigger key={t} value={t} className="flex-1 min-w-[120px] text-xs sm:text-sm py-2">
                      {THEME_LABELS[t]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {(Object.keys(THEME_LABELS) as ThemeId[]).map((t) => (
                  <TabsContent key={t} value={t} className="mt-6">
                    {!(local ?? data)?.[t] ? (
                      <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      (() => {
                        const promo = (local ?? (data as NavigationPromosSettings))?.[t];
                        if (!promo) return null;
                        return (
                      <div className="grid gap-6 lg:grid-cols-2">
                        <div className="space-y-5">
                          <div className="space-y-2">
                            <Label>Eyebrow</Label>
                            <Input value={promo.eyebrow} onChange={(e) => setField('eyebrow', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={promo.title} onChange={(e) => setField('title', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea rows={4} value={promo.description} onChange={(e) => setField('description', e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Link (href)</Label>
                            <Input value={promo.href} onChange={(e) => setField('href', e.target.value)} placeholder="/category/women?sub=sarees" />
                          </div>
                          <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input value={promo.image} onChange={(e) => setField('image', e.target.value)} placeholder="/products/banarasi-silk-saree-1.jpg" />
                            <p className="text-xs text-muted-foreground">Use a public URL or a /public path.</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="border border-border/60 bg-card overflow-hidden">
                            <div className="h-44 bg-muted overflow-hidden">
                              <img src={promo.image} alt={promo.title} loading="lazy" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-4">
                              <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">{promo.eyebrow}</p>
                              <p className="mt-1 font-display text-lg leading-tight">{promo.title}</p>
                              <p className="mt-2 text-sm text-muted-foreground">{promo.description}</p>
                              <p className="mt-3 text-xs text-primary">Link: {promo.href}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                        );
                      })()
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminNavigationPromos;
