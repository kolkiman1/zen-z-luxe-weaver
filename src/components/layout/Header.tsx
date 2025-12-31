import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, ShoppingBag, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SearchModal from '@/components/search/SearchModal';
import WishlistSidebar from '@/components/wishlist/WishlistSidebar';
import MegaMenu from './MegaMenu';
import MobileMenu from './MobileMenu';
import { toast } from 'sonner';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { totalItems, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'glass py-2 md:py-3' 
            : 'bg-gradient-to-b from-background/80 to-transparent py-3 md:py-4'
        }`}
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.div>
            </motion.button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <motion.div
                className="relative flex flex-col items-center lg:items-start"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-display text-xl sm:text-2xl lg:text-3xl tracking-tight relative">
                  <motion.span
                    className="inline-block bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent font-bold"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Gen
                  </motion.span>
                  <motion.span
                    className="inline-block text-foreground group-hover:text-foreground/80 transition-colors duration-300"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    -zee
                  </motion.span>
                  <motion.span
                    className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                  />
                </span>
                <motion.span
                  className="hidden sm:block text-[9px] lg:text-[10px] tracking-[0.25em] uppercase text-muted-foreground/60 font-medium mt-0.5"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Wear the Trend
                </motion.span>
              </motion.div>
            </Link>

            {/* Desktop Navigation with Mega Menu */}
            <div className="hidden lg:block flex-1 flex justify-center">
              <MegaMenu isScrolled={isScrolled} currentPath={location.pathname} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary hover:bg-muted/50 rounded-full"
                >
                  <Search size={18} className="sm:w-5 sm:h-5" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsWishlistOpen(true)}
                  className="relative h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary hover:bg-muted/50 rounded-full"
                >
                  <Heart size={18} className="sm:w-5 sm:h-5" />
                  {wishlistItems.length > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground text-[10px] sm:text-xs font-semibold rounded-full flex items-center justify-center shadow-lg"
                    >
                      {wishlistItems.length}
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCartOpen(true)}
                  className="relative h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary hover:bg-muted/50 rounded-full"
                >
                  <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                  {totalItems > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-primary text-primary-foreground text-[10px] sm:text-xs font-semibold rounded-full flex items-center justify-center shadow-lg"
                    >
                      {totalItems}
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary hover:bg-muted/50 rounded-full"
                      >
                        <User size={18} className="sm:w-5 sm:h-5" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer rounded-md">
                          My Account
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="cursor-pointer rounded-md">
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to="/admin" className="cursor-pointer rounded-md">
                              <Settings size={16} className="mr-2" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <div className="p-1">
                      <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive rounded-md focus:text-destructive">
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth" className="hidden sm:block">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10 text-foreground hover:text-primary hover:bg-muted/50 rounded-full"
                    >
                      <User size={18} className="sm:w-5 sm:h-5" />
                    </Button>
                  </motion.div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu with Accordion */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Wishlist Sidebar */}
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Header;