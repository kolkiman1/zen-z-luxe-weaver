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

const MegaMenuEditorial = ({ isScrolled, currentPath }: Props) => {
  const [active, setActive] = useState<string | null>(null);
  const { data } = useNavigationPromos();
  const promo = data?.editorial ?? defaultNavigationPromos.editorial;

  return (
    <nav className="hidden lg:flex items-center gap-7">
      <Link
        to="/"
        className={`text-xs font-body tracking-[0.22em] uppercase transition-colors ${
          currentPath === '/' ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
        }`}
      >
        Home
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
            className={`flex items-center gap-1 text-xs font-body tracking-[0.22em] uppercase transition-colors ${
              currentPath.includes(category.href) ? 'text-primary' : 'text-foreground/70 hover:text-foreground'
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.18 }}
                className="absolute left-1/2 -translate-x-1/2 top-full pt-5 z-50"
              >
                <div
                  className={`w-[860px] max-w-[90vw] border border-border/60 shadow-2xl overflow-hidden ${
                    isScrolled ? 'bg-card' : 'bg-card/95 backdrop-blur-xl'
                  }`}
                >
                  <div className="p-7 grid grid-cols-12 gap-8">
                    <div className="col-span-5">
                      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Shop</p>
                      <ul className="mt-4 space-y-2">
                        {category.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              to={sub.href}
                              className="block text-sm text-foreground/80 hover:text-primary transition-colors"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-5 pt-4 border-t border-border/50">
                        <Link to={category.href} className="text-sm text-primary hover:underline">
                          View all {category.name} →
                        </Link>
                      </div>
                    </div>

                    <div className="col-span-4">
                      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Featured</p>
                      <div className="mt-4 space-y-3">
                        {(category.featured ?? []).slice(0, 2).map((p) => (
                          <Link key={p.name} to={p.href} className="group flex items-center gap-3">
                            <div className="w-14 h-14 bg-muted overflow-hidden">
                              <img
                                src={p.image}
                                alt={p.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {p.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{p.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-3">
                      <p className="text-[11px] tracking-[0.22em] uppercase text-muted-foreground">Editor’s pick</p>
                      <Link
                        to={promo.href}
                        className="mt-4 block border border-border/60 hover:border-border transition-colors"
                      >
                        <div className="aspect-[4/5] bg-muted overflow-hidden">
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
                          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{promo.description}</p>
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

export default MegaMenuEditorial;
