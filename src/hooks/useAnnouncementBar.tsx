import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: string;
  text: string;
  highlight?: string;
  link?: string;
  icon: 'zap' | 'gift' | 'truck' | 'clock' | 'sparkles';
  enabled: boolean;
}

export interface AnnouncementBarSettings {
  enabled: boolean;
  showCountdown: boolean;
  countdownDays: number;
  autoRotate: boolean;
  rotationInterval: number;
  backgroundColor: string;
  promotions: Promotion[];
}

export const defaultAnnouncementSettings: AnnouncementBarSettings = {
  enabled: true,
  showCountdown: true,
  countdownDays: 7,
  autoRotate: true,
  rotationInterval: 4000,
  backgroundColor: 'primary',
  promotions: [
    { id: '1', text: 'Winter Sale', highlight: 'Up to 50% OFF', link: '/category/sale', icon: 'zap', enabled: true },
    { id: '2', text: 'Free Shipping on orders over', highlight: '৳1000', link: '/shipping', icon: 'truck', enabled: true },
    { id: '3', text: 'New Arrivals', highlight: 'Shop Now', link: '/category/new-arrivals', icon: 'gift', enabled: true },
  ],
};

export const useAnnouncementBar = () => {
  return useQuery({
    queryKey: ['site-settings', 'announcement-bar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'announcement-bar')
        .maybeSingle();

      if (error) {
        console.error('Error fetching announcement bar settings:', error);
        return defaultAnnouncementSettings;
      }

      if (data?.value) {
        return { ...defaultAnnouncementSettings, ...(data.value as unknown as Partial<AnnouncementBarSettings>) };
      }

      return defaultAnnouncementSettings;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });
};

export const useUpdateAnnouncementBar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AnnouncementBarSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'announcement-bar')
        .maybeSingle();

      const settingsJson = JSON.parse(JSON.stringify(settings));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: settingsJson, updated_at: new Date().toISOString() })
          .eq('key', 'announcement-bar');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'announcement-bar', value: settingsJson }]);

        if (error) throw error;
      }

      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'announcement-bar'] });
    },
  });
};
