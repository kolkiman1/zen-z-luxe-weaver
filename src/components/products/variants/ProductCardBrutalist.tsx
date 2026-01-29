import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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

const ProductCardBrutalist = ({ product, index = 0 }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const performance = usePerformanceOptional();
  const isPerformanceMode = performance?.isPerformanceMode ?? false;
  const prefersReducedMotion = useReducedMotion();
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
    <article className="group relative border-2 border-border bg-card surface-motion surface-hover">
      <div className="relative aspect-square overflow-hidden">
        {!isImageLoaded && <div className="absolute inset-0 animate-pulse bg-muted" />}
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-200 ${isHovered ? 'scale-[1.06]' : 'scale-100'} ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
          decoding="async"
        />

        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-2">
          <div className="flex flex-col gap-1">
            {product.isNew && (
              <span className="sticker sticker-primary px-2 py-1 text-[10px] font-black uppercase tracking-widest">
                New
              </span>
            )}
            {product.originalPrice && (
              <span className="sticker px-2 py-1 text-[10px] font-black uppercase tracking-widest bg-destructive text-destructive-foreground">
                Sale
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CompareToggleButton
              product={product}
              className="h-9 w-9 rounded-none border-2 surface-plate"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleToggleWishlist}
              className={`h-9 w-9 rounded-none border-2 surface-plate ${inWishlist ? 'bg-primary text-primary-foreground border-primary' : ''}`}
            >
              <Heart className="w-4 h-4" fill={inWishlist ? 'currentColor' : 'none'} />
            </Button>
          </div>
        </div>

        <div
          className={`absolute inset-x-2 bottom-2 grid grid-cols-2 gap-2 transition-all duration-150 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          <Button onClick={handleAddToCart} className="btn-primary rounded-none h-10 text-xs font-bold uppercase tracking-widest">
            <ShoppingBag className="w-4 h-4" />
            <span className="ml-2">Cart</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleQuickView}
            className="rounded-none h-10 border-2 text-xs font-bold uppercase tracking-widest"
          >
            <Eye className="w-4 h-4" />
            <span className="ml-2">View</span>
          </Button>
        </div>
      </div>

      <div className="p-3 border-t-2 border-border">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-body font-black uppercase tracking-[-0.02em] text-base leading-tight line-clamp-2">{product.name}</h3>
          <span className="sticker sticker-chrome px-2 py-1 text-xs font-black whitespace-nowrap">{formatPrice(product.price)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground uppercase tracking-widest line-clamp-1">
          {product.subcategory}
        </p>
        {product.originalPrice && (
          <p className="mt-1 text-sm text-muted-foreground line-through">{formatPrice(product.originalPrice)}</p>
        )}
      </div>
    </article>
  );

  return (
    <>
      {isPerformanceMode || prefersReducedMotion ? (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <Link to={`/product/${product.slug || product.id}`} className="block">
            <Content />
          </Link>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.35 }}
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

export default ProductCardBrutalist;
