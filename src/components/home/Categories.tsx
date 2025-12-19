import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '@/lib/data';

const Categories = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-luxury">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-4">
            Shop by <span className="text-gradient-gold">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore our curated collections of premium fashion and accessories
          </p>
        </motion.div>

        {/* Categories Row */}
        <div className="flex flex-row gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-shrink-0 w-[280px] md:w-[320px] lg:w-[calc(25%-18px)]"
            >
              <Link
                to={`/category/${category.slug}`}
                className="block relative group aspect-[3/4] rounded-xl overflow-hidden"
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
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="font-display text-2xl md:text-3xl mb-1">
                        {category.name}
                      </h3>
                      <p className="text-foreground/70 text-sm">
                        {category.description}
                      </p>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                    >
                      <ArrowUpRight size={18} />
                    </motion.div>
                  </div>
                </div>

                {/* Animated Border */}
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/50 transition-colors duration-300"
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
