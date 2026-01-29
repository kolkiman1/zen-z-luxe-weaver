import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { useSectionContent } from '@/hooks/useSectionContent';
import { useTheme } from '@/contexts/ThemeContext';
import SectionHeader from '@/components/home/SectionHeader';

const Categories = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { activeTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const { data: sectionMedia } = useSectionMedia();
  const { data: sectionContent } = useSectionContent();
  const categoriesMedia = sectionMedia?.categories;
  const content = sectionContent?.categories;

  const cardShape = activeTheme === 'brutalist' ? 'rounded-none' : 'rounded-lg sm:rounded-xl';
  const borderStyle = activeTheme === 'brutalist' ? 'border-2 border-border' : 'border border-primary/0 group-hover:border-primary/50';

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Background Media */}
      {categoriesMedia?.type !== 'none' && categoriesMedia?.url && (
        <div className="absolute inset-0 z-0">
          {categoriesMedia.type === 'video' ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src={categoriesMedia.url} type="video/mp4" />
            </video>
          ) : (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('${categoriesMedia.url}')` }}
            />
          )}
          <div 
            className="absolute inset-0 bg-background"
            style={{ opacity: (categoriesMedia.overlayOpacity || 70) / 100 }}
          />
        </div>
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
              align="left"
              headline={content?.headline || 'Shop by'}
              headlineHighlight={content?.headlineHighlight || 'Category'}
              description={content?.description || 'Explore our curated collections of premium fashion and accessories'}
              actions={
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll('left')}
                    className="w-10 h-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 micro-ring"
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => scroll('right')}
                    className="w-10 h-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 micro-ring"
                  >
                    <ChevronRight size={18} />
                  </Button>
                </div>
              }
            />
          </motion.div>

          {/* Categories Row */}
          <div
            ref={scrollContainerRef}
            className="flex flex-row gap-3 sm:gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex-shrink-0 w-[200px] xs:w-[240px] sm:w-[280px] md:w-[300px] lg:flex-1 lg:min-w-[280px] lg:max-w-[320px] snap-start"
              >
                <Link
                  to={`/category/${category.slug}`}
                  className={`block relative group aspect-[3/4] overflow-hidden ${cardShape} ${activeTheme === 'editorial' ? 'bg-card border border-border' : ''} surface-motion surface-hover`}
                >
                {/* Image */}
                <motion.img
                  src={category.image}
                  alt={category.name}
                  className={`w-full h-full object-cover transition-transform ${activeTheme === 'brutalist' ? 'duration-150 group-hover:scale-[1.03]' : 'duration-500 group-hover:scale-[1.06]'}`}
                  whileHover={prefersReducedMotion ? undefined : activeTheme === 'editorial' ? { scale: 1.02 } : undefined}
                  transition={prefersReducedMotion ? undefined : { duration: 0.6 }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl mb-1">
                        {category.name}
                      </h3>
                      <p className="text-foreground/70 text-xs sm:text-sm line-clamp-1">
                        {category.description}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0"
                    >
                      <ArrowUpRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </motion.div>
                  </div>
                </div>

                {/* Animated Border */}
                <motion.div className={`absolute inset-0 ${cardShape} transition-colors duration-300 ${borderStyle}`} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
