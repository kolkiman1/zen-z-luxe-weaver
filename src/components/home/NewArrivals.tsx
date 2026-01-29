import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useNewArrivals } from '@/hooks/useProducts';
import ThemedProductCard from '@/components/products/ThemedProductCard';
import { useTheme } from '@/contexts/ThemeContext';
import { LazyBackground, LazyVideo } from '@/components/ui/lazy-background';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { useSectionContent } from '@/hooks/useSectionContent';
import SectionHeader from '@/components/home/SectionHeader';

const NewArrivals = () => {
  const { products: newArrivals, loading } = useNewArrivals();
  const { activeTheme } = useTheme();
  const { data: sectionMedia } = useSectionMedia();
  const { data: sectionContent } = useSectionContent();
  const newArrivalsMedia = sectionMedia?.newArrivals;
  const content = sectionContent?.newArrivals;

  const gridClass =
    activeTheme === 'editorial'
      ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10'
      : activeTheme === 'brutalist'
        ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'
        : 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8';

  return (
    <section className="relative section-padding overflow-hidden">
      {/* Background Media with Lazy Loading */}
      {newArrivalsMedia?.type === 'video' && newArrivalsMedia.url ? (
        <LazyVideo
          src={newArrivalsMedia.url}
          className="absolute inset-0 z-0"
          overlayOpacity={newArrivalsMedia?.overlayOpacity || 80}
        />
      ) : newArrivalsMedia?.type === 'image' && newArrivalsMedia.url ? (
        <LazyBackground
          src={newArrivalsMedia.url}
          className="absolute inset-0 z-0"
          overlayOpacity={newArrivalsMedia?.overlayOpacity || 80}
        />
      ) : (
        <LazyVideo
          src="/videos/new-arrivals-bg.mp4"
          className="absolute inset-0 z-0"
          overlayOpacity={80}
        />
      )}

      <div className="container-luxury relative z-10">
        <div className="surface-panel surface-motion rounded-3xl p-5 sm:p-6 md:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 md:mb-10"
          >
            <SectionHeader
              headline={content?.headline || 'New'}
              headlineHighlight={content?.headlineHighlight || 'Arrivals'}
              description={content?.description || 'The latest additions to our premium collection'}
              cta={{ label: 'Shop New', to: '/category/new-arrivals', variant: 'ghost' }}
            />
          </motion.div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12 sm:py-16">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className={gridClass}>
              {newArrivals.slice(0, 4).map((product, index) => (
                <ThemedProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;