import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { navCategories } from '@/lib/navigationData';
import { defaultNavigationPromos } from '@/lib/navigationPromos';
import { useNavigationPromos } from '@/hooks/useNavigationPromos';

type Props = {
  isScrolled: boolean;
  currentPath: string;
};

const MegaMenuBrutalist = ({ currentPath }: Props) => {
  const [active, setActive] = useState<string | null>(null);
  const { data } = useNavigationPromos();
  const promo = data?.brutalist ?? defaultNavigationPromos.brutalist;

  return (
    <nav className="hidden lg:flex items-center gap-6">
      <Link
        to="/"
        className={`text-sm font-body font-black uppercase tracking-tight micro-ring ${
          currentPath === '/' ? 'text-primary' : 'text-foreground hover:text-primary'
        }`}
      >
        HOME
      </Link>

      {navCategories.map((category) => (
        <div
          key={category.name}
          className="relative"
          onMouseEnter={() => setActive(category.name)}
          onMouseLeave={() => setActive(null)}
        >
          <Link
            to={category.href}
            className={`flex items-center gap-1 text-sm font-body font-black uppercase tracking-tight micro-ring ${
              currentPath.includes(category.href) ? 'text-primary' : 'text-foreground hover:text-primary'
            }`}
          >
            {category.name}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${active === category.name ? 'rotate-180' : ''}`}
            />
          </Link>

          <AnimatePresence>
            {active === category.name && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50"
              >
                <div className="relative w-[960px] max-w-[92vw] chrome-panel surface-motion bg-card shadow-2xl">
                  <div className="scanline" />
                  <div className="p-6 grid grid-cols-12 gap-6">
                    <div className="col-span-7">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">CATEGORIES</p>
                        <Link to={category.href} className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                          VIEW ALL →
                        </Link>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.href}
                            className="border-2 border-border p-3 hover:border-primary micro-ring micro-lift surface-motion surface-hover"
                          >
                            <p className="text-sm font-black uppercase tracking-tight">{sub.name}</p>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-5">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">PROMO</p>
                      <Link to={promo.href} className="mt-4 block border-2 border-border hover:border-primary transition-colors micro-ring micro-lift surface-motion surface-hover">
                        <div className="h-40 bg-muted overflow-hidden">
                          <img
                            src={promo.image}
                            alt={promo.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{promo.eyebrow}</p>
                          <p className="mt-1 text-lg font-black uppercase tracking-tight">{promo.title}</p>
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

export default MegaMenuBrutalist;
