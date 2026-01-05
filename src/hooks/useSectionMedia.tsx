import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import heroWomenFashion from '@/assets/hero-women-fashion.jpg';

export type SectionHeight = 'auto' | 'small' | 'medium' | 'large' | 'full';

export interface SectionMediaItem {
  type: 'image' | 'video' | 'none';
  url: string;
  overlayOpacity?: number;
  height?: SectionHeight;
}

export interface SectionMedia {
  hero: SectionMediaItem;
  categories: SectionMediaItem;
  featuredProducts: SectionMediaItem;
  newArrivals: SectionMediaItem;
  brandBanner: SectionMediaItem;
}

const defaultSectionMedia: SectionMedia = {
  hero: {
    type: 'image',
    url: heroWomenFashion,
    overlayOpacity: 65,
    height: 'large',
  },
  categories: {
    type: 'none',
    url: '',
    overlayOpacity: 70,
    height: 'auto',
  },
  featuredProducts: {
    type: 'none',
    url: '',
    overlayOpacity: 70,
    height: 'auto',
  },
  newArrivals: {
    type: 'video',
    url: '/videos/new-arrivals-bg.mp4',
    overlayOpacity: 80,
    height: 'medium',
  },
  brandBanner: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80',
    overlayOpacity: 60,
    height: 'medium',
  },
};

export const useSectionMedia = () => {
  return useQuery({
    queryKey: ['site-settings', 'section-media'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'section-media')
        .maybeSingle();

      if (error) {
        console.error('Error fetching section media settings:', error);
        return defaultSectionMedia;
      }

      if (data?.value) {
        return { ...defaultSectionMedia, ...(data.value as unknown as Partial<SectionMedia>) };
      }

      return defaultSectionMedia;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateSectionMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (media: SectionMedia) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'section-media')
        .maybeSingle();

      const mediaJson = JSON.parse(JSON.stringify(media));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: mediaJson, updated_at: new Date().toISOString() })
          .eq('key', 'section-media');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'section-media', value: mediaJson }]);

        if (error) throw error;
      }

      return media;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'section-media'] });
    },
  });
};

export { defaultSectionMedia };
