import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  filterType: 'manual' | 'on_sale' | 'best_sellers' | 'new' | 'category';
  filterValue?: string;
  productIds?: string[];
  enabled: boolean;
  displayStyle: 'carousel' | 'grid';
  maxProducts: number;
}

export const defaultCollections: ProductCollection[] = [
  {
    id: 'best-sellers',
    name: 'Best Sellers',
    slug: 'best-sellers',
    description: 'Our most popular products',
    filterType: 'best_sellers',
    enabled: false,
    displayStyle: 'carousel',
    maxProducts: 8,
  },
  {
    id: 'on-sale',
    name: 'On Sale',
    slug: 'on-sale',
    description: 'Great deals on premium items',
    filterType: 'on_sale',
    enabled: false,
    displayStyle: 'carousel',
    maxProducts: 8,
  },
];

export const useProductCollections = () => {
  return useQuery({
    queryKey: ['site-settings', 'product-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'product-collections')
        .maybeSingle();

      if (error) {
        console.error('Error fetching product collections:', error);
        return defaultCollections;
      }

      if (data?.value && Array.isArray(data.value)) {
        return data.value as unknown as ProductCollection[];
      }

      return defaultCollections;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

export const useUpdateProductCollections = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collections: ProductCollection[]) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'product-collections')
        .maybeSingle();

      const collectionsJson = JSON.parse(JSON.stringify(collections));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: collectionsJson, updated_at: new Date().toISOString() })
          .eq('key', 'product-collections');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'product-collections', value: collectionsJson }]);

        if (error) throw error;
      }

      return collections;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'product-collections'] });
    },
  });
};
