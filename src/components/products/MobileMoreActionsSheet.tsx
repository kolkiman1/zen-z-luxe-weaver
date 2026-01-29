import * as React from 'react';
import { Heart, Eye } from 'lucide-react';
import type { Product } from '@/lib/data';
import CompareToggleButton from '@/components/compare/CompareToggleButton';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type ThemeVariant = 'artisan' | 'editorial' | 'brutalist';

type Props = {
  product: Product;
  inWishlist: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  onQuickView: (e: React.MouseEvent) => void;
  trigger: React.ReactNode;
  theme: ThemeVariant;
};

export default function MobileMoreActionsSheet({
  product,
  inWishlist,
  onToggleWishlist,
  onQuickView,
  trigger,
  theme,
}: Props) {
  const baseItem =
    'w-full justify-start gap-3 h-12 text-sm';

  const themeClasses =
    theme === 'brutalist'
      ? 'rounded-none border-2'
      : theme === 'editorial'
        ? 'rounded-full'
        : 'rounded-xl';

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="p-0">
        <div className="p-5">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-base">Actions</SheetTitle>
          </SheetHeader>

          <div className="mt-4 grid gap-2">
            <CompareToggleButton
              product={product}
              size="default"
              variant="outline"
              className={`${baseItem} ${themeClasses}`}
            />

            <Button
              type="button"
              variant="outline"
              onClick={onToggleWishlist}
              className={`${baseItem} ${themeClasses} ${
                inWishlist ? 'bg-primary text-primary-foreground border-primary' : ''
              }`}
            >
              <Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
              <span>Wishlist</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onQuickView}
              className={`${baseItem} ${themeClasses}`}
            >
              <Eye className="h-4 w-4" />
              <span>Quick view</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
