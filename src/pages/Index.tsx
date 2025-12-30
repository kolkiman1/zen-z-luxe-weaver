import { Helmet } from 'react-helmet-async';
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
import { useSeoSettings } from '@/hooks/useSiteSettings';

const Index = () => {
  const { data: seoSettings } = useSeoSettings();

  return (
    <>
      <Helmet>
        <title>{seoSettings?.siteTitle || 'zen-z.store | Premium Fashion for the Next Generation'}</title>
        <meta
          name="description"
          content={seoSettings?.siteDescription || 'Discover premium fashion, exquisite jewelry, and luxury accessories at zen-z.store. Curated collections for the modern Bangladeshi.'}
        />
        <meta name="keywords" content={seoSettings?.keywords || 'premium fashion, luxury clothing, Bangladesh, jewelry, accessories, men fashion, women fashion'} />
        <link rel="canonical" href={seoSettings?.canonicalUrl || 'https://zen-z.store'} />
        {seoSettings?.ogImage && <meta property="og:image" content={seoSettings.ogImage} />}
        {seoSettings?.twitterHandle && <meta name="twitter:site" content={seoSettings.twitterHandle} />}
        <meta property="og:title" content={seoSettings?.siteTitle || 'zen-z.store'} />
        <meta property="og:description" content={seoSettings?.siteDescription || 'Premium Fashion for the Next Generation'} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": seoSettings?.siteTitle?.split('|')[0]?.trim() || "zen-z.store",
            "url": seoSettings?.canonicalUrl || "https://zen-z.store",
            "description": seoSettings?.siteDescription || "Premium Fashion for the Next Generation",
            "potentialAction": {
              "@type": "SearchAction",
              "target": `${seoSettings?.canonicalUrl || "https://zen-z.store"}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

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
