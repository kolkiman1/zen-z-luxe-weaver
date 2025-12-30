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

const Index = () => {
  return (
    <>
      <SEOHead url="/" />

      <Header />
      <CartSidebar />

      <main className="overflow-hidden">
        <section className="scroll-snap-section">
          <Hero />
        </section>
        
        <section className="scroll-snap-section">
          <ParallaxSection speed={0.1} fadeIn>
            <Features />
          </ParallaxSection>
        </section>
        
        <section className="scroll-snap-section">
          <ParallaxSection speed={0.15} direction="up" fadeIn>
            <NewArrivals />
          </ParallaxSection>
        </section>
        
        <section className="scroll-snap-section">
          <ParallaxSection speed={0.1} fadeIn>
            <Categories />
          </ParallaxSection>
        </section>
        
        <section className="scroll-snap-section">
          <ParallaxSection speed={0.15} direction="up" fadeIn>
            <FeaturedProducts />
          </ParallaxSection>
        </section>
        
        <section className="scroll-snap-section">
          <ParallaxSection speed={0.2} fadeIn scale>
            <BrandBanner />
          </ParallaxSection>
        </section>
      </main>

      <Footer />
      <ProductChatbot />
      <AnnouncementPopup />
    </>
  );
};

export default Index;
