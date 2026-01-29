import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, Check, Truck, RefreshCw, Shield, Loader2 } from 'lucide-react';
import ThemedHeader from '@/components/layout/ThemedHeader';
import ThemedFooter from '@/components/layout/ThemedFooter';
import CartSidebar from '@/components/cart/CartSidebar';
import ThemedProductCard from '@/components/products/ThemedProductCard';
import ImageZoomViewer from '@/components/products/ImageZoomViewer';
import { formatPrice } from '@/lib/data';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { SEOHead } from '@/components/SEOHead';
import { useSeoSettings } from '@/hooks/useSiteSettings';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ThemedPageFrame from '@/components/layout/ThemedPageFrame';
import ThemedPageLayout from '@/components/layout/ThemedPageLayout';
import { useTheme } from '@/contexts/ThemeContext';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id || '');
  const { products: relatedProducts } = useRelatedProducts(product?.category || '', id || '');
  const { data: seoSettings } = useSeoSettings();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { theme } = useTheme();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | undefined>();
  const [quantity, setQuantity] = useState(1);

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
         <ThemedHeader />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
         <ThemedFooter />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
       <ThemedHeader />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl mb-4">Product Not Found</h1>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </main>
       <ThemedFooter />
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

       <ThemedHeader />
      <CartSidebar />

      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <ThemedPageFrame className="pb-12 sm:pb-16">
          <ThemedPageLayout
            title={product.name}
            subtitle={product.subcategory}
            meta={
              <nav className="overflow-x-auto">
                <ol className={theme === 'brutalist' ? 'flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-muted-foreground whitespace-nowrap' : 'flex items-center gap-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap'}>
                  <li>
                    <Link to="/" className="hover:text-primary">
                      Home
                    </Link>
                  </li>
                  <li>/</li>
                  <li>
                    <Link to={`/category/${product.category}`} className="hover:text-primary capitalize">
                      {product.category}
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-foreground truncate max-w-[150px] sm:max-w-none">{product.name}</li>
                </ol>
              </nav>
            }
            aside={
              <div className={theme === 'brutalist' ? 'space-y-4' : 'space-y-4'}>
                <div className={theme === 'brutalist' ? 'border-2 border-border bg-card p-4' : 'surface-panel rounded-2xl p-4'}>
                  <p className={theme === 'brutalist' ? 'text-xs tracking-[0.35em] uppercase text-muted-foreground' : 'text-xs uppercase tracking-wider text-muted-foreground'}>
                    Price
                  </p>
                  <p className={theme === 'brutalist' ? 'mt-2 font-body font-black uppercase text-2xl' : 'mt-2 font-display text-2xl text-primary'}>
                    {formatPrice(product.price)}
                  </p>
                  {product.originalPrice ? (
                    <p className={theme === 'brutalist' ? 'mt-1 text-sm text-muted-foreground line-through' : 'mt-1 text-sm text-muted-foreground line-through'}>
                      {formatPrice(product.originalPrice)}
                    </p>
                  ) : null}
                </div>

                <div className={theme === 'brutalist' ? 'border-2 border-border bg-card p-4' : 'surface-panel rounded-2xl p-4'}>
                  {/* Size */}
                  {product.sizes && product.sizes.length > 0 ? (
                    <div>
                      <p className={theme === 'brutalist' ? 'text-xs tracking-[0.35em] uppercase text-muted-foreground' : 'text-sm font-medium'}>
                        Size
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={
                              theme === 'brutalist'
                                ? `h-10 px-4 border-2 text-xs font-black uppercase tracking-wider transition-colors ${
                                    selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                                  }`
                                : `h-10 px-4 rounded-lg border text-sm transition-colors ${
                                    selectedSize === size ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary'
                                  }`
                            }
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Color */}
                  {product.colors && product.colors.length > 0 ? (
                    <div className="mt-5">
                      <p className={theme === 'brutalist' ? 'text-xs tracking-[0.35em] uppercase text-muted-foreground' : 'text-sm font-medium'}>
                        Color <span className="text-muted-foreground">{selectedColor?.name ? `— ${selectedColor.name}` : ''}</span>
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color)}
                            className={
                              theme === 'brutalist'
                                ? `h-10 px-3 border-2 text-xs font-black uppercase tracking-wider transition-colors ${
                                    selectedColor?.name === color.name
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'border-border hover:border-primary'
                                  }`
                                : `h-10 px-3 rounded-lg border text-sm transition-colors ${
                                    selectedColor?.name === color.name
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'border-border hover:border-primary'
                                  }`
                            }
                          >
                            {color.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Quantity */}
                  <div className="mt-6">
                    <p className={theme === 'brutalist' ? 'text-xs tracking-[0.35em] uppercase text-muted-foreground' : 'text-sm font-medium'}>
                      Quantity
                    </p>
                    <div className={theme === 'brutalist' ? 'mt-3 inline-flex items-center border-2 border-border' : 'mt-3 inline-flex items-center border border-border rounded-lg'}>
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className={theme === 'brutalist' ? 'w-12 h-12 hover:bg-secondary' : 'w-12 h-12 hover:bg-secondary rounded-l-lg'}
                      >
                        <Minus size={16} className="mx-auto" />
                      </button>
                      <span className={theme === 'brutalist' ? 'w-12 text-center font-black' : 'w-12 text-center font-medium'}>
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className={theme === 'brutalist' ? 'w-12 h-12 hover:bg-secondary' : 'w-12 h-12 hover:bg-secondary rounded-r-lg'}
                      >
                        <Plus size={16} className="mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
                    <Button
                      onClick={handleAddToCart}
                      className={theme === 'brutalist' ? 'btn-primary rounded-none h-12' : 'btn-primary h-12 rounded-full'}
                      disabled={!product.inStock}
                    >
                      <span className="inline-flex items-center gap-2">
                        <ShoppingBag size={18} />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleWishlist(product)}
                      className={
                        theme === 'brutalist'
                          ? `h-12 w-12 rounded-none border-2 ${inWishlist ? 'bg-primary text-primary-foreground border-primary' : ''}`
                          : `h-12 w-12 rounded-full ${inWishlist ? 'bg-primary text-primary-foreground border-primary' : ''}`
                      }
                    >
                      <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                    </Button>
                  </div>
                </div>

                <div className={theme === 'brutalist' ? 'border-2 border-border bg-card p-4' : 'surface-panel rounded-2xl p-4'}>
                  <div className={theme === 'brutalist' ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-3 gap-2'}>
                    <div className={theme === 'brutalist' ? 'border border-border p-3' : 'text-center'}>
                      <Truck size={18} className={theme === 'brutalist' ? 'text-primary' : 'mx-auto text-primary'} />
                      <p className={theme === 'brutalist' ? 'mt-2 text-xs tracking-[0.3em] uppercase text-muted-foreground' : 'mt-1 text-[10px] sm:text-xs text-muted-foreground'}>
                        Delivery
                      </p>
                    </div>
                    <div className={theme === 'brutalist' ? 'border border-border p-3' : 'text-center'}>
                      <RefreshCw size={18} className={theme === 'brutalist' ? 'text-primary' : 'mx-auto text-primary'} />
                      <p className={theme === 'brutalist' ? 'mt-2 text-xs tracking-[0.3em] uppercase text-muted-foreground' : 'mt-1 text-[10px] sm:text-xs text-muted-foreground'}>
                        Returns
                      </p>
                    </div>
                    <div className={theme === 'brutalist' ? 'border border-border p-3' : 'text-center'}>
                      <Shield size={18} className={theme === 'brutalist' ? 'text-primary' : 'mx-auto text-primary'} />
                      <p className={theme === 'brutalist' ? 'mt-2 text-xs tracking-[0.3em] uppercase text-muted-foreground' : 'mt-1 text-[10px] sm:text-xs text-muted-foreground'}>
                        Secure
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <div className={theme === 'brutalist' ? 'grid gap-6 lg:grid-cols-[96px_1fr]' : 'grid gap-6 lg:grid-cols-2 lg:gap-16'}>
              {/* Thumbs rail for brutalist */}
              {theme === 'brutalist' && product.images.length > 1 ? (
                <div className="hidden lg:flex flex-col gap-3">
                  {product.images.map((img, index) => (
                    <button
                      key={img + index}
                      onClick={() => setSelectedImage(index)}
                      className={`border-2 overflow-hidden ${selectedImage === index ? 'border-primary' : 'border-border hover:border-primary'}`}
                    >
                      <img src={img} alt="" className="h-24 w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Main image */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div
                  className={
                    theme === 'brutalist'
                      ? 'border-2 border-border bg-card'
                      : theme === 'artisan'
                        ? 'overflow-hidden rounded-3xl'
                        : 'overflow-hidden rounded-2xl'
                  }
                >
                  <ImageZoomViewer
                    images={product.images}
                    currentIndex={selectedImage}
                    onIndexChange={setSelectedImage}
                    alt={product.name}
                  />
                </div>

                {/* Mobile thumbs (non-brutalist shows below) */}
                {theme !== 'brutalist' && product.images.length > 1 ? (
                  <div className="mt-3 hidden sm:flex gap-2 overflow-x-auto pb-1">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-20 h-24 overflow-hidden border-2 transition-colors ${
                          theme === 'artisan' ? 'rounded-2xl' : 'rounded-lg'
                        } ${selectedImage === index ? 'border-primary' : 'border-transparent hover:border-border'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </motion.div>

              {/* Description and details block (editorial/artisan) */}
              {theme !== 'brutalist' ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {product.description ? (
                    <div className={theme === 'artisan' ? 'surface-panel rounded-3xl p-5 sm:p-6' : 'bg-card/70 border border-border rounded-2xl p-5 sm:p-6'}>
                      <h2 className="font-display text-xl">Details</h2>
                      <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {product.description.includes('\n') || product.description.includes('•') || product.description.includes('-') ? (
                          <ul className="space-y-2">
                            {product.description
                              .split(/[\n•\-]/)
                              .map((line) => line.trim())
                              .filter((line) => line.length > 0)
                              .map((line, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                                  <span>{line}</span>
                                </li>
                              ))}
                          </ul>
                        ) : (
                          <p>{product.description}</p>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {product.details && product.details.length > 0 ? (
                    <div className={theme === 'artisan' ? 'surface-panel rounded-3xl p-5 sm:p-6' : 'bg-card/70 border border-border rounded-2xl p-5 sm:p-6'}>
                      <h2 className="font-display text-xl">Product Info</h2>
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {product.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check size={16} className="mt-0.5 text-primary" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </motion.div>
              ) : (
                <div className="hidden lg:block" />
              )}
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section className="mt-12 sm:mt-16">
                <h2 className={theme === 'brutalist' ? 'font-body font-black uppercase tracking-tight text-xl mb-4' : 'font-display text-2xl md:text-3xl mb-6'}>
                  You May Also Like
                </h2>
                <div className={theme === 'brutalist' ? 'grid grid-cols-2 lg:grid-cols-4 gap-4' : 'grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'}>
                  {relatedProducts.map((p, index) => (
                    <ThemedProductCard key={p.id} product={p} index={index} />
                  ))}
                </div>
              </section>
            )}
          </ThemedPageLayout>
        </ThemedPageFrame>
      </main>

       <ThemedFooter />
    </>
  );
};

export default ProductDetailPage;