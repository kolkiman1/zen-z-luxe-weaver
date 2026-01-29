import { motion } from 'framer-motion';
import { Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { useSectionContent } from '@/hooks/useSectionContent';
import { useTheme } from '@/contexts/ThemeContext';

const icons = [Truck, Shield, RefreshCw, Headphones];

const Features = () => {
  const { data: sectionContent } = useSectionContent();
  const { theme } = useTheme();
  const features = sectionContent?.features.items || [];

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-16 border-y border-border bg-card">
      <div className="container-luxury">
        <div className="surface-panel rounded-3xl p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = icons[index] || Truck;
            return (
              <motion.div
                key={feature.title}
                initial={theme === 'brutalist' ? false : { opacity: 0, y: 20 }}
                whileInView={theme === 'brutalist' ? undefined : { opacity: 1, y: 0 }}
                viewport={theme === 'brutalist' ? undefined : { once: true }}
                transition={theme === 'brutalist' ? undefined : { delay: index * 0.1 }}
                className="surface-plate surface-motion surface-hover rounded-2xl p-3 sm:p-4 md:p-5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-secondary flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-sm sm:text-base md:text-lg mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
