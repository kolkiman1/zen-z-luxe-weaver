import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface HeroCategory {
  id: string;
  name: string;
  href: string;
  colorFrom: string;
  colorTo: string;
  enabled: boolean;
}

export interface HeroContentSettings {
  badgePrefix: string;
  badgeHighlight: string;
  badgeSuffix: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  categories: HeroCategory[];
}

export const defaultHeroContent: HeroContentSettings = {
  badgePrefix: "Bangladesh's",
  badgeHighlight: "Biggest",
  badgeSuffix: "Fashion Destination",
  headingLine1: "Redefine",
  headingLine2: "Your Style",
  description: "Curated collections that blend tradition with contemporary elegance for the modern generation.",
  primaryButtonText: "Explore Collection",
  primaryButtonLink: "/category/new-arrivals",
  secondaryButtonText: "Our Story",
  secondaryButtonLink: "/about",
  categories: [
    { id: 'cat-1', name: 'Women', href: '/category/women', colorFrom: 'rose-500/20', colorTo: 'pink-500/20', enabled: true },
    { id: 'cat-2', name: 'Men', href: '/category/men', colorFrom: 'blue-500/20', colorTo: 'indigo-500/20', enabled: true },
    { id: 'cat-3', name: 'Accessories', href: '/category/accessories', colorFrom: 'amber-500/20', colorTo: 'orange-500/20', enabled: true },
  ],
};

export const useHeroContent = () => {
  return useQuery({
    queryKey: ['hero-content-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_content')
        .maybeSingle();

      if (error) {
        console.error('Error fetching hero content:', error);
        return defaultHeroContent;
      }

      if (!data?.value) {
        return defaultHeroContent;
      }

      const value = data.value as Record<string, unknown>;
      return { ...defaultHeroContent, ...value } as HeroContentSettings;
    },
  });
};

export const useUpdateHeroContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: HeroContentSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'hero_content')
        .maybeSingle();

      const jsonValue = settings as unknown as Json;

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: jsonValue, updated_at: new Date().toISOString() })
          .eq('key', 'hero_content');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'hero_content', value: jsonValue }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-content-settings'] });
    },
  });
};
