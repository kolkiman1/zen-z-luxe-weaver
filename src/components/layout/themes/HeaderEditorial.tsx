import { useEffect, useState } from 'react';
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
import ThemedMegaMenu from '@/components/layout/ThemedMegaMenu';
import ThemedMobileMenu from '@/components/layout/ThemedMobileMenu';
import { toast } from 'sonner';

const HeaderEditorial = () => {
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
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
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
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border top-0'
            : 'bg-transparent top-0'
        }`}
      >
        <div className="container-luxury">
          <div className="h-16 md:h-[72px] grid grid-cols-3 items-center">
            {/* Left */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors"
                whileTap={{ scale: 0.95 }}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </motion.button>

              <div className="hidden lg:block">
                <ThemedMegaMenu isScrolled={isScrolled} currentPath={location.pathname} />
              </div>
            </div>

            {/* Center logo */}
            <div className="flex justify-center">
              <Link to="/" className="group">
                <div className="text-center leading-none">
                  <span className="font-display text-xl md:text-2xl tracking-tight">Zen Zee</span>
                  <span className="block text-[10px] tracking-[0.24em] uppercase text-muted-foreground mt-1">
                    Editorial
                  </span>
                </div>
              </Link>
            </div>

            {/* Right actions */}
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="h-9 w-9 rounded-none"
              >
                <Search size={18} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWishlistOpen(true)}
                className="relative h-9 w-9 rounded-none"
              >
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[11px] font-semibold rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative h-9 w-9 rounded-none"
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[11px] font-semibold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9 rounded-none">
                      <User size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer rounded-md">My Account</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="cursor-pointer rounded-md">My Orders</Link>
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
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none">
                    <User size={18} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      <ThemedMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default HeaderEditorial;
