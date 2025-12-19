import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

const FeaturedProducts = () => {
  const { products: featuredProducts, loading } = useFeaturedProducts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl"
        animate={{ 
          x: [0, -40, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container-luxury relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-primary text-sm font-medium uppercase tracking-widest mb-2 block"
            >
              Curated for You
            </motion.span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-3">
              Featured <span className="text-gradient-gold">Collection</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Handpicked premium pieces that define luxury and elegance
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Navigation Arrows */}
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
                className="w-10 h-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <ChevronLeft size={18} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                <ChevronRight size={18} />
              </Button>
            </motion.div>
            <Link to="/category/all">
              <Button variant="ghost" className="gap-2 group">
                View All
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Products Row */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            ref={scrollContainerRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.1 }}
            className="flex flex-row gap-6 md:gap-8 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
          >
            {featuredProducts.slice(0, 8).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.08, 
                  duration: 0.5,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Mobile Navigation Dots */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          {featuredProducts.slice(0, 8).map((_, index) => (
            <motion.div
              key={index}
              className="w-2 h-2 rounded-full bg-border"
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
