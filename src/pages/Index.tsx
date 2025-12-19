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

const Index = () => {
  return (
    <>
      <Helmet>
        <title>zen-z.store | Premium Fashion for the Next Generation</title>
        <meta
          name="description"
          content="Discover premium fashion, exquisite jewelry, and luxury accessories at zen-z.store. Curated collections for the modern Bangladeshi. Shop men's, women's clothing and accessories."
        />
        <meta name="keywords" content="premium fashion, luxury clothing, Bangladesh, jewelry, accessories, men fashion, women fashion" />
        <link rel="canonical" href="https://zen-z.store" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "zen-z.store",
            "url": "https://zen-z.store",
            "description": "Premium Fashion for the Next Generation",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://zen-z.store/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <Header />
      <CartSidebar />

      <main>
        <Hero />
        <Features />
        <Categories />
        <FeaturedProducts />
        <BrandBanner />
        <NewArrivals />
      </main>

      <Footer />
    </>
  );
};

export default Index;
