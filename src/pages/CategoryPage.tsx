import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, Grid2X2, X, Loader2, ChevronDown, ArrowUpDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/cart/CartSidebar';
import ProductCard from '@/components/products/ProductCard';
import { categories } from '@/lib/data';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const subcategories: Record<string, string[]> = {
  men: ['Sherwanis', 'Kurtas', 'Pathani', 'Traditional', 'Jackets', 'Blazers', 'Outerwear', 'Knitwear', 'Shirts', 'Pants'],
  women: ['Sarees', 'Lehengas', 'Suits', 'Kurtas', 'Dresses', 'Tops', 'Bags', 'Shoes', 'Skirts'],
  jewelry: ['Sets', 'Necklaces', 'Earrings', 'Rings', 'Bracelets', 'Bangles', 'Anklets'],
  accessories: ['Dupattas', 'Belts', 'Eyewear', 'Watches', 'Bags', 'Scarves'],
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState(3);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('featured');

  const { products, loading, error } = useProducts(slug);

  const category = categories.find((c) => c.slug === slug);
  const categoryName = category?.name || (slug === 'new-arrivals' ? 'New Arrivals' : 'All Products');

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

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
  }, [products, selectedSubcategories, priceRange, sortBy]);

  const toggleSubcategory = (sub: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const clearFilters = () => {
    setSelectedSubcategories([]);
    setPriceRange([0, 100000]);
    setSortBy('featured');
  };

  // Get unique subcategories from actual products
  const availableSubcategories = useMemo(() => {
    const fromProducts = [...new Set(products.map(p => p.subcategory).filter(Boolean))];
    const predefined = slug && subcategories[slug] ? subcategories[slug] : [];
    return [...new Set([...predefined, ...fromProducts])];
  }, [products, slug]);

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort';

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Clear Filters */}
      {(selectedSubcategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000) && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="text-sm text-muted-foreground w-full justify-start"
        >
          <X size={16} className="mr-1" />
          Clear all filters
        </Button>
      )}

      {/* Subcategories */}
      {availableSubcategories.length > 0 && (
        <div>
          <h3 className="font-display text-lg mb-4">Category</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {availableSubcategories.map((sub) => (
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
      <div>
        <h3 className="font-display text-lg mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={100000}
          step={1000}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>৳{priceRange[0].toLocaleString()}</span>
          <span>৳{priceRange[1].toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

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
              {loading ? 'Loading...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
            </p>
          </motion.div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-border">
            {/* Desktop Filter Button */}
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="hidden lg:flex gap-2"
            >
              <SlidersHorizontal size={18} />
              Filters
              {(selectedSubcategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000) && (
                <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {selectedSubcategories.length + (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0)}
                </span>
              )}
            </Button>

            {/* Mobile Filter Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2">
                  <SlidersHorizontal size={16} />
                  <span className="hidden xs:inline">Filters</span>
                  {(selectedSubcategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 100000) && (
                    <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {selectedSubcategories.length + (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm">
                    <ArrowUpDown size={16} className="hidden xs:block" />
                    <span className="hidden sm:inline">{currentSortLabel}</span>
                    <span className="sm:hidden">Sort</span>
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`cursor-pointer ${sortBy === option.value ? 'bg-primary/10 text-primary' : ''}`}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Grid Toggle */}
              <div className="hidden md:flex items-center gap-1 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2 rounded transition-colors ${gridCols === 2 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <Grid2X2 size={18} />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2 rounded transition-colors ${gridCols === 3 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                >
                  <Grid3X3 size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar - Desktop */}
            <motion.aside
              initial={false}
              animate={{ width: isFilterOpen ? 280 : 0, opacity: isFilterOpen ? 1 : 0 }}
              className="hidden lg:block overflow-hidden flex-shrink-0"
            >
              <div className="w-[280px] pr-8">
                <FilterContent />
              </div>
            </motion.aside>

            {/* Products Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-16">
                  <h3 className="font-display text-xl mb-2">Error loading products</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
              ) : filteredProducts.length === 0 ? (
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