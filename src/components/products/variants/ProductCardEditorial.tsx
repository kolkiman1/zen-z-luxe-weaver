import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/data';
import { formatPrice } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { usePerformanceOptional } from '@/contexts/PerformanceContext';
import { Button } from '@/components/ui/button';
import CompareToggleButton from '@/components/compare/CompareToggleButton';
import QuickViewModal from '@/components/products/QuickViewModal';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCardEditorial = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const performance = usePerformanceOptional();
  const isPerformanceMode = performance?.isPerformanceMode ?? false;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
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

  const Content = () => (
      <article className="group surface-motion surface-hover rounded-xl">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary border border-border rounded-md">
        {!isImageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-[1.03]' : 'scale-100'} ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
          decoding="async"
        />

          <div
            className={`absolute inset-x-3 bottom-3 grid grid-cols-4 items-center gap-2 sm:flex sm:items-center transition-all duration-200
              opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2
              ${isHovered ? 'sm:opacity-100 sm:translate-y-0' : ''}`}
          >
          <Button
            onClick={handleAddToCart}
              className="col-span-2 w-full btn-primary h-10 rounded-full text-xs tracking-wide sm:flex-1"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="ml-2">Add</span>
          </Button>
          <CompareToggleButton
            product={product}
             className="h-10 w-full sm:w-10 rounded-full"
          />
          <Button
            size="icon"
            variant="outline"
            onClick={handleToggleWishlist}
              className={`h-10 w-full sm:w-10 rounded-full ${inWishlist ? 'bg-primary text-primary-foreground border-primary' : ''}`}
          >
            <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleQuickView}
              className="h-10 w-full sm:w-10 rounded-full"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="pt-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground line-clamp-1">
          {product.subcategory}
        </p>
        <h3 className="mt-1 font-body font-medium text-base leading-tight line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-1 text-primary font-medium text-sm">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-muted-foreground line-through text-sm">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );

  return (
    <>
      {isPerformanceMode ? (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <Link to={`/product/${product.slug || product.id}`} className="block">
            <Content />
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.4 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Link to={`/product/${product.slug || product.id}`} className="block">
            <Content />
          </Link>
        </motion.div>
      )}

      <QuickViewModal product={product} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />
    </>
  );
};

export default ProductCardEditorial;
