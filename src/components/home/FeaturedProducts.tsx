import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '@/hooks/useProducts';
import ThemedProductCard from '@/components/products/ThemedProductCard';
import { useTheme } from '@/contexts/ThemeContext';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { useSectionContent } from '@/hooks/useSectionContent';
import SectionHeader from '@/components/home/SectionHeader';

const FeaturedProducts = () => {
  const { products: featuredProducts, loading } = useFeaturedProducts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { activeTheme } = useTheme();
  const { data: sectionMedia } = useSectionMedia();
  const { data: sectionContent } = useSectionContent();
  const featuredMedia = sectionMedia?.featuredProducts;
  const content = sectionContent?.featuredProducts;

  const itemWidthClass =
    activeTheme === 'editorial'
      ? 'flex-shrink-0 w-[220px] sm:w-[300px] md:w-[320px] lg:w-[340px]'
      : activeTheme === 'brutalist'
        ? 'flex-shrink-0 w-[200px] sm:w-[260px] md:w-[280px] lg:w-[300px]'
        : 'flex-shrink-0 w-[200px] sm:w-[260px] md:w-[280px] lg:w-[300px]';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="section-padding bg-card relative overflow-hidden">
      {/* Background Media */}
      {featuredMedia?.type !== 'none' && featuredMedia?.url && (
        <div className="absolute inset-0 z-0">
          {featuredMedia.type === 'video' ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={featuredMedia.url} type="video/mp4" />
            </video>
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${featuredMedia.url}')` }}
            />
          )}
          <div 
            className="absolute inset-0 bg-card"
            style={{ opacity: (featuredMedia.overlayOpacity || 70) / 100 }}
          />
        </div>
      )}
      
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-0 left-0 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-56 sm:w-72 md:w-80 h-56 sm:h-72 md:h-80 bg-gold/5 rounded-full blur-3xl"
        animate={{ 
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container-luxury relative z-10">
        <div className="surface-panel surface-motion chrome-panel rounded-3xl p-5 sm:p-6 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 md:mb-10"
          >
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="sticker">FEATURED</span>
              <span className="sticker sticker-chrome">CURATED</span>
            </div>
            <SectionHeader
              tagline={content?.tagline || 'Curated for You'}
              headline={content?.headline || 'Featured'}
              headlineHighlight={content?.headlineHighlight || 'Collection'}
              description={content?.description || 'Handpicked premium pieces that define luxury and elegance'}
              cta={{ label: 'View All', to: '/category/all', variant: 'ghost' }}
              actions={
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="hidden md:flex items-center gap-2"
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll('left')}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 micro-ring surface-hover"
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll('right')}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 micro-ring surface-hover"
                  >
                    <ChevronRight size={18} />
                  </Button>
                </motion.div>
              }
            />
          </motion.div>

          {/* Products Row */}
          {loading ? (
            <div className="flex flex-row gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-4 no-scrollbar">
              {[...Array(6)].map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={itemWidthClass}
                >
                  <ProductCardSkeleton />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              ref={scrollContainerRef}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ staggerChildren: 0.1 }}
              className="flex flex-row gap-4 sm:gap-6 md:gap-8 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
            >
              {featuredProducts.slice(0, 8).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
                  className={`${itemWidthClass} snap-start transition-transform duration-300 ease-out hover:-translate-y-2 will-change-transform`}
                >
                  <ThemedProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Mobile Navigation Dots */}
          <div className="flex md:hidden justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
            {featuredProducts.slice(0, 8).map((_, index) => (
              <motion.div key={index} className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-border" whileHover={{ scale: 1.2 }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
