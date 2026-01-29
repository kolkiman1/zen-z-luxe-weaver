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

const HeaderBrutalist = () => {
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
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
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
        className={`fixed left-0 right-0 z-40 ${
          isScrolled ? 'top-0' : 'top-0'
        } bg-background border-b-2 border-border`}
      >
        <div className="container-luxury">
          <div className="h-16 md:h-[72px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-2 text-foreground hover:text-primary transition-colors"
                whileTap={{ scale: 0.95 }}
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>

              <Link to="/" className="flex items-baseline gap-2">
                <span className="font-display font-bold uppercase tracking-[-0.03em] text-lg">ZEN</span>
                <span className="font-display font-bold uppercase tracking-[-0.03em] text-lg text-primary">ZEE</span>
                <span className="hidden sm:inline text-[10px] uppercase tracking-[0.28em] text-muted-foreground ml-2">STREET/TECH</span>
              </Link>
            </div>

            <div className="hidden lg:block flex-1 flex justify-center">
              <ThemedMegaMenu isScrolled={true} currentPath={location.pathname} />
            </div>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setIsSearchOpen(true)} className="h-9 w-9 rounded-none border-2">
                <Search size={18} />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsWishlistOpen(true)} className="relative h-9 w-9 rounded-none border-2">
                <Heart size={18} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[11px] font-black rounded-none flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIsCartOpen(true)} className="relative h-9 w-9 rounded-none border-2">
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-[11px] font-black rounded-none flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="hidden sm:flex h-9 w-9 rounded-none border-2">
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
                              Admin
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
                  <Button variant="outline" size="icon" className="h-9 w-9 rounded-none border-2">
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

export default HeaderBrutalist;
