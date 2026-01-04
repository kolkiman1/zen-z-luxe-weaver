import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryBanner {
  type: 'image' | 'video';
  url: string;
  overlayOpacity: number;
  headline?: string;
  description?: string;
}

export type CategoryBanners = Record<string, CategoryBanner>;

export const defaultCategoryBanners: CategoryBanners = {
  men: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=1920&q=80',
    overlayOpacity: 60,
    headline: "Men's Collection",
    description: 'Premium fashion for the modern gentleman',
  },
  women: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80',
    overlayOpacity: 60,
    headline: "Women's Collection",
    description: 'Elegant styles for every occasion',
  },
  jewelry: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80',
    overlayOpacity: 60,
    headline: 'Jewelry',
    description: 'Exquisite pieces to complete your look',
  },
  accessories: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1920&q=80',
    overlayOpacity: 60,
    headline: 'Accessories',
    description: 'The finishing touches of luxury',
  },
  all: {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=80',
    overlayOpacity: 60,
    headline: 'All Products',
    description: 'Browse our complete collection',
  },
  'new-arrivals': {
    type: 'image',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
    overlayOpacity: 60,
    headline: 'New Arrivals',
    description: 'Fresh styles just landed',
  },
};

export const useCategoryBanners = () => {
  return useQuery({
    queryKey: ['site-settings', 'category-banners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'category-banners')
        .maybeSingle();

      if (error) {
        console.error('Error fetching category banners:', error);
        return defaultCategoryBanners;
      }

      if (data?.value) {
        return { ...defaultCategoryBanners, ...(data.value as unknown as CategoryBanners) };
      }

      return defaultCategoryBanners;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateCategoryBanners = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (banners: CategoryBanners) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'category-banners')
        .maybeSingle();

      const bannersJson = JSON.parse(JSON.stringify(banners));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: bannersJson, updated_at: new Date().toISOString() })
          .eq('key', 'category-banners');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'category-banners', value: bannersJson }]);

        if (error) throw error;
      }

      return banners;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'category-banners'] });
    },
  });
};
