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

const withTimeout = async <T,>(promiseLike: PromiseLike<T>, ms: number): Promise<T> => {
  let t: number | undefined;
  const timeout = new Promise<T>((_resolve, reject) => {
    t = window.setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  try {
    const promise = Promise.resolve(promiseLike);
    return await Promise.race([promise, timeout]);
  } finally {
    if (t) window.clearTimeout(t);
  }
};

export const useThemeSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'theme'],
    queryFn: async () => {
      // Prevent the admin Themes page from getting stuck if the request hangs.
      const res = await withTimeout(
        (supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'theme')
          .maybeSingle() as unknown as PromiseLike<{ data: any; error: any }>),
        8000
      );

      const { data, error } = res;

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
    retry: 1,
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
