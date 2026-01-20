import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  ogImage: string;
  twitterHandle: string;
  canonicalUrl: string;
}

interface TrackingSettings {
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleTagManagerId: string;
}

const defaultSeoSettings: SeoSettings = {
  siteTitle: 'Zen Zee Store | Premium Fashion for the Next Generation',
  siteDescription: 'Discover premium fashion, exquisite jewelry, and luxury accessories at Zen Zee Store. Curated collections for the modern Bangladeshi.',
  keywords: 'premium fashion, luxury clothing, Bangladesh, jewelry, accessories, men fashion, women fashion',
  ogImage: '',
  twitterHandle: '',
  canonicalUrl: 'https://zen-zee.store',
};

const defaultTrackingSettings: TrackingSettings = {
  googleAnalyticsId: '',
  facebookPixelId: '',
  googleTagManagerId: '',
};

export const useSeoSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'seo'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'seo')
        .maybeSingle();

      if (error) {
        console.error('Error fetching SEO settings:', error);
        return defaultSeoSettings;
      }

      if (data?.value) {
        return { ...defaultSeoSettings, ...(data.value as unknown as Partial<SeoSettings>) };
      }

      return defaultSeoSettings;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};

export const useTrackingSettings = () => {
  return useQuery({
    queryKey: ['site-settings', 'tracking'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'tracking')
        .maybeSingle();

      if (error) {
        console.error('Error fetching tracking settings:', error);
        return defaultTrackingSettings;
      }

      if (data?.value) {
        return { ...defaultTrackingSettings, ...(data.value as unknown as Partial<TrackingSettings>) };
      }

      return defaultTrackingSettings;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSiteSettings = () => {
  const { data: seoSettings, isLoading: seoLoading } = useSeoSettings();
  const { data: trackingSettings, isLoading: trackingLoading } = useTrackingSettings();

  return {
    seoSettings: seoSettings || defaultSeoSettings,
    trackingSettings: trackingSettings || defaultTrackingSettings,
    isLoading: seoLoading || trackingLoading,
  };
};
