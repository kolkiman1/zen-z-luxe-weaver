import { useMemo } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import NewArrivals from '@/components/home/NewArrivals';
import BrandBanner from '@/components/home/BrandBanner';
import Features from '@/components/home/Features';
import { ProductChatbot } from '@/components/chat/ProductChatbot';
import { ParallaxSection } from '@/components/ui/parallax-section';
import AnnouncementPopup from '@/components/home/AnnouncementPopup';
import { SEOHead } from '@/components/SEOHead';
import { useSectionOrder, SectionId } from '@/hooks/useSectionOrder';

const sectionComponents: Record<SectionId, React.ComponentType> = {
  hero: Hero,
  features: Features,
  newArrivals: NewArrivals,
  categories: Categories,
  featuredProducts: FeaturedProducts,
  brandBanner: BrandBanner,
};

const parallaxConfig: Record<SectionId, { speed: number; direction?: 'up' | 'down'; fadeIn?: boolean; scale?: boolean }> = {
  hero: { speed: 0 },
  features: { speed: 0.1, fadeIn: true },
  newArrivals: { speed: 0.15, direction: 'up', fadeIn: true },
  categories: { speed: 0.1, fadeIn: true },
  featuredProducts: { speed: 0.15, direction: 'up', fadeIn: true },
  brandBanner: { speed: 0.2, fadeIn: true, scale: true },
};

const Index = () => {
  const { data: sectionOrder } = useSectionOrder();

  const enabledSections = useMemo(() => {
    return sectionOrder?.filter(s => s.enabled) || [];
  }, [sectionOrder]);

  return (
    <>
      <SEOHead url="/" />

      <Header />
      <CartSidebar />

      <main className="overflow-hidden">
        {enabledSections.map((section) => {
          const Component = sectionComponents[section.id];
          const config = parallaxConfig[section.id];
          
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
                speed={config.speed} 
                direction={config.direction}
                fadeIn={config.fadeIn}
                scale={config.scale}
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
