import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductPreviewProps {
  formData: {
    name: string;
    price: string;
    original_price: string;
    images: string[];
    is_new: boolean;
    is_featured: boolean;
    sizes: string;
    stock_quantity: string;
    category: string;
    description: string;
  };
}

const ProductPreview = ({ formData }: ProductPreviewProps) => {
  const price = parseFloat(formData.price) || 0;
  const originalPrice = parseFloat(formData.original_price) || 0;
  const stockQty = parseInt(formData.stock_quantity) || 0;
  const sizes = formData.sizes.split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="bg-secondary/30 rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Eye size={16} className="text-primary" />
        <span className="text-sm font-medium">Live Preview</span>
      </div>
      
      <div className="space-y-4">
        {/* Product Card Preview */}
        <div className="bg-card rounded-lg overflow-hidden border border-border/50">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-secondary/50">
            {formData.images.length > 0 ? (
              <img
                src={formData.images[0]}
                alt={formData.name || 'Product preview'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-xs">No image</span>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {formData.is_new && (
                <span className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded-full">
                  NEW
                </span>
              )}
              {originalPrice > 0 && originalPrice > price && (
                <span className="px-2 py-0.5 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full">
                  SALE
                </span>
              )}
            </div>

            {/* Quick Actions Preview */}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <Button size="icon" variant="secondary" className="w-7 h-7 rounded-full glass">
                <Heart className="w-3 h-3" />
              </Button>
              <Button size="icon" variant="secondary" className="w-7 h-7 rounded-full glass">
                <Eye className="w-3 h-3" />
              </Button>
            </div>

            {/* Add to Cart */}
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <Button className="w-full btn-primary py-2 gap-1 text-xs">
                <ShoppingBag className="w-3 h-3" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-3 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {formData.category}
            </p>
            <h3 className="font-display text-sm font-medium line-clamp-1">
              {formData.name || 'Product Name'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-primary font-medium text-sm">
                {price > 0 ? formatPrice(price) : '৳0'}
              </span>
              {originalPrice > 0 && originalPrice > price && (
                <span className="text-muted-foreground line-through text-xs">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Stock</span>
            <Badge variant={stockQty > 0 ? 'default' : 'destructive'} className="text-[10px]">
              {stockQty > 0 ? `${stockQty} available` : 'Out of Stock'}
            </Badge>
          </div>
          
          {sizes.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sizes</span>
              <div className="flex gap-1">
                {sizes.slice(0, 4).map((size) => (
                  <span key={size} className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">
                    {size}
                  </span>
                ))}
                {sizes.length > 4 && (
                  <span className="text-muted-foreground">+{sizes.length - 4}</span>
                )}
              </div>
            </div>
          )}

          {formData.is_featured && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className="bg-primary/20 text-primary text-[10px]">Featured</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
