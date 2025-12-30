import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useSeoSettings } from '@/hooks/useSiteSettings';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { data: seoSettings } = useSeoSettings();

  const siteName = seoSettings?.siteTitle?.split('|')[0]?.trim() || 'zen-z.store';

  const handleAddToCart = (product: typeof items[0]) => {
    addToCart(product, 1, product.sizes?.[0], product.colors?.[0]);
    toast.success('Added to cart', {
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <>
      <Helmet>
        <title>Wishlist | {siteName}</title>
        <meta name="description" content={`Your saved items at ${siteName}. Review and shop your favorite products.`} />
        {seoSettings?.canonicalUrl && (
          <link rel="canonical" href={`${seoSettings.canonicalUrl}/wishlist`} />
        )}
      </Helmet>

      <Header />
      <CartSidebar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl mb-3">Your Wishlist</h1>
            <p className="text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </motion.div>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={64} className="mx-auto mb-6 text-muted-foreground" />
              <h2 className="font-display text-2xl mb-3">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8">
                Save your favorite items to buy them later
              </p>
              <Link to="/category/all">
                <Button className="btn-primary">Browse Collection</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {items.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row gap-6 p-6 bg-card rounded-xl border border-border"
                >
                  {/* Image */}
                  <Link to={`/product/${product.id}`} className="w-full sm:w-40 h-48 sm:h-auto aspect-square flex-shrink-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {product.subcategory}
                      </p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-display text-xl mb-2 hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-primary font-medium mb-3">{formatPrice(product.price)}</p>
                      <p className="text-sm text-foreground/70 line-clamp-2">{product.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="btn-primary gap-2"
                        disabled={!product.inStock}
                      >
                        <ShoppingBag size={18} />
                        Add to Cart
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromWishlist(product.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default WishlistPage;
