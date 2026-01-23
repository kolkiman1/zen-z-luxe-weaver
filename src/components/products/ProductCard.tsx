import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product, formatPrice } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { usePerformanceOptional } from '@/contexts/PerformanceContext';
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
  const performance = usePerformanceOptional();
  const isPerformanceMode = performance?.isPerformanceMode ?? false;
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

  // Shared content for both modes
  const renderContent = () => (
    <>
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-md sm:rounded-lg bg-secondary mb-2 sm:mb-3 md:mb-4">
        {/* Placeholder */}
        {!isImageLoaded && (
          <div
            className="absolute inset-0 z-10 animate-pulse"
            style={{ backgroundColor: placeholderColor }}
          />
        )}

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isHovered ? 'scale-105' : 'scale-100'
          } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
          decoding="async"
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

        {/* Quick Actions - CSS only in performance mode */}
        <div
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-col gap-1 sm:gap-2 transition-all duration-200 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
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
        </div>

        {/* Add to Cart Button */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Button
            onClick={handleAddToCart}
            className="w-full btn-primary py-3 sm:py-4 md:py-5 gap-1 sm:gap-2 text-xs sm:text-sm"
          >
            <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Add to Cart</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        {/* Overlay Gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
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
    </>
  );

  return (
    <>
      {isPerformanceMode ? (
        // Performance mode: No Framer Motion animations
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link to={`/product/${product.slug || product.id}`} className="block group">
            {renderContent()}
          </Link>
        </div>
      ) : (
        // Full animation mode with Framer Motion
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link to={`/product/${product.slug || product.id}`} className="block group">
            {renderContent()}
          </Link>
        </motion.div>
      )}

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
