import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SectionId = 'hero' | 'features' | 'newArrivals' | 'categories' | 'featuredProducts' | 'brandBanner' | 'collection';

export interface SectionOrderItem {
  id: SectionId;
  label: string;
  enabled: boolean;
  startDate?: string | null;
  endDate?: string | null;
  collectionId?: string;
}

export const defaultSectionOrder: SectionOrderItem[] = [
  { id: 'hero', label: 'Hero Banner', enabled: true },
  { id: 'features', label: 'Features Bar', enabled: true },
  { id: 'newArrivals', label: 'New Arrivals', enabled: true },
  { id: 'categories', label: 'Categories', enabled: true },
  { id: 'featuredProducts', label: 'Featured Products', enabled: true },
  { id: 'brandBanner', label: 'Brand Banner', enabled: true },
];

export const isScheduledActive = (item: SectionOrderItem): boolean => {
  if (!item.enabled) return false;
  const now = new Date();
  if (item.startDate && new Date(item.startDate) > now) return false;
  if (item.endDate && new Date(item.endDate) < now) return false;
  return true;
};

export const useSectionOrder = () => {
  return useQuery({
    queryKey: ['site-settings', 'section-order'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'section-order')
        .maybeSingle();

      if (error) {
        console.error('Error fetching section order:', error);
        return defaultSectionOrder;
      }

      if (data?.value && Array.isArray(data.value)) {
        // Merge with defaults to ensure all sections exist
        const savedOrder = data.value as unknown as SectionOrderItem[];
        const merged = defaultSectionOrder.map(defaultItem => {
          const saved = savedOrder.find(s => s.id === defaultItem.id);
          return saved || defaultItem;
        });
        // Maintain saved order
        const orderedIds = savedOrder.map(s => s.id);
        merged.sort((a, b) => {
          const aIdx = orderedIds.indexOf(a.id);
          const bIdx = orderedIds.indexOf(b.id);
          if (aIdx === -1 && bIdx === -1) return 0;
          if (aIdx === -1) return 1;
          if (bIdx === -1) return -1;
          return aIdx - bIdx;
        });
        return merged;
      }

      return defaultSectionOrder;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateSectionOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: SectionOrderItem[]) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'section-order')
        .maybeSingle();

      const orderJson = JSON.parse(JSON.stringify(order));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: orderJson, updated_at: new Date().toISOString() })
          .eq('key', 'section-order');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'section-order', value: orderJson }]);

        if (error) throw error;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'section-order'] });
    },
  });
};
