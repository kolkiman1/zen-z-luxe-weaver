import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { defaultThemePack, type ThemePackV1 } from '@/lib/themePack';

export type ThemeId = 'artisan' | 'editorial' | 'brutalist';

export interface ThemeSettings {
  activeTheme: ThemeId;
  themePack: ThemePackV1;
}

const defaultThemeSettings: ThemeSettings = {
  activeTheme: 'editorial',
  themePack: defaultThemePack,
};

export const useThemeSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'theme'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'theme')
        .maybeSingle();

      if (error) {
        console.error('Error fetching theme settings:', error);
        return defaultThemeSettings;
      }

      if (data?.value) {
        const stored = data.value as unknown as Partial<ThemeSettings>;
        // Backwards compat: previously we stored only { activeTheme }
        const merged: ThemeSettings = {
          ...defaultThemeSettings,
          ...stored,
          themePack: (stored as any)?.themePack ?? defaultThemeSettings.themePack,
        };
        return merged;
      }

      return defaultThemeSettings;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateThemeSettings = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (settings: ThemeSettings) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert(
          {
            key: 'theme',
            value: settings as unknown as any,
            updated_at: new Date().toISOString(),
          } as any,
          { onConflict: 'key' }
        );

      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['site-settings', 'theme'] });
    },
  });
};
