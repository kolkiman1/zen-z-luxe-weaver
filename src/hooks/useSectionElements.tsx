import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SectionElement, ElementStyle, ElementAnimation } from '@/components/admin/SectionElementEditor';

export interface SectionElements {
  hero: SectionElement[];
  categories: SectionElement[];
  featuredProducts: SectionElement[];
  newArrivals: SectionElement[];
  brandBanner: SectionElement[];
}

const defaultAnimation: ElementAnimation = {
  type: 'none',
  duration: 500,
  delay: 0,
  easing: 'ease-out',
};

const defaultElementStyle: ElementStyle = {
  fontSize: 'base',
  fontWeight: 'normal',
  textAlign: 'center',
  color: '#ffffff',
  opacity: 1,
};

const defaultSectionElements: SectionElements = {
  hero: [
    {
      id: 'hero-badge',
      type: 'badge',
      content: 'New Collection',
      style: { ...defaultElementStyle, fontSize: 'sm', textTransform: 'uppercase', letterSpacing: 'wider' },
      animation: { ...defaultAnimation, type: 'fade', delay: 0 },
    },
    {
      id: 'hero-tagline',
      type: 'subheading',
      content: 'Discover Your Style',
      style: { ...defaultElementStyle, fontSize: 'lg', fontWeight: 'light' },
      animation: { ...defaultAnimation, type: 'slide-up', delay: 100 },
    },
    {
      id: 'hero-headline',
      type: 'heading',
      content: 'Elegance Redefined',
      style: { ...defaultElementStyle, fontSize: '5xl', fontWeight: 'bold' },
      animation: { ...defaultAnimation, type: 'slide-up', delay: 200 },
    },
    {
      id: 'hero-description',
      type: 'description',
      content: 'Explore our curated collection of premium fashion pieces',
      style: { ...defaultElementStyle, fontSize: 'lg', fontWeight: 'normal' },
      animation: { ...defaultAnimation, type: 'fade', delay: 300 },
    },
  ],
  categories: [
    {
      id: 'categories-headline',
      type: 'heading',
      content: 'Shop by Category',
      style: { ...defaultElementStyle, fontSize: '3xl', fontWeight: 'bold', color: 'hsl(var(--foreground))' },
      animation: { ...defaultAnimation, type: 'fade', delay: 0 },
    },
    {
      id: 'categories-description',
      type: 'description',
      content: 'Find the perfect style for every occasion',
      style: { ...defaultElementStyle, fontSize: 'lg', color: 'hsl(var(--muted-foreground))' },
      animation: { ...defaultAnimation, type: 'slide-up', delay: 100 },
    },
  ],
  featuredProducts: [
    {
      id: 'featured-headline',
      type: 'heading',
      content: 'Featured Products',
      style: { ...defaultElementStyle, fontSize: '3xl', fontWeight: 'bold', color: 'hsl(var(--foreground))' },
      animation: { ...defaultAnimation, type: 'fade', delay: 0 },
    },
    {
      id: 'featured-description',
      type: 'description',
      content: 'Handpicked selections just for you',
      style: { ...defaultElementStyle, fontSize: 'lg', color: 'hsl(var(--muted-foreground))' },
      animation: { ...defaultAnimation, type: 'slide-up', delay: 100 },
    },
  ],
  newArrivals: [
    {
      id: 'arrivals-badge',
      type: 'badge',
      content: 'Just Dropped',
      style: { ...defaultElementStyle, fontSize: 'sm', textTransform: 'uppercase', letterSpacing: 'wider' },
      animation: { ...defaultAnimation, type: 'fade', delay: 0 },
    },
    {
      id: 'arrivals-headline',
      type: 'heading',
      content: 'New Arrivals',
      style: { ...defaultElementStyle, fontSize: '4xl', fontWeight: 'bold' },
      animation: { ...defaultAnimation, type: 'slide-up', delay: 100 },
    },
    {
      id: 'arrivals-description',
      type: 'description',
      content: 'Be the first to discover our latest additions',
      style: { ...defaultElementStyle, fontSize: 'lg' },
      animation: { ...defaultAnimation, type: 'fade', delay: 200 },
    },
  ],
  brandBanner: [
    {
      id: 'brand-headline',
      type: 'heading',
      content: 'Premium Quality',
      style: { ...defaultElementStyle, fontSize: '4xl', fontWeight: 'bold' },
      animation: { ...defaultAnimation, type: 'scale', delay: 0 },
    },
    {
      id: 'brand-description',
      type: 'description',
      content: 'Crafted with care, designed to last',
      style: { ...defaultElementStyle, fontSize: 'xl' },
      animation: { ...defaultAnimation, type: 'fade', delay: 150 },
    },
  ],
};

export const useSectionElements = () => {
  return useQuery({
    queryKey: ['site-settings', 'section-elements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'section-elements')
        .maybeSingle();

      if (error) {
        console.error('Error fetching section elements:', error);
        return defaultSectionElements;
      }

      if (data?.value) {
        return { ...defaultSectionElements, ...(data.value as unknown as Partial<SectionElements>) };
      }

      return defaultSectionElements;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateSectionElements = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (elements: SectionElements) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'section-elements')
        .maybeSingle();

      const elementsJson = JSON.parse(JSON.stringify(elements));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: elementsJson, updated_at: new Date().toISOString() })
          .eq('key', 'section-elements');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'section-elements', value: elementsJson }]);

        if (error) throw error;
      }

      return elements;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'section-elements'] });
    },
  });
};

export { defaultSectionElements };
