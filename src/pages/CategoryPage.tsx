import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Grid3X3, Grid2X2, X, Loader2, ChevronDown, ArrowUpDown } from 'lucide-react';
import ThemedHeader from '@/components/layout/ThemedHeader';
import ThemedFooter from '@/components/layout/ThemedFooter';
import CartSidebar from '@/components/cart/CartSidebar';
import ThemedProductCard from '@/components/products/ThemedProductCard';
import { useTheme } from '@/contexts/ThemeContext';
import { categories } from '@/lib/data';
import { useProducts } from '@/hooks/useProducts';
import { useCategoryBanners } from '@/hooks/useCategoryBanners';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import ThemedPageFrame from '@/components/layout/ThemedPageFrame';
import ThemedPageLayout from '@/components/layout/ThemedPageLayout';
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
  const { theme } = useTheme();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // Myntra-like: larger cards by default (2 cols desktop, optionally 3)
  const [gridCols, setGridCols] = useState(2);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [sortBy, setSortBy] = useState('featured');

  const { products, loading, error } = useProducts(slug);
  const { data: categoryBanners } = useCategoryBanners();

  const category = categories.find((c) => c.slug === slug);
  const categoryName = category?.name || (slug === 'new-arrivals' ? 'New Arrivals' : 'All Products');
  const banner = slug ? categoryBanners?.[slug] : null;

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

  const gridClass = useMemo(() => {
    const baseCols =
      gridCols === 2
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3';

    if (theme === 'editorial') {
      return `grid ${baseCols} gap-10 md:gap-12`;
    }

    if (theme === 'brutalist') {
      return `grid ${baseCols} gap-4 md:gap-5`;
    }

    return `grid ${baseCols} gap-6 md:gap-8`;
  }, [theme, gridCols]);

  const FilterContent = () => (
    <div className={theme === 'brutalist' ? 'space-y-7' : 'space-y-6'}>
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
          <h3 className={theme === 'brutalist' ? 'font-body font-black uppercase tracking-wider text-sm mb-4' : 'font-display text-lg mb-4'}>
            Category
          </h3>
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
        <h3 className={theme === 'brutalist' ? 'font-body font-black uppercase tracking-wider text-sm mb-4' : 'font-display text-lg mb-4'}>
          Price Range
        </h3>
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
      <SEOHead
        title={categoryName}
        description={`Shop premium ${categoryName.toLowerCase()}. Discover luxury fashion and accessories with free shipping in Bangladesh.`}
        keywords={categoryName}
        url={`/category/${slug}`}
      />

      <ThemedHeader />
      <CartSidebar />

      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16 min-h-screen">
        <ThemedPageFrame className="pb-12 sm:pb-16">
          <ThemedPageLayout
            title={categoryName}
            subtitle={banner?.description || 'Browse the latest drops and essentials'}
            meta={
              <p className={theme === 'brutalist' ? 'text-xs tracking-[0.3em] uppercase text-muted-foreground' : 'text-sm text-muted-foreground'}>
                {loading ? 'Loading…' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}
              </p>
            }
            hero={
              banner?.url ? (
                <div
                  className={
                    theme === 'brutalist'
                      ? 'mb-6 border-2 border-border overflow-hidden'
                      : theme === 'artisan'
                        ? 'mb-10 overflow-hidden rounded-3xl'
                        : 'mb-10 overflow-hidden rounded-2xl'
                  }
                >
                  <div className="relative h-44 sm:h-56 md:h-72">
                    {banner.type === 'video' ? (
                      <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                        <source src={banner.url} type="video/mp4" />
                      </video>
                    ) : (
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${banner.url}')` }} />
                    )}
                    <div
                      className="absolute inset-0 bg-background"
                      style={{ opacity: (banner.overlayOpacity || 60) / 100 }}
                    />
                    <div className={theme === 'brutalist' ? 'absolute inset-0 p-4 sm:p-6 flex items-end' : 'absolute inset-0 p-4 sm:p-6 flex items-end'}>
                      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
                        <p
                          className={
                            theme === 'brutalist'
                              ? 'text-xs tracking-[0.35em] uppercase text-muted-foreground'
                              : 'text-xs tracking-[0.25em] uppercase text-muted-foreground'
                          }
                        >
                          {slug?.toUpperCase()}
                        </p>
                        <p className={theme === 'brutalist' ? 'mt-2 font-body font-black uppercase text-3xl sm:text-4xl' : 'mt-2 font-display text-3xl sm:text-4xl'}>
                          {banner.headline || categoryName}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              ) : null
            }
            aside={
              theme === 'editorial' || theme === 'artisan' ? (
                <FilterContent />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground">Filters</p>
                    <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 text-xs">
                      Clear
                    </Button>
                  </div>
                  <div className="mt-5">
                    <FilterContent />
                  </div>
                </>
              )
            }
          >
            {/* Toolbar (theme-specific density) */}
            <div
              className={
                theme === 'brutalist'
                  ? 'mb-5 border-2 border-border bg-card p-3'
                  : theme === 'artisan'
                    ? 'mb-6 surface-panel rounded-3xl p-3 sm:p-4'
                    : 'mb-6 bg-card/70 backdrop-blur rounded-2xl border border-border p-3 sm:p-4'
              }
            >
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Desktop Filter Button (only for non-brutalist, brutalist uses always-on rail) */}
                {theme !== 'brutalist' ? (
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
                ) : (
                  <div className="hidden lg:block text-xs tracking-[0.35em] uppercase text-muted-foreground">Product Grid</div>
                )}

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
                      <SheetTitle className={theme === 'brutalist' ? 'font-body font-black uppercase tracking-wider' : 'font-display text-xl'}>
                        Filters
                      </SheetTitle>
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
                  <div
                    className={
                      theme === 'brutalist'
                        ? 'hidden md:flex items-center gap-1 border-2 border-border bg-card p-1'
                        : 'hidden md:flex items-center gap-1 bg-secondary rounded-lg p-1'
                    }
                  >
                    <button
                      onClick={() => setGridCols(2)}
                      className={`p-2 transition-colors ${
                        theme === 'brutalist' ? 'rounded-none' : 'rounded'
                      } ${gridCols === 2 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      <Grid2X2 size={18} />
                    </button>
                    <button
                      onClick={() => setGridCols(3)}
                      className={`p-2 transition-colors ${
                        theme === 'brutalist' ? 'rounded-none' : 'rounded'
                      } ${gridCols === 3 ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      <Grid3X3 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible desktop rail for non-brutalist */}
            {theme !== 'brutalist' && (
              <AnimatePresence initial={false}>
                {isFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="hidden lg:block overflow-hidden"
                  >
                    <div className={theme === 'artisan' ? 'mt-4 surface-panel rounded-3xl p-5' : 'mt-4 bg-card/70 border border-border rounded-2xl p-5'}>
                      <FilterContent />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Products */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className={theme === 'brutalist' ? 'border-2 border-border bg-card p-10 text-center' : 'text-center py-16'}>
                <h3 className={theme === 'brutalist' ? 'font-body font-black uppercase text-lg mb-2' : 'font-display text-xl mb-2'}>
                  Error loading products
                </h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={theme === 'brutalist' ? 'border-2 border-border bg-card p-10 text-center' : 'text-center py-16'}>
                <h3 className={theme === 'brutalist' ? 'font-body font-black uppercase text-lg mb-2' : 'font-display text-xl mb-2'}>
                  No products found
                </h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or browse our other collections.</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <div className={gridClass}>
                {filteredProducts.map((product, index) => (
                  <ThemedProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            )}
          </ThemedPageLayout>
        </ThemedPageFrame>
      </main>

      <ThemedFooter />
    </>
  );
};

export default CategoryPage;