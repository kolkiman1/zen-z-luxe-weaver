import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, ChevronLeft, ChevronRight, Minus, Plus, Star, ThumbsUp } from 'lucide-react';
import { Product, formatPrice } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSwipe } from '@/hooks/useSwipe';

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpful: number;
  verified: boolean;
}

// Generate realistic reviews based on product
const generateReviews = (productName: string): Review[] => {
  const reviewTemplates: Review[] = [
    {
      id: '1',
      userName: 'Anika R.',
      rating: 5,
      date: '2 weeks ago',
      title: 'Absolutely love it!',
      comment: `This ${productName.toLowerCase()} exceeded my expectations. The quality is amazing and it fits perfectly. Already got so many compliments from friends!`,
      helpful: 24,
      verified: true,
    },
    {
      id: '2',
      userName: 'Farhan M.',
      rating: 4,
      date: '1 month ago',
      title: 'Great quality, slight sizing issue',
      comment: 'Really happy with the purchase overall. Material feels premium and looks exactly like the photos. Only giving 4 stars because it runs a bit small - recommend sizing up.',
      helpful: 18,
      verified: true,
    },
    {
      id: '3',
      userName: 'Nusrat J.',
      rating: 5,
      date: '3 weeks ago',
      title: 'Perfect for the occasion',
      comment: 'Bought this for my cousin\'s wedding and received so many compliments! The craftsmanship is beautiful and delivery was super fast. Will definitely order again.',
      helpful: 31,
      verified: true,
    },
    {
      id: '4',
      userName: 'Rafiq H.',
      rating: 4,
      date: '2 months ago',
      title: 'Good value for money',
      comment: 'Decent quality for the price point. The color is slightly different from what I expected but still looks good. Customer service was helpful when I had questions.',
      helpful: 12,
      verified: false,
    },
    {
      id: '5',
      userName: 'Tasnim K.',
      rating: 5,
      date: '1 week ago',
      title: 'My new favorite!',
      comment: 'Can\'t stop wearing this honestly. It\'s so comfortable and versatile - works for both casual outings and more formal events. The packaging was also really nice, felt like a gift.',
      helpful: 45,
      verified: true,
    },
  ];

  return reviewTemplates;
};

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'text-gold fill-gold' : 'text-border'}
        />
      ))}
    </div>
  );
};

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const reviews = generateReviews(product.name);
  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    onClose();
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const swipeHandlers = useSwipe({
    onSwipeLeft: nextImage,
    onSwipeRight: prevImage,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg md:max-w-3xl lg:max-w-5xl p-0 overflow-hidden bg-card border-border max-h-[90vh] sm:max-h-[85vh]">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-[4/3] sm:aspect-square bg-secondary touch-pan-y" {...swipeHandlers}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {/* Image Navigation */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Image Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-primary w-6' 
                          : 'bg-foreground/30 hover:bg-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isNew && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  NEW
                </span>
              )}
              {product.originalPrice && (
                <span className="px-3 py-1 bg-destructive text-destructive-foreground text-xs font-medium rounded-full">
                  SALE
                </span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <ScrollArea className="h-[350px] sm:h-[500px] md:h-auto md:max-h-[90vh]">
            <div className="p-4 sm:p-6 md:p-8 flex flex-col">
              {/* Header */}
              <div className="mb-3 sm:mb-4">
                <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">
                  {product.subcategory}
                </p>
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl mb-1.5 sm:mb-2">{product.name}</h2>
                
                {/* Rating Summary */}
                <div className="flex items-center gap-3 mb-3">
                  <StarRating rating={Math.round(averageRating)} />
                  <span className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl font-semibold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-border mb-4">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'details' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Details
                  {activeTab === 'details' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-sm font-medium transition-colors relative ${
                    activeTab === 'reviews' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Reviews ({reviews.length})
                  {activeTab === 'reviews' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    />
                  )}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'details' ? (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Description */}
                    {product.description && (
                      <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    {/* Colors */}
                    {product.colors && product.colors.length > 0 && (
                      <div className="mb-5">
                        <p className="text-sm font-medium mb-3">
                          Color: <span className="text-muted-foreground">{selectedColor?.name || 'Select'}</span>
                        </p>
                        <div className="flex gap-2">
                          {product.colors.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => setSelectedColor(color)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                selectedColor?.name === color.name 
                                  ? 'border-primary scale-110' 
                                  : 'border-border hover:border-foreground/50'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-5">
                        <p className="text-sm font-medium mb-3">
                          Size: <span className="text-muted-foreground">{selectedSize || 'Select'}</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((size) => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              className={`min-w-[44px] h-10 px-4 rounded-lg border text-sm font-medium transition-all ${
                                selectedSize === size
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border hover:border-foreground/50'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity */}
                    <div className="mb-5">
                      <p className="text-sm font-medium mb-3">Quantity</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-10 h-10 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Rating Breakdown */}
                    <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{averageRating.toFixed(1)}</div>
                        <StarRating rating={Math.round(averageRating)} size={12} />
                        <div className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</div>
                      </div>
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          const percentage = (count / reviews.length) * 100;
                          return (
                            <div key={stars} className="flex items-center gap-2 text-xs">
                              <span className="w-3">{stars}</span>
                              <Star size={10} className="text-gold fill-gold" />
                              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gold rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-6 text-muted-foreground">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Individual Reviews */}
                    {reviews.map((review, index) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-border pb-4 last:border-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{review.userName}</span>
                              {review.verified && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/10 text-green-500 rounded">
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <StarRating rating={review.rating} size={12} />
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <h4 className="font-medium text-sm mb-1">{review.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                        <button className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ThumbsUp size={12} />
                          Helpful ({review.helpful})
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions - Always visible */}
              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary py-5 sm:py-6 gap-1.5 sm:gap-2 text-sm sm:text-base"
                  disabled={!product.inStock}
                >
                  <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleWishlist}
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex-shrink-0 ${
                    inWishlist ? 'bg-primary/10 border-primary text-primary' : ''
                  }`}
                >
                  <Heart size={18} className="sm:w-5 sm:h-5" fill={inWishlist ? 'currentColor' : 'none'} />
                </Button>
              </div>

              {/* Stock Status */}
              <div className="mt-3 sm:mt-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-destructive'}`} />
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
