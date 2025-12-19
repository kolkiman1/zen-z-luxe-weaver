import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFeaturedProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

const FeaturedProducts = () => {
  const { products: featuredProducts, loading } = useFeaturedProducts();

  return (
    <section className="section-padding bg-card">
      <div className="container-luxury">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-3">
              Featured <span className="text-gradient-gold">Collection</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Handpicked premium pieces that define luxury and elegance
            </p>
          </div>
          <Link to="/category/all">
            <Button variant="ghost" className="gap-2 group">
              View All
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Products Row */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-row gap-6 md:gap-8 overflow-x-auto pb-4 no-scrollbar">
            {featuredProducts.slice(0, 4).map((product, index) => (
              <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]">
                <ProductCard product={product} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;