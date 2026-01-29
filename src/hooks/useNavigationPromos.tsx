import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  defaultNavigationPromos,
  type NavigationPromo,
  type NavigationPromoThemeId,
} from '@/lib/navigationPromos';

export type NavigationPromosSettings = Record<NavigationPromoThemeId, NavigationPromo>;

const DEFAULT: NavigationPromosSettings = defaultNavigationPromos;
const KEY = 'navigation-promos';

const isThemeId = (v: unknown): v is NavigationPromoThemeId =>
  v === 'artisan' || v === 'editorial' || v === 'brutalist';

const normalize = (value: unknown): NavigationPromosSettings => {
  if (!value || typeof value !== 'object') return DEFAULT;
  const v = value as any;
  const out: any = { ...DEFAULT };

  (['artisan', 'editorial', 'brutalist'] as const).forEach((theme) => {
    const incoming = v?.[theme];
    if (!incoming || typeof incoming !== 'object') return;
    out[theme] = {
      eyebrow: typeof incoming.eyebrow === 'string' ? incoming.eyebrow : DEFAULT[theme].eyebrow,
      title: typeof incoming.title === 'string' ? incoming.title : DEFAULT[theme].title,
      description: typeof incoming.description === 'string' ? incoming.description : DEFAULT[theme].description,
      href: typeof incoming.href === 'string' ? incoming.href : DEFAULT[theme].href,
      image: typeof incoming.image === 'string' ? incoming.image : DEFAULT[theme].image,
    };
  });

  // If someone stored a wrapped object, accept it.
  if (v?.theme && typeof v.theme === 'object') {
    const t = v.theme;
    if (isThemeId(t.activeTheme) && t.promos && typeof t.promos === 'object') {
      return normalize(t.promos);
    }
  }

  return out as NavigationPromosSettings;
};

export const useNavigationPromos = () => {
  return useQuery({
    queryKey: ['site-settings', KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', KEY)
        .maybeSingle();

      if (error) {
        console.error('Error fetching navigation promos:', error);
        return DEFAULT;
      }

      return data?.value ? normalize(data.value) : DEFAULT;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateNavigationPromos = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (settings: NavigationPromosSettings) => {
      const value = normalize(settings);
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          {
            key: KEY,
            value: value as any,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'key' }
        );

      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['site-settings', KEY] });
    },
  });
};
