import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCompare } from '@/contexts/CompareContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/data';

export default function CompareModal() {
  const { items, isOpen, close, clear } = useCompare();

  const a = items[0]?.product;
  const b = items[1]?.product;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? close() : undefined)}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle className="font-display text-xl sm:text-2xl">Compare</DialogTitle>
            <Button variant="ghost" size="icon" onClick={close} className="h-9 w-9">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Select up to 2 items from product cards to compare side-by-side.
          </p>
        </DialogHeader>

        <div className="p-4 sm:p-6">
          {items.length < 2 ? (
            <div className="text-sm text-muted-foreground">
              Pick {2 - items.length} more item{items.length === 1 ? '' : 's'} to compare.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {[a, b].map((p, idx) => (
                <div key={idx} className="surface-plate rounded-xl border border-border overflow-hidden">
                  <div className="flex gap-4 p-4">
                    <Link to={`/product/${p?.slug || p?.id}`} onClick={close} className="w-24 h-24 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      {p?.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : null}
                    </Link>
                    <div className="min-w-0">
                      <Link to={`/product/${p?.slug || p?.id}`} onClick={close}>
                        <h3 className="font-display text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">{p?.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{p?.subcategory}</p>
                      <p className="text-primary font-medium mt-2">{p ? formatPrice(p.price) : ''}</p>
                    </div>
                  </div>

                  <div className="border-t border-border p-4 text-sm">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-muted-foreground">Category</div>
                      <div className="col-span-2 text-right md:text-left">{p?.category || '—'}</div>

                      <div className="text-muted-foreground">Sizes</div>
                      <div className="col-span-2 text-right md:text-left">{p?.sizes?.length ? p.sizes.join(', ') : '—'}</div>

                      <div className="text-muted-foreground">Colors</div>
                      <div className="col-span-2 text-right md:text-left">{p?.colors?.length ? p.colors.map((c) => c.name).join(', ') : '—'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-border flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => clear()} disabled={!items.length}>
            Clear
          </Button>
          <Button className="btn-primary" onClick={close}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
