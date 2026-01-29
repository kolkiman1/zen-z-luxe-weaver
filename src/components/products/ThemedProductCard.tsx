import type { Product } from '@/lib/data';
import { useTheme } from '@/contexts/ThemeContext';
import ProductCard from '@/components/products/ProductCard';
import ProductCardEditorial from '@/components/products/variants/ProductCardEditorial';
import ProductCardBrutalist from '@/components/products/variants/ProductCardBrutalist';

interface ThemedProductCardProps {
  product: Product;
  index?: number;
}

const ThemedProductCard = ({ product, index = 0 }: ThemedProductCardProps) => {
  const { activeTheme } = useTheme();

  if (activeTheme === 'brutalist') {
    return <ProductCardBrutalist product={product} index={index} />;
  }

  if (activeTheme === 'editorial') {
    return <ProductCardEditorial product={product} index={index} />;
  }

  // artisan (default)
  return <ProductCard product={product} index={index} />;
};

export default ThemedProductCard;
