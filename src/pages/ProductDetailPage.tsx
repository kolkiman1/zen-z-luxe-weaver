import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, Check, Truck, RefreshCw, Shield, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import ProductCard from '@/components/products/ProductCard';
import { formatPrice } from '@/lib/data';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { SEOHead } from '@/components/SEOHead';
import { useSeoSettings } from '@/hooks/useSiteSettings';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id || '');
  const { products: relatedProducts } = useRelatedProducts(product?.category || '', id || '');
  const { data: seoSettings } = useSeoSettings();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors?.length) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart.`,
    });
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const siteName = seoSettings?.siteTitle?.split('|')[0]?.trim() || 'Gen-zee.store';
  const productImage = product.images[0]?.startsWith('http') 
    ? product.images[0] 
    : `${seoSettings?.canonicalUrl || 'https://gen-zee.store'}${product.images[0]}`;

  return (
    <>
      <SEOHead
        title={product.name}
        description={product.description || `Shop ${product.name} at ${siteName}`}
        keywords={`${product.name}, ${product.category}`}
        image={productImage}
        url={`/product/${id}`}
        type="product"
        product={{
          price: product.price,
          currency: 'BDT',
          availability: product.inStock ? 'in stock' : 'out of stock',
        }}
        structuredData={{
          name: product.name,
          description: product.description || undefined,
          image: productImage,
          price: product.price,
          currency: 'BDT',
          availability: product.inStock ? 'InStock' : 'OutOfStock',
          sku: product.id,
          brand: siteName,
        }}
      />

      <Header />
      <CartSidebar />

      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container-luxury px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-4 sm:mb-8 overflow-x-auto">
            <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li>/</li>
              <li><Link to={`/category/${product.category}`} className="hover:text-primary capitalize">{product.category}</Link></li>
              <li>/</li>
              <li className="text-foreground truncate max-w-[150px] sm:max-w-none">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3 sm:space-y-4"
            >
              {/* Main Image */}
              <div
                className="relative aspect-[3/4] sm:aspect-[4/5] rounded-lg sm:rounded-xl overflow-hidden bg-secondary cursor-zoom-in"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                    exit={{ opacity: 0 }}
                    src={product.images[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                </AnimatePresence>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2">
                  {product.isNew && (
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium rounded-full">
                      NEW
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-destructive text-destructive-foreground text-[10px] sm:text-xs font-medium rounded-full">
                      SALE
                    </span>
                  )}
                </div>

                {/* Mobile Image Dots */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
                    {product.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          selectedImage === index ? 'bg-primary' : 'bg-background/60'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails - Hidden on mobile, shown on sm+ */}
              {product.images.length > 1 && (
                <div className="hidden sm:flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 rounded-md sm:rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">
                  {product.subcategory}
                </p>
                <h1 className="font-display text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4">{product.name}</h1>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl font-display text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base sm:text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description - Parse for multi-line content */}
              {product.description && (
                <div className="space-y-2">
                  {product.description.includes('\n') || product.description.includes('•') || product.description.includes('-') ? (
                    <ul className="space-y-2">
                      {product.description
                        .split(/[\n•\-]/)
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .map((line, index) => (
                          <li key={index} className="flex items-start gap-2 text-foreground/70">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>{line}</span>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-foreground/70 leading-relaxed">{product.description}</p>
                  )}
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Size</h3>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md sm:rounded-lg border text-sm sm:text-base transition-all ${
                          selectedSize === size
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">
                    Color: <span className="text-muted-foreground">{selectedColor?.name}</span>
                  </h3>
                  <div className="flex gap-2 sm:gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor?.name === color.name
                            ? 'border-primary scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColor?.name === color.name && (
                          <Check size={14} className={`sm:w-4 sm:h-4 ${color.hex === '#FFFFFF' || color.hex === '#FFFDD0' ? 'text-background' : 'text-white'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-medium text-sm sm:text-base mb-2 sm:mb-3">Quantity</h3>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center border border-border rounded-md sm:rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                    <span className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-4 pt-3 sm:pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary py-5 sm:py-6 gap-2 text-sm sm:text-base"
                  disabled={!product.inStock}
                >
                  <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleWishlist(product)}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 ${inWishlist ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                >
                  <Heart size={18} className="sm:w-5 sm:h-5" fill={inWishlist ? 'currentColor' : 'none'} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4 sm:pt-6 border-t border-border">
                <div className="text-center">
                  <Truck size={20} className="sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-primary" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Free Delivery</p>
                </div>
                <div className="text-center">
                  <RefreshCw size={20} className="sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-primary" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">7-Day Returns</p>
                </div>
                <div className="text-center">
                  <Shield size={20} className="sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-primary" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Secure Payment</p>
                </div>
              </div>

              {/* Details */}
              {product.details && product.details.length > 0 && (
                <div className="pt-4 sm:pt-6 border-t border-border">
                  <h3 className="font-display text-base sm:text-lg mb-3 sm:mb-4">Product Details</h3>
                  <ul className="space-y-1.5 sm:space-y-2">
                    {product.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-foreground/80">
                        <Check size={14} className="sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12 sm:mt-16 lg:mt-20">
              <h2 className="font-display text-xl sm:text-2xl md:text-3xl mb-4 sm:mb-6 lg:mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {relatedProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetailPage;