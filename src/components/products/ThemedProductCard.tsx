import type { Product } from '@/lib/data';
import { useTheme } from '@/contexts/ThemeContext';
import ProductCard from '@/components/products/ProductCard';
import ProductCardEditorial from '@/components/products/variants/ProductCardEditorial';
import ProductCardBrutalist from '@/components/products/variants/ProductCardBrutalist';
import { forwardRef } from 'react';

interface ThemedProductCardProps {
  product: Product;
  index?: number;
}

const ThemedProductCard = forwardRef<HTMLDivElement, ThemedProductCardProps>(
  ({ product, index = 0 }, ref) => {
  const { activeTheme } = useTheme();

  if (activeTheme === 'brutalist') {
    return (
      <div ref={ref}>
        <ProductCardBrutalist product={product} index={index} />
      </div>
    );
  }

  if (activeTheme === 'editorial') {
    return (
      <div ref={ref}>
        <ProductCardEditorial product={product} index={index} />
      </div>
    );
  }

  // artisan (default)
  return (
    <div ref={ref}>
      <ProductCard product={product} index={index} />
    </div>
  );
}
);

ThemedProductCard.displayName = 'ThemedProductCard';

export default ThemedProductCard;
