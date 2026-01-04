import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/animated-button';
import { ProductCollection as ProductCollectionType } from '@/hooks/useProductCollections';

interface ProductCollectionProps {
  collection: ProductCollectionType;
}

const ProductCollection = ({ collection }: ProductCollectionProps) => {
  const { products, loading } = useProducts();
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

  // Filter products based on collection type
  const filteredProducts = products.filter(product => {
    switch (collection.filterType) {
      case 'on_sale':
        return product.originalPrice && product.originalPrice > product.price;
      case 'best_sellers':
        return product.isFeatured;
      case 'new':
        return product.isNew;
      case 'category':
        return product.category === collection.filterValue;
      case 'manual':
        return collection.productIds?.includes(product.id);
      default:
        return true;
    }
  }).slice(0, collection.maxProducts);

  if (!collection.enabled || filteredProducts.length === 0) return null;

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="container-luxury relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12"
        >
          <div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
              {collection.name}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg">
              {collection.description}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {collection.displayStyle === 'carousel' && (
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
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <ChevronLeft size={18} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scroll('right')}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <ChevronRight size={18} />
                </Button>
              </motion.div>
            )}
            <Link to={`/collection/${collection.slug}`}>
              <AnimatedButton 
                variant="ghost" 
                className="gap-2 text-sm sm:text-base"
                glowColor="gold"
                showArrow
              >
                View All
              </AnimatedButton>
            </Link>
          </div>
        </motion.div>

        {/* Products */}
        {loading ? (
          <div className={collection.displayStyle === 'carousel' 
            ? "flex flex-row gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar"
            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          }>
            {[...Array(4)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={collection.displayStyle === 'carousel' ? "flex-shrink-0 w-[200px] sm:w-[260px] md:w-[280px]" : ""}
              >
                <ProductCardSkeleton />
              </motion.div>
            ))}
          </div>
        ) : collection.displayStyle === 'carousel' ? (
          <motion.div
            ref={scrollContainerRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-row gap-4 sm:gap-6 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="flex-shrink-0 w-[200px] sm:w-[260px] md:w-[280px] snap-start"
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ProductCollection;
