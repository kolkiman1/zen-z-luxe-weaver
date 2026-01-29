import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronRight, User, LogOut, Settings, Package } from 'lucide-react';
import { navCategories } from '@/lib/navigationData';
import { defaultNavigationPromos } from '@/lib/navigationPromos';
import { useNavigationPromos } from '@/hooks/useNavigationPromos';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin: boolean;
  onSignOut: () => void;
};

const MobileMenuEditorial = ({ isOpen, onClose, user, isAdmin, onSignOut }: Props) => {
  const location = useLocation();
  const { data } = useNavigationPromos();
  const promo = data?.editorial ?? defaultNavigationPromos.editorial;
  const [active, setActive] = useState<string | null>(null);

  const activeCategory = useMemo(
    () => navCategories.find((c) => c.name === active) ?? navCategories[0],
    [active]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 lg:hidden"
        >
          <motion.button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />

          <motion.nav
            initial={{ y: -18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto overscroll-contain bg-card border-b border-border shadow-2xl"
          >
            <div className="px-5 pt-5 pb-4 flex items-center justify-between">
              <div className="leading-none">
                <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Navigation</p>
                <p className="mt-1 font-display text-xl">Zen Zee</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                  className="h-11 w-11 grid place-items-center border border-border bg-card micro-ring micro-lift"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-6 [padding-bottom:calc(1.5rem+env(safe-area-inset-bottom))] grid grid-cols-12 gap-4">
              <div className="col-span-5">
                <Link
                  to="/"
                  onClick={onClose}
                  className={`block py-3 text-sm min-h-11 micro-ring ${location.pathname === '/' ? 'text-primary' : 'text-foreground/80 hover:text-foreground'}`}
                >
                  Home
                </Link>
                <div className="border-t border-border/60 pt-3">
                  {navCategories.map((c) => {
                    const isActive = (active ?? navCategories[0].name) === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setActive(c.name)}
                        className={`w-full flex items-center justify-between py-3 text-sm min-h-11 micro-ring ${
                          isActive ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
                        }`}
                      >
                        <span className="tracking-wide">{c.name}</span>
                        <ChevronRight size={16} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-7">
                <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Shop {activeCategory?.name}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(activeCategory?.subcategories ?? []).slice(0, 6).map((s) => (
                    <Link
                      key={s.name}
                      to={s.href}
                      onClick={onClose}
                      className="border border-border/60 p-3 text-sm text-foreground/80 hover:text-primary hover:border-border transition-colors micro-ring micro-lift"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
                {activeCategory && (
                  <Link
                    to={activeCategory.href}
                    onClick={onClose}
                    className="mt-3 inline-block text-sm text-primary hover:underline"
                  >
                    View all {activeCategory.name} →
                  </Link>
                )}

                <div className="mt-6 border-t border-border/60 pt-4">
                  <Link to={promo.href} onClick={onClose} className="block border border-border micro-ring micro-lift">
                    <div className="h-28 bg-muted overflow-hidden">
                      <img src={promo.image} alt={promo.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] tracking-[0.28em] uppercase text-muted-foreground">{promo.eyebrow}</p>
                      <p className="mt-1 font-display text-base">{promo.title}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{promo.description}</p>
                    </div>
                  </Link>
                </div>

                <div className="mt-6 border-t border-border/60 pt-4 grid gap-2">
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
                        <User size={16} /> My Account
                      </Link>
                      <Link to="/orders" onClick={onClose} className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
                        <Package size={16} /> My Orders
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={onClose} className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
                          <Settings size={16} /> Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onSignOut();
                          onClose();
                        }}
                        className="flex items-center gap-2 text-sm text-destructive"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={onClose} className="text-sm text-primary hover:underline">
                      Sign in / Sign up
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuEditorial;
