import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Home, User, LogOut, Settings, ShoppingBag, Package } from 'lucide-react';
import { navCategories } from '@/lib/navigationData';
import { useNavigationPromos } from '@/hooks/useNavigationPromos';
import { defaultNavigationPromos } from '@/lib/navigationPromos';

type MobileCategoryItem = {
  name: string;
  href: string;
  subcategories?: Array<{ name: string; href: string }>;
};

const mobileCategories: MobileCategoryItem[] = [
  { name: 'Home', href: '/' },
  ...navCategories.map((c) => ({
    name: c.name,
    href: c.href,
    subcategories: c.subcategories,
  })),
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin: boolean;
  onSignOut: () => void;
}

const MobileMenu = ({ isOpen, onClose, user, isAdmin, onSignOut }: MobileMenuProps) => {
  const location = useLocation();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const { data } = useNavigationPromos();
  const promo = data?.artisan ?? defaultNavigationPromos.artisan;

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(prev => prev === categoryName ? null : categoryName);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Menu Panel */}
          <motion.nav
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-card border-r border-border shadow-2xl overflow-y-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border p-6 pt-20">
              <h2 className="font-display text-xl">
                <span className="text-primary">Zen</span> Zee
              </h2>
              <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">Menu</p>
            </div>
            
            {/* Categories */}
            <div className="p-4 space-y-1">
              {mobileCategories.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {category.subcategories ? (
                    <div className="rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCategory(category.name)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          location.pathname.includes(category.href)
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="font-medium">{category.name}</span>
                        <ChevronDown 
                          size={18} 
                          className={`transition-transform duration-200 ${
                            expandedCategory === category.name ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      <AnimatePresence>
                        {expandedCategory === category.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pb-2 space-y-1">
                              <Link
                                to={category.href}
                                onClick={onClose}
                                className="block p-2 pl-4 text-sm text-primary font-medium hover:bg-primary/5 rounded-md transition-colors"
                              >
                                View All {category.name}
                              </Link>
                              {category.subcategories.map((sub) => (
                                <Link
                                  key={sub.name}
                                  to={sub.href}
                                  onClick={onClose}
                                  className="block p-2 pl-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={category.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        location.pathname === category.href
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Home size={18} />
                      <span className="font-medium">{category.name}</span>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
            
            {/* Divider */}
            <div className="mx-4 my-2 border-t border-border" />

            {/* Promo */}
            <div className="px-4 pb-2">
              <Link to={promo.href} onClick={onClose} className="block rounded-xl border border-border/50 overflow-hidden">
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
            
            {/* User Section */}
            <div className="p-4 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <User size={18} />
                    <span className="font-medium">My Account</span>
                  </Link>
                  <Link
                    to="/orders"
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Package size={18} />
                    <span className="font-medium">My Orders</span>
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={onClose}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Settings size={18} />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <User size={18} />
                  <span className="font-medium">Sign In / Sign Up</span>
                </Link>
              )}
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;