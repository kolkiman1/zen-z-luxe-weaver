import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { navCategories } from '@/lib/navigationData';
import { useNavigationPromos } from '@/hooks/useNavigationPromos';
import { defaultNavigationPromos } from '@/lib/navigationPromos';

interface MegaMenuProps {
  isScrolled: boolean;
  currentPath: string;
}

const MegaMenu = ({ isScrolled, currentPath }: MegaMenuProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data } = useNavigationPromos();
  const promo = data?.artisan ?? defaultNavigationPromos.artisan;

  return (
    <nav className="hidden lg:flex items-center gap-6">
      <Link
        to="/"
        className={`luxury-underline text-sm font-body tracking-wide transition-colors ${
          currentPath === '/'
            ? 'text-primary'
            : 'text-foreground/80 hover:text-foreground'
        }`}
      >
        Home
      </Link>
      
      {navCategories.map((category) => (
        <div
          key={category.name}
          className="relative"
          onMouseEnter={() => setActiveCategory(category.name)}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <Link
            to={category.href}
            className={`flex items-center gap-1 text-sm font-body tracking-wide transition-colors ${
              currentPath.includes(category.href)
                ? 'text-primary'
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            {category.name}
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${
                activeCategory === category.name ? 'rotate-180' : ''
              }`}
            />
          </Link>
          
          <AnimatePresence>
            {activeCategory === category.name && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50`}
              >
                <div className={`min-w-[680px] rounded-xl border border-border/50 shadow-2xl overflow-hidden ${
                  isScrolled ? 'bg-card' : 'bg-card/95 backdrop-blur-xl'
                }`}>
                  <div className="p-6 grid grid-cols-3 gap-8">
                    {/* Subcategories */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Categories
                      </h3>
                      <ul className="space-y-2">
                        {category.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              to={sub.href}
                              className="text-sm text-foreground/80 hover:text-primary hover:pl-2 transition-all duration-200 block"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                        <li className="pt-2 border-t border-border/30 mt-3">
                          <Link
                            to={category.href}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View All {category.name} →
                          </Link>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Featured Products */}
                    {category.featured && category.featured.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                          Featured
                        </h3>
                        <div className="space-y-3">
                          {category.featured.map((product) => (
                            <Link
                              key={product.name}
                              to={product.href}
                              className="flex items-center gap-3 group"
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {product.name}
                                </p>
                                <p className="text-xs text-primary font-semibold">
                                  {product.price}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Promo */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Spotlight
                      </h3>
                      <Link to={promo.href} className="block rounded-lg border border-border/50 overflow-hidden hover:border-border transition-colors">
                        <div className="h-28 bg-muted overflow-hidden">
                          <img
                            src={promo.image}
                            alt={promo.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">{promo.eyebrow}</p>
                          <p className="mt-1 font-display text-base leading-tight">{promo.title}</p>
                          <p className="mt-2 text-xs text-muted-foreground">{promo.description}</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
};

export default MegaMenu;