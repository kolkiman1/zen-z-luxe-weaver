import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, Product } from '@/lib/data';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        // Sanitize query: escape special characters for ILIKE pattern matching
        // This prevents pattern injection attacks where attackers could use %, _, [, ] to manipulate search
        const sanitizedQuery = query.replace(/[%_\\[\]]/g, '\\$&');
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${sanitizedQuery}%,category.ilike.%${sanitizedQuery}%,subcategory.ilike.%${sanitizedQuery}%`)
          .limit(6);

        if (error) throw error;

        const transformedProducts = (data || []).map((p): Product => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price,
          originalPrice: p.original_price || undefined,
          category: p.category as 'men' | 'women' | 'jewelry' | 'accessories',
          subcategory: p.subcategory || '',
          images: p.images || [],
          sizes: p.sizes || undefined,
          colors: Array.isArray(p.colors) ? (p.colors as { name: string; hex: string }[]) : undefined,
          description: p.description || '',
          details: [],
          inStock: p.in_stock ?? true,
          isNew: p.is_new ?? false,
          isFeatured: p.is_featured ?? false,
        }));

        setResults(transformedProducts);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleClose = () => {
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/95 backdrop-blur-xl z-50"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container-luxury px-4 sm:px-6 pt-16 sm:pt-24 md:pt-32"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={22} className="sm:w-6 sm:h-6" />
            </button>

            {/* Search Input */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search
                  size={20}
                  className="sm:w-6 sm:h-6 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full h-12 sm:h-16 pl-10 sm:pl-14 pr-10 sm:pr-4 bg-secondary border-border text-base sm:text-lg font-body placeholder:text-muted-foreground focus:border-primary"
                />
                {loading && (
                  <Loader2 className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Results */}
              <div className="mt-6 sm:mt-8">
                {query.length > 1 && !loading && results.length === 0 ? (
                  <p className="text-center text-sm sm:text-base text-muted-foreground">
                    No products found for "{query}"
                  </p>
                ) : (
                  <div className="grid gap-2 sm:gap-4">
                    {results.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={`/product/${product.slug || product.id}`}
                          onClick={handleClose}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-card hover:bg-secondary transition-colors group"
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm sm:text-base truncate">{product.name}</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground capitalize">
                              {product.category} · {product.subcategory}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4">
                            <span className="text-primary font-medium text-sm sm:text-base">
                              {formatPrice(product.price)}
                            </span>
                            <ArrowRight
                              size={18}
                              className="hidden sm:block text-muted-foreground group-hover:text-primary transition-colors"
                            />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Popular Searches */}
              {query.length === 0 && (
                <div className="mt-8 sm:mt-12">
                  <h3 className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Saree', 'Sherwani', 'Kurta', 'Lehenga', 'Jewelry', 'Anarkali'].map(
                      (term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-secondary text-xs sm:text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {term}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;