import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product, formatPrice } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

// Generate a placeholder color based on product name
const generatePlaceholderColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 60) + 20; // Warm tones
  return `hsl(${hue}, 15%, 18%)`;
};

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const placeholderColor = generatePlaceholderColor(product.name);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      product,
      1,
      product.sizes?.[0],
      product.colors?.[0]
    );
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuickViewOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.slug || product.id}`} className="block group">
          {/* Image Container */}
          <div className="relative aspect-[3/4] overflow-hidden rounded-md sm:rounded-lg bg-secondary mb-2 sm:mb-3 md:mb-4">
            {/* LQIP Placeholder */}
            <AnimatePresence>
              {!isImageLoaded && (
                <motion.div
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 z-10"
                  style={{ backgroundColor: placeholderColor }}
                >
                  {/* Shimmer animation */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  {/* Pulse effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-muted/10 animate-pulse" />
                  {/* Image placeholder icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg 
                      className="w-10 h-10 text-muted-foreground/20" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                      />
                    </svg>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Image with progressive loading */}
            <motion.img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              onLoad={() => setIsImageLoaded(true)}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: isImageLoaded ? 1 : 0, 
                scale: isHovered ? 1.05 : (isImageLoaded ? 1 : 1.05)
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              loading="lazy"
            />

            {/* Badges */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2">
              {product.isNew && (
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium rounded-full">
                  NEW
                </span>
              )}
              {product.originalPrice && (
                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-medium rounded-full">
                  SALE
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div
              className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 sm:gap-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size="icon"
                variant="secondary"
                onClick={handleToggleWishlist}
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${
                  inWishlist ? 'bg-primary text-primary-foreground' : 'glass'
                }`}
              >
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" fill={inWishlist ? 'currentColor' : 'none'} />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleQuickView}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full glass hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </motion.div>

            {/* Add to Cart Button */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                onClick={handleAddToCart}
                className="w-full btn-primary py-3 sm:py-4 md:py-5 gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Add to Cart</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </motion.div>

            {/* Overlay Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-1 sm:space-y-1.5">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider line-clamp-1">
              {product.subcategory}
            </p>
            <h3 className="font-display text-sm sm:text-base md:text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-primary font-medium text-sm sm:text-base">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-muted-foreground line-through text-xs sm:text-sm">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5 sm:pt-1">
                {product.colors.slice(0, 4).map((color) => (
                  <span
                    key={color.name}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-border"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] sm:text-xs text-muted-foreground">+{product.colors.length - 4}</span>
                )}
              </div>
            )}
          </div>
        </Link>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
};

export default ProductCard;
