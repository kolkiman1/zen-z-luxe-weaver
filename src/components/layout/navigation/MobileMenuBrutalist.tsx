import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, User, LogOut, Settings, Package } from 'lucide-react';
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

const MobileMenuBrutalist = ({ isOpen, onClose, user, isAdmin, onSignOut }: Props) => {
  const location = useLocation();
  const { data } = useNavigationPromos();
  const promo = data?.brutalist ?? defaultNavigationPromos.brutalist;
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
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 lg:hidden bg-background overflow-y-auto overscroll-contain"
        >
          <div className="h-16 px-4 flex items-center justify-between border-b-2 border-border">
            <p className="text-sm font-black uppercase tracking-tight">
              MENU <span className="text-primary">/</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-11 grid place-items-center border-2 border-border"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 [padding-bottom:calc(1rem+env(safe-area-inset-bottom))] grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/"
                onClick={onClose}
                className={`border-2 p-3 font-black uppercase tracking-tight micro-ring micro-lift ${
                  location.pathname === '/' ? 'border-primary text-primary' : 'border-border text-foreground'
                }`}
              >
                Home
              </Link>
              <Link
                to={promo.href}
                onClick={onClose}
                className="border-2 border-border p-3 font-black uppercase tracking-tight hover:border-primary transition-colors micro-ring micro-lift"
              >
                {promo.eyebrow}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navCategories.map((c) => {
                const isActive = (active ?? navCategories[0].name) === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setActive(c.name)}
                    className={`border-2 p-3 text-left font-black uppercase tracking-tight transition-colors micro-ring micro-lift ${
                      isActive ? 'border-primary text-primary' : 'border-border text-foreground hover:border-primary'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>

            <div className="border-2 border-border">
              <div className="p-3 flex items-center justify-between">
                <p className="text-sm font-black uppercase tracking-tight">{activeCategory.name}</p>
                <Link to={activeCategory.href} onClick={onClose} className="text-xs font-black uppercase tracking-[0.18em] text-primary micro-ring">
                  View all →
                </Link>
              </div>
              <div className="border-t-2 border-border grid grid-cols-2">
                {activeCategory.subcategories.slice(0, 6).map((s) => (
                  <Link
                    key={s.name}
                    to={s.href}
                    onClick={onClose}
                    className="p-3 border-r-2 border-b-2 border-border last:border-r-0 text-sm font-black uppercase tracking-tight hover:text-primary transition-colors micro-ring micro-lift"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link to={promo.href} onClick={onClose} className="border-2 border-border hover:border-primary transition-colors micro-ring micro-lift">
              <div className="h-28 bg-muted overflow-hidden">
                <img src={promo.image} alt={promo.title} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">{promo.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{promo.description}</p>
              </div>
            </Link>

            <div className="border-t-2 border-border pt-4 grid gap-2">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                    <User size={16} /> Account
                  </Link>
                  <Link to="/orders" onClick={onClose} className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                    <Package size={16} /> Orders
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={onClose} className="flex items-center gap-2 text-sm font-black uppercase tracking-tight">
                      <Settings size={16} /> Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-destructive"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={onClose} className="text-sm font-black uppercase tracking-tight text-primary">
                  Sign in / Sign up
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuBrutalist;
