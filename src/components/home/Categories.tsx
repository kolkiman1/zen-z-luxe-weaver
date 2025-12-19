import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { categories } from '@/lib/data';
import { Button } from '@/components/ui/button';

const Categories = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    <section className="section-padding bg-background">
      <div className="container-luxury">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12"
        >
          <div className="text-center sm:text-left">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-4">
              Shop by <span className="text-gradient-gold">Category</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto sm:mx-0">
              Explore our curated collections of premium fashion and accessories
            </p>
          </div>
          
          {/* Navigation Arrows - Desktop */}
          <div className="hidden md:flex items-center gap-2">
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
          </div>
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
                className="block relative group aspect-[3/4] rounded-lg sm:rounded-xl overflow-hidden"
              >
                {/* Image */}
                <motion.img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.6 }}
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
                <motion.div
                  className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-300"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
