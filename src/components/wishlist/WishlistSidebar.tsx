import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistSidebar = ({ isOpen, onClose }: WishlistSidebarProps) => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product: typeof items[0]) => {
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-primary" />
                <h2 className="font-display text-lg sm:text-xl">Your Wishlist</h2>
                <span className="text-sm text-muted-foreground">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Close wishlist"
              >
                <X size={20} />
              </button>
            </div>

            {/* Wishlist Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart size={48} className="text-muted-foreground mb-4" />
                  <h3 className="font-display text-lg mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Save your favorite items to buy them later
                  </p>
                  <Button onClick={onClose} className="btn-primary">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {items.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-3 sm:gap-4"
                    >
                      {/* Product Image */}
                      <Link 
                        to={`/product/${product.slug || product.id}`}
                        onClick={onClose}
                        className="w-20 h-24 sm:w-24 sm:h-28 bg-secondary rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${product.slug || product.id}`}
                          onClick={onClose}
                        >
                          <h4 className="font-medium text-sm mb-1 truncate hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        <p className="text-xs text-muted-foreground mb-1 truncate">
                          {product.subcategory}
                        </p>
                        <p className="text-primary font-medium text-sm mb-3">
                          {formatPrice(product.price)}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(product)}
                            className="btn-primary gap-1.5 text-xs h-8 px-3"
                            disabled={!product.inStock}
                          >
                            <ShoppingBag size={14} />
                            <span className="hidden xs:inline">Add to Cart</span>
                            <span className="xs:hidden">Add</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromWishlist(product.id)}
                            className="w-8 h-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border p-4 sm:p-6 space-y-3">
                <Link to="/wishlist" onClick={onClose}>
                  <Button variant="outline" className="w-full py-5 btn-outline-gold">
                    View Full Wishlist
                  </Button>
                </Link>
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WishlistSidebar;
