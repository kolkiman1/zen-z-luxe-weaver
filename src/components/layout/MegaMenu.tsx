import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SubCategory {
  name: string;
  href: string;
}

interface FeaturedProduct {
  name: string;
  image: string;
  href: string;
  price: string;
}

interface CategoryData {
  name: string;
  href: string;
  subcategories: SubCategory[];
  featured?: FeaturedProduct[];
}

const categoryData: CategoryData[] = [
  {
    name: 'Men',
    href: '/category/men',
    subcategories: [
      { name: 'Traditional Wear', href: '/category/men?sub=traditional' },
      { name: 'Casual Wear', href: '/category/men?sub=casual' },
      { name: 'Formal Wear', href: '/category/men?sub=formal' },
      { name: 'Festive Collection', href: '/category/men?sub=festive' },
    ],
    featured: [
      {
        name: 'Royal Sherwani Set',
        image: '/products/royal-sherwani-set-1.webp',
        href: '/product/royal-sherwani-set',
        price: '₹12,999',
      },
      {
        name: 'Addi Cotton Panjabi',
        image: '/products/addi-cotton-panjabi-1.jpg',
        href: '/product/addi-cotton-panjabi',
        price: '₹2,499',
      },
    ],
  },
  {
    name: 'Women',
    href: '/category/women',
    subcategories: [
      { name: 'Sarees', href: '/category/women?sub=sarees' },
      { name: 'Lehengas', href: '/category/women?sub=lehengas' },
      { name: 'Kurta Sets', href: '/category/women?sub=kurta-sets' },
      { name: 'Gowns & Dresses', href: '/category/women?sub=gowns' },
    ],
    featured: [
      {
        name: 'Banarasi Silk Saree',
        image: '/products/banarasi-silk-saree-1.jpg',
        href: '/product/banarasi-silk-saree',
        price: '₹8,999',
      },
      {
        name: 'Lehenga Choli Set',
        image: '/products/lehenga-choli-set-1.jpg',
        href: '/product/lehenga-choli-set',
        price: '₹15,999',
      },
    ],
  },
  {
    name: 'Jewelry',
    href: '/category/jewelry',
    subcategories: [
      { name: 'Necklaces', href: '/category/jewelry?sub=necklaces' },
      { name: 'Earrings', href: '/category/jewelry?sub=earrings' },
      { name: 'Bracelets', href: '/category/jewelry?sub=bracelets' },
      { name: 'Complete Sets', href: '/category/jewelry?sub=sets' },
    ],
    featured: [
      {
        name: 'Gold Chain Necklace',
        image: '/products/gold-chain-necklace-1.jpg',
        href: '/product/gold-chain-necklace',
        price: '₹4,999',
      },
    ],
  },
  {
    name: 'Accessories',
    href: '/category/accessories',
    subcategories: [
      { name: 'Bags & Backpacks', href: '/category/accessories?sub=bags' },
      { name: 'Caps & Hats', href: '/category/accessories?sub=caps' },
      { name: 'Belts', href: '/category/accessories?sub=belts' },
      { name: 'Watches', href: '/category/accessories?sub=watches' },
    ],
    featured: [
      {
        name: 'Oxford Backpack',
        image: '/products/oxford-backpack-1.jpg',
        href: '/product/oxford-backpack',
        price: '₹2,999',
      },
      {
        name: 'IDGAF Cap',
        image: '/products/idgaf-cap-1.jpg',
        href: '/product/idgaf-cap',
        price: '₹799',
      },
    ],
  },
];

interface MegaMenuProps {
  isScrolled: boolean;
  currentPath: string;
}

const MegaMenu = ({ isScrolled, currentPath }: MegaMenuProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <nav className="hidden lg:flex items-center gap-6">
      <Link
        to="/"
        className={`luxury-underline text-sm font-body tracking-wide transition-colors ${
          currentPath === '/'
            ? 'text-primary'
            : 'text-foreground/80 hover:text-foreground'
        }`}
      >
        Home
      </Link>
      
      {categoryData.map((category) => (
        <div
          key={category.name}
          className="relative"
          onMouseEnter={() => setActiveCategory(category.name)}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <Link
            to={category.href}
            className={`flex items-center gap-1 text-sm font-body tracking-wide transition-colors ${
              currentPath.includes(category.href)
                ? 'text-primary'
                : 'text-foreground/80 hover:text-foreground'
            }`}
          >
            {category.name}
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${
                activeCategory === category.name ? 'rotate-180' : ''
              }`}
            />
          </Link>
          
          <AnimatePresence>
            {activeCategory === category.name && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`absolute left-1/2 -translate-x-1/2 top-full pt-4 z-50`}
              >
                <div className={`min-w-[500px] rounded-xl border border-border/50 shadow-2xl overflow-hidden ${
                  isScrolled ? 'bg-card' : 'bg-card/95 backdrop-blur-xl'
                }`}>
                  <div className="p-6 grid grid-cols-2 gap-8">
                    {/* Subcategories */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Categories
                      </h3>
                      <ul className="space-y-2">
                        {category.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              to={sub.href}
                              className="text-sm text-foreground/80 hover:text-primary hover:pl-2 transition-all duration-200 block"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                        <li className="pt-2 border-t border-border/30 mt-3">
                          <Link
                            to={category.href}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            View All {category.name} →
                          </Link>
                        </li>
                      </ul>
                    </div>
                    
                    {/* Featured Products */}
                    {category.featured && category.featured.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                          Featured
                        </h3>
                        <div className="space-y-3">
                          {category.featured.map((product) => (
                            <Link
                              key={product.name}
                              to={product.href}
                              className="flex items-center gap-3 group"
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {product.name}
                                </p>
                                <p className="text-xs text-primary font-semibold">
                                  {product.price}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  );
};

export default MegaMenu;