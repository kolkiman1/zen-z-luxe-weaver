import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SectionContent {
  hero: {
    tagline: string;
    headline: string;
    headlineHighlight: string;
    description: string;
    badgeText: string;
  };
  features: {
    items: Array<{
      title: string;
      description: string;
    }>;
  };
  newArrivals: {
    headline: string;
    headlineHighlight: string;
    description: string;
  };
  categories: {
    headline: string;
    headlineHighlight: string;
    description: string;
  };
  featuredProducts: {
    tagline: string;
    headline: string;
    headlineHighlight: string;
    description: string;
  };
  brandBanner: {
    tagline: string;
    headline: string;
    headlineHighlight: string;
    description: string;
  };
}

export const defaultSectionContent: SectionContent = {
  hero: {
    tagline: 'Premium Fashion for the Next Generation',
    headline: 'Elevate Your',
    headlineHighlight: 'Signature Style',
    description: 'Discover curated luxury fashion, exquisite jewelry, and premium accessories designed for the modern Bangladeshi.',
    badgeText: "Bangladesh's Biggest Trendy Fashion Shop",
  },
  features: {
    items: [
      { title: 'Free Delivery', description: 'Free shipping on orders above ৳5,000 across Bangladesh' },
      { title: 'Secure Payment', description: 'Your payment information is safe with us' },
      { title: 'Easy Returns', description: '7-day hassle-free return and exchange policy' },
      { title: '24/7 Support', description: 'Dedicated customer support anytime, anywhere' },
    ],
  },
  newArrivals: {
    headline: 'New',
    headlineHighlight: 'Arrivals',
    description: 'The latest additions to our premium collection',
  },
  categories: {
    headline: 'Shop by',
    headlineHighlight: 'Category',
    description: 'Explore our curated collections of premium fashion and accessories',
  },
  featuredProducts: {
    tagline: 'Curated for You',
    headline: 'Featured',
    headlineHighlight: 'Collection',
    description: 'Handpicked premium pieces that define luxury and elegance',
  },
  brandBanner: {
    tagline: 'The Gen-Zee Promise',
    headline: 'Crafted with Passion,',
    headlineHighlight: 'Designed for You',
    description: 'We believe luxury should be accessible. Every piece in our collection is carefully curated to bring you premium quality, timeless design, and exceptional value. Experience the difference of true craftsmanship.',
  },
};

export const useSectionContent = () => {
  return useQuery({
    queryKey: ['site-settings', 'section-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'section-content')
        .maybeSingle();

      if (error) {
        console.error('Error fetching section content:', error);
        return defaultSectionContent;
      }

      if (data?.value) {
        return { ...defaultSectionContent, ...(data.value as unknown as Partial<SectionContent>) };
      }

      return defaultSectionContent;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateSectionContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: SectionContent) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'section-content')
        .maybeSingle();

      const contentJson = JSON.parse(JSON.stringify(content));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: contentJson, updated_at: new Date().toISOString() })
          .eq('key', 'section-content');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'section-content', value: contentJson }]);

        if (error) throw error;
      }

      return content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'section-content'] });
    },
  });
};

export { defaultSectionContent as sectionContentDefaults };
