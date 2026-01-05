import { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import NewArrivals from '@/components/home/NewArrivals';
import BrandBanner from '@/components/home/BrandBanner';
import Features from '@/components/home/Features';
import VideoShowcase from '@/components/home/VideoShowcase';
import ProductCollection from '@/components/home/ProductCollection';
import FloatingAnnouncementBar from '@/components/home/FloatingAnnouncementBar';
import { ProductChatbot } from '@/components/chat/ProductChatbot';
import { ParallaxSection } from '@/components/ui/parallax-section';
import AnnouncementPopup from '@/components/home/AnnouncementPopup';
import { SEOHead } from '@/components/SEOHead';
import { useSectionOrder, SectionId, isScheduledActive, SectionOrderItem } from '@/hooks/useSectionOrder';
import { useProductCollections } from '@/hooks/useProductCollections';
import { toast } from 'sonner';

type StaticSectionId = Exclude<SectionId, 'collection'>;

const sectionComponents: Record<StaticSectionId, React.ComponentType> = {
  hero: Hero,
  features: Features,
  videoShowcase: VideoShowcase,
  newArrivals: NewArrivals,
  categories: Categories,
  featuredProducts: FeaturedProducts,
  brandBanner: BrandBanner,
};

const parallaxConfig: Record<StaticSectionId, { speed: number; direction?: 'up' | 'down'; fadeIn?: boolean; scale?: boolean }> = {
  hero: { speed: 0 },
  features: { speed: 0.1, fadeIn: true },
  videoShowcase: { speed: 0.1, fadeIn: true },
  newArrivals: { speed: 0.15, direction: 'up', fadeIn: true },
  categories: { speed: 0.1, fadeIn: true },
  featuredProducts: { speed: 0.15, direction: 'up', fadeIn: true },
  brandBanner: { speed: 0.2, fadeIn: true, scale: true },
};

const Index = () => {
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';
  const [previewOrder, setPreviewOrder] = useState<SectionOrderItem[] | null>(null);
  
  const { data: sectionOrder } = useSectionOrder();
  const { data: collections } = useProductCollections();

  // Load preview order from sessionStorage
  useEffect(() => {
    if (isPreviewMode) {
      const storedOrder = sessionStorage.getItem('preview-section-order');
      if (storedOrder) {
        try {
          setPreviewOrder(JSON.parse(storedOrder));
          toast.info('Preview mode: showing unpublished section order', { duration: 5000 });
        } catch (e) {
          console.error('Failed to parse preview order:', e);
        }
      }
    }
  }, [isPreviewMode]);

  const effectiveOrder = isPreviewMode && previewOrder ? previewOrder : sectionOrder;

  const enabledSections = useMemo(() => {
    return effectiveOrder?.filter(s => isScheduledActive(s)) || [];
  }, [effectiveOrder]);

  return (
    <>
      <SEOHead url="/" />
      
      <FloatingAnnouncementBar />
      <Header />
      <CartSidebar />

      <main className="overflow-hidden">
        {enabledSections.map((section) => {
          // Handle collection sections
          if (section.id === 'collection' && section.collectionId) {
            const collection = collections?.find(c => c.id === section.collectionId);
            if (!collection?.enabled) return null;
            
            return (
              <section key={`collection-${section.collectionId}`} className="scroll-snap-section">
                <ParallaxSection speed={0.15} direction="up" fadeIn>
                  <ProductCollection collection={collection} />
                </ParallaxSection>
              </section>
            );
          }

          const Component = sectionComponents[section.id as StaticSectionId];
          const config = parallaxConfig[section.id as StaticSectionId];
          
          if (!Component) return null;
          
          // Hero doesn't use parallax wrapper
          if (section.id === 'hero') {
            return (
              <section key={section.id} className="scroll-snap-section">
                <Component />
              </section>
            );
          }

          return (
            <section key={section.id} className="scroll-snap-section">
              <ParallaxSection 
                speed={config?.speed || 0.1} 
                direction={config?.direction}
                fadeIn={config?.fadeIn}
                scale={config?.scale}
              >
                <Component />
              </ParallaxSection>
            </section>
          );
        })}
      </main>

      <Footer />
      <ProductChatbot />
      <AnnouncementPopup />
    </>
  );
};

export default Index;
