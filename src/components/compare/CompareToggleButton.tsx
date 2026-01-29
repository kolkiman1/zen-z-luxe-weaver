import { Columns2 } from 'lucide-react';
import type { Product } from '@/lib/data';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';

type Props = {
  product: Product;
  className?: string;
  size?: 'icon' | 'sm' | 'default';
  variant?: 'outline' | 'secondary' | 'ghost';
};

export default function CompareToggleButton({
  product,
  className,
  size = 'icon',
  variant = 'outline',
}: Props) {
  const { isInCompare, toggle, loading } = useCompare();
  const active = isInCompare(product.id);

  return (
    <Button
      size={size as any}
      variant={variant as any}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      aria-pressed={active}
      aria-label={active ? 'Remove from compare' : 'Add to compare'}
      disabled={loading}
      className={`${active ? 'bg-primary text-primary-foreground border-primary' : ''} ${className ?? ''}`}
    >
      <Columns2 className="w-4 h-4" />
    </Button>
  );
}
