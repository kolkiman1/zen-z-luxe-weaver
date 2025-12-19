import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNewArrivals } from '@/hooks/useProducts';
import ProductCard from '@/components/products/ProductCard';
import { AnimatedButton } from '@/components/ui/animated-button';

const NewArrivals = () => {
  const { products: newArrivals, loading } = useNewArrivals();

  return (
    <section className="relative section-padding overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/new-arrivals-bg.mp4" type="video/mp4" />
        </video>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      </div>

      <div className="container-luxury relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12"
        >
          <div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-3">
              New <span className="text-gradient-gold">Arrivals</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-lg">
              The latest additions to our premium collection
            </p>
          </div>
          <Link to="/category/new-arrivals">
            <AnimatedButton 
              variant="ghost" 
              className="gap-2 text-sm sm:text-base"
              glowColor="gold"
              showArrow
            >
              Shop New
            </AnimatedButton>
          </Link>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-16">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {newArrivals.slice(0, 4).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;