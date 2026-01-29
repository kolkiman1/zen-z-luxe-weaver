export type NavSubcategory = {
  name: string;
  href: string;
};

export type NavFeaturedProduct = {
  name: string;
  image: string;
  href: string;
  price: string;
};

export type NavCategory = {
  name: string;
  href: string;
  subcategories: NavSubcategory[];
  featured?: NavFeaturedProduct[];
};

// Shared navigation data used by MegaMenu + MobileMenu across theme variants.
export const navCategories: NavCategory[] = [
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
