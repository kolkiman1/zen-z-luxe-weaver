import { Skeleton } from '@/components/ui/skeleton';

const ProductCardSkeleton = () => {
  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border/50">
      {/* Image Skeleton */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Skeleton className="w-full h-full" />
        {/* Badge placeholder */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        
        {/* Subcategory */}
        <Skeleton className="h-4 w-1/2" />
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>

        {/* Color swatches */}
        <div className="flex gap-1.5 pt-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="w-4 h-4 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
