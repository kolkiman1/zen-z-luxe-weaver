import { motion } from 'framer-motion';
import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { useSectionContent } from '@/hooks/useSectionContent';

const icons = [Truck, Shield, RefreshCw, Headphones];

const Features = () => {
  const { data: sectionContent } = useSectionContent();
  const features = sectionContent?.features.items || [];

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-16 border-y border-border bg-card">
      <div className="container-luxury">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = icons[index] || Truck;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-2 sm:p-4"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-secondary flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-display text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
