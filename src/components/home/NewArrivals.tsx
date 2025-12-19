import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNewArrivals } from '@/lib/data';
import ProductCard from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';

const NewArrivals = () => {
  const newArrivals = getNewArrivals();

  return (
    <section className="section-padding bg-background">
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
              New <span className="text-gradient-gold">Arrivals</span>
            </h2>
            <p className="text-muted-foreground max-w-lg">
              The latest additions to our premium collection
            </p>
          </div>
          <Link to="/category/new-arrivals">
            <Button variant="ghost" className="gap-2 group">
              Shop New
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {newArrivals.slice(0, 4).map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
