import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, Grid2X2, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import ProductCard from '@/components/products/ProductCard';
import { products, categories, Product } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

const subcategories: Record<string, string[]> = {
  men: ['Outerwear', 'Knitwear', 'Blazers', 'Shirts', 'Pants'],
  women: ['Dresses', 'Tops', 'Bags', 'Shoes', 'Skirts'],
  jewelry: ['Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Watches'],
  accessories: ['Belts', 'Eyewear', 'Watches', 'Bags', 'Scarves'],
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [sortBy, setSortBy] = useState('featured');

  const category = categories.find((c) => c.slug === slug);
  const categoryName = category?.name || 'All Products';

  const filteredProducts = useMemo(() => {
    let filtered: Product[] = [];

    if (slug === 'all' || slug === 'new-arrivals') {
      filtered = slug === 'new-arrivals' 
        ? products.filter((p) => p.isNew) 
        : [...products];
    } else {
      filtered = products.filter((p) => p.category === slug);
    }

    // Apply subcategory filter
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter((p) => selectedSubcategories.includes(p.subcategory));
    }

    // Apply price filter
    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered = filtered.filter((p) => p.isNew).concat(filtered.filter((p) => !p.isNew));
        break;
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return filtered;
  }, [slug, selectedSubcategories, priceRange, sortBy]);

  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const clearFilters = () => {
    setSelectedSubcategories([]);
    setPriceRange([0, 50000]);
    setSortBy('featured');
  };

  return (
    <>
      <Helmet>
        <title>{categoryName} | zen-z.store - Premium Fashion</title>
        <meta
          name="description"
          content={`Shop premium ${categoryName.toLowerCase()} at zen-z.store. Discover luxury fashion and accessories with free shipping in Bangladesh.`}
        />
      </Helmet>

      <Header />
      <CartSidebar />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl mb-3">{categoryName}</h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </motion.div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="gap-2"
            >
              <SlidersHorizontal size={18} />
              Filters
            </Button>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {/* Grid Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded ${gridCols === 2 ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <Grid2X2 size={18} />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded ${gridCols === 3 ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <Grid3X3 size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <motion.aside
              initial={false}
              animate={{ width: isFilterOpen ? 280 : 0, opacity: isFilterOpen ? 1 : 0 }}
              className="hidden lg:block overflow-hidden flex-shrink-0"
            >
              <div className="w-[280px] pr-8">
                {/* Clear Filters */}
                {(selectedSubcategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="mb-6 text-sm text-muted-foreground"
                  >
                    <X size={16} className="mr-1" />
                    Clear all filters
                  </Button>
                )}

                {/* Subcategories */}
                {slug && subcategories[slug] && (
                  <div className="mb-8">
                    <h3 className="font-display text-lg mb-4">Category</h3>
                    <div className="space-y-3">
                      {subcategories[slug].map((sub) => (
                        <label key={sub} className="flex items-center gap-3 cursor-pointer">
                          <Checkbox
                            checked={selectedSubcategories.includes(sub)}
                            onCheckedChange={() => toggleSubcategory(sub)}
                          />
                          <span className="text-sm">{sub}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-8">
                  <h3 className="font-display text-lg mb-4">Price Range</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={50000}
                    step={1000}
                    className="mb-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>৳{priceRange[0].toLocaleString()}</span>
                    <span>৳{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-16">
                  <h3 className="font-display text-xl mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or browse our other collections.
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              ) : (
                <div
                  className={`grid gap-6 md:gap-8 ${
                    gridCols === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`}
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CategoryPage;
