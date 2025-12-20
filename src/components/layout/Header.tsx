import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import { toast } from 'sonner';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Men', href: '/category/men' },
  { name: 'Women', href: '/category/women' },
  { name: 'Jewelry', href: '/category/jewelry' },
  { name: 'Accessories', href: '/category/accessories' },
];

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
          isScrolled ? 'glass py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container-luxury">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group perspective-1000">
              <motion.div
                className="relative py-2 px-4"
                whileHover={{ 
                  scale: 1.1,
                  rotateX: 5,
                  rotateY: -5,
                }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: 'preserve-3d' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {/* Outer glow - static on hover only */}
                <motion.div
                  className="absolute -inset-4 rounded-2xl blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.5), hsl(var(--gold) / 0.3), transparent 70%)',
                  }}
                />

                {/* Inner gradient background */}
                <motion.div
                  className="absolute inset-0 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary) / 0.3), hsl(var(--gold) / 0.2), hsl(var(--primary) / 0.3))',
                  }}
                />
                
                <motion.h1
                  className="relative font-display text-xl md:text-2xl font-black tracking-wider"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* zen-z with 3D letter animation */}
                  <span className="relative inline-flex">
                    {'zen-z'.split('').map((char, index) => (
                      <motion.span
                        key={index}
                        className="inline-block relative"
                        style={{
                          background: 'linear-gradient(180deg, hsl(var(--foreground)) 0%, hsl(var(--gold)) 50%, hsl(var(--foreground)) 100%)',
                          backgroundSize: '100% 300%',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                          textShadow: '0 2px 10px hsl(var(--gold) / 0.3)',
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '0% 100%', '0% 0%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.15,
                          ease: 'easeInOut',
                        }}
                        whileHover={{
                          y: -5,
                          scale: 1.2,
                          rotateY: 15,
                          transition: { duration: 0.2 },
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                  
                  {/* Glowing dot - static */}
                  <span className="relative inline-block mx-1">
                    <span 
                      className="relative text-primary font-black"
                      style={{
                        textShadow: '0 0 15px hsl(var(--primary)), 0 0 30px hsl(var(--primary))',
                        filter: 'drop-shadow(0 0 6px hsl(var(--primary)))',
                      }}
                    >
                      .
                    </span>
                  </span>
                  
                  {/* store with 3D letter animation */}
                  <span className="relative inline-flex">
                    {'store'.split('').map((char, index) => (
                      <motion.span
                        key={index}
                        className="inline-block relative"
                        style={{
                          background: 'linear-gradient(180deg, hsl(var(--foreground)) 0%, hsl(var(--gold)) 50%, hsl(var(--foreground)) 100%)',
                          backgroundSize: '100% 300%',
                          WebkitBackgroundClip: 'text',
                          backgroundClip: 'text',
                          color: 'transparent',
                          textShadow: '0 2px 10px hsl(var(--gold) / 0.3)',
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '0% 100%', '0% 0%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: (index + 6) * 0.15,
                          ease: 'easeInOut',
                        }}
                        whileHover={{
                          y: -5,
                          scale: 1.2,
                          rotateY: -15,
                          transition: { duration: 0.2 },
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                </motion.h1>

                {/* Shine sweep effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                      transform: 'translateX(-100%)',
                    }}
                    animate={{
                      transform: ['translateX(-100%)', 'translateX(100%)'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 2,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`luxury-underline text-sm font-body tracking-wide transition-colors ${
                    location.pathname === link.href
                      ? 'text-primary'
                      : 'text-foreground/80 hover:text-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="text-foreground hover:text-primary hover:bg-transparent"
              >
                <Search size={20} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsWishlistOpen(true)}
                className="relative text-foreground hover:text-primary hover:bg-transparent"
              >
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCartOpen(true)}
                className="relative text-foreground hover:text-primary hover:bg-transparent"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:flex text-foreground hover:text-primary hover:bg-transparent"
                    >
                      <User size={20} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer">
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            <Settings size={16} className="mr-2" />
                            Admin Dashboard
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut size={16} className="mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth" className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground hover:text-primary hover:bg-transparent"
                  >
                    <User size={20} />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.nav
              className="absolute left-0 top-0 bottom-0 w-72 bg-card p-8 pt-24"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
            >
              <div className="flex flex-col gap-6">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.href}
                      className={`font-display text-2xl ${
                        location.pathname === link.href
                          ? 'text-primary'
                          : 'text-foreground'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {user ? (
                    <>
                      <button
                        onClick={handleSignOut}
                        className="font-display text-2xl text-foreground"
                      >
                        Sign Out
                      </button>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="font-display text-2xl text-foreground"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link
                      to="/auth"
                      className="font-display text-2xl text-foreground"
                    >
                      Account
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Wishlist Sidebar */}
      <WishlistSidebar isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Header;
