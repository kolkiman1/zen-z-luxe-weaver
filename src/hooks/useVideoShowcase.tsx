import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductHighlight {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  link: string;
  enabled: boolean;
}

export interface VideoShowcaseSettings {
  enabled: boolean;
  videoUrl: string;
  autoplay: boolean;
  muted: boolean;
  showControls: boolean;
  tagline: string;
  headline: string;
  headlineHighlight: string;
  description: string;
  sideHeadline: string;
  productHighlights: ProductHighlight[];
}

export const defaultVideoShowcaseSettings: VideoShowcaseSettings = {
  enabled: true,
  videoUrl: '/videos/new-arrivals-bg.mp4',
  autoplay: true,
  muted: true,
  showControls: true,
  tagline: 'Featured Collection',
  headline: 'Experience the',
  headlineHighlight: 'Elegance',
  description: 'Discover our handpicked collection of premium fashion pieces crafted for the modern generation.',
  sideHeadline: 'Trending This Season',
  productHighlights: [
    {
      id: '1',
      name: 'Royal Sherwani Set',
      category: 'Traditional Wear',
      price: '৳12,500',
      image: '/products/royal-sherwani-set-1.webp',
      link: '/product/royal-sherwani-set',
      enabled: true,
    },
    {
      id: '2',
      name: 'Banarasi Silk Saree',
      category: 'Ethnic Wear',
      price: '৳8,900',
      image: '/products/banarasi-silk-saree-1.jpg',
      link: '/product/banarasi-silk-saree',
      enabled: true,
    },
    {
      id: '3',
      name: 'Designer Anarkali',
      category: 'Party Wear',
      price: '৳6,500',
      image: '/products/designer-anarkali-suit-1.jpg',
      link: '/product/designer-anarkali-suit',
      enabled: true,
    },
    {
      id: '4',
      name: 'Lehenga Choli Set',
      category: 'Bridal Collection',
      price: '৳15,000',
      image: '/products/lehenga-choli-set-1.jpg',
      link: '/product/lehenga-choli-set',
      enabled: true,
    },
  ],
};

export const useVideoShowcase = () => {
  return useQuery({
    queryKey: ['site-settings', 'video-showcase'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'video-showcase')
        .maybeSingle();

      if (error) {
        console.error('Error fetching video showcase settings:', error);
        return defaultVideoShowcaseSettings;
      }

      if (data?.value) {
        return { ...defaultVideoShowcaseSettings, ...(data.value as unknown as Partial<VideoShowcaseSettings>) };
      }

      return defaultVideoShowcaseSettings;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateVideoShowcase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: VideoShowcaseSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'video-showcase')
        .maybeSingle();

      const settingsJson = JSON.parse(JSON.stringify(settings));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: settingsJson, updated_at: new Date().toISOString() })
          .eq('key', 'video-showcase');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'video-showcase', value: settingsJson }]);

        if (error) throw error;
      }

      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'video-showcase'] });
    },
  });
};
