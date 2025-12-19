import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, Check, Truck, RefreshCw, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import ProductCard from '@/components/products/ProductCard';
import { products, formatPrice } from '@/lib/data';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!product) {
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

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

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

  return (
    <>
      <Helmet>
        <title>{product.name} | zen-z.store</title>
        <meta name="description" content={product.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images[0],
            "offers": {
              "@type": "Offer",
              "price": product.price,
              "priceCurrency": "BDT",
              "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
            }
          })}
        </script>
      </Helmet>

      <Header />
      <CartSidebar />

      <main className="pt-24 pb-16">
        <div className="container-luxury">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary">Home</Link></li>
              <li>/</li>
              <li><Link to={`/category/${product.category}`} className="hover:text-primary capitalize">{product.category}</Link></li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div
                className="relative aspect-[4/5] rounded-xl overflow-hidden bg-secondary cursor-zoom-in"
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
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

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-primary' : 'border-transparent'
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
              className="space-y-6"
            >
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                  {product.subcategory}
                </p>
                <h1 className="font-display text-3xl md:text-4xl mb-4">{product.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-display text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-foreground/70 leading-relaxed">{product.description}</p>

              {/* Size Selection */}
              {product.sizes && (
                <div>
                  <h3 className="font-medium mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-lg border transition-all ${
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
              {product.colors && (
                <div>
                  <h3 className="font-medium mb-3">
                    Color: <span className="text-muted-foreground">{selectedColor?.name}</span>
                  </h3>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                          selectedColor?.name === color.name
                            ? 'border-primary scale-110'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.hex }}
                      >
                        {selectedColor?.name === color.name && (
                          <Check size={16} className={color.hex === '#FFFFFF' || color.hex === '#FFFDD0' ? 'text-background' : 'text-white'} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-medium mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary py-6 gap-2"
                  disabled={!product.inStock}
                >
                  <ShoppingBag size={20} />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toggleWishlist(product)}
                  className={`w-14 h-14 ${inWishlist ? 'bg-primary text-primary-foreground border-primary' : ''}`}
                >
                  <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                <div className="text-center">
                  <Truck size={24} className="mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Free Delivery</p>
                </div>
                <div className="text-center">
                  <RefreshCw size={24} className="mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">7-Day Returns</p>
                </div>
                <div className="text-center">
                  <Shield size={24} className="mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
              </div>

              {/* Details */}
              <div className="pt-6 border-t border-border">
                <h3 className="font-display text-lg mb-4">Product Details</h3>
                <ul className="space-y-2">
                  {product.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <h2 className="font-display text-2xl md:text-3xl mb-8">You May Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
