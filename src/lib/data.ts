// Mock data for Gen-zee.store

export interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'men' | 'women' | 'jewelry' | 'accessories';
  subcategory: string;
  images: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  description: string;
  details: string[];
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Men',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
    description: 'Premium menswear for the modern gentleman',
  },
  {
    id: '2',
    name: 'Women',
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    description: 'Elegant fashion for the contemporary woman',
  },
  {
    id: '3',
    name: 'Jewelry',
    slug: 'jewelry',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    description: 'Exquisite pieces that define luxury',
  },
  {
    id: '4',
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    description: 'Complete your look with premium accessories',
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Wool Overcoat',
    price: 24999,
    originalPrice: 32999,
    category: 'men',
    subcategory: 'Outerwear',
    images: [
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal', hex: '#36454F' },
      { name: 'Camel', hex: '#C19A6B' },
    ],
    description: 'A timeless wool overcoat crafted from premium Italian fabric.',
    details: ['100% Italian Wool', 'Fully lined interior', 'Two front pockets', 'Made in Bangladesh'],
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Silk Evening Dress',
    price: 18999,
    category: 'women',
    subcategory: 'Dresses',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Burgundy', hex: '#800020' },
    ],
    description: 'An elegant silk evening dress perfect for special occasions.',
    details: ['100% Pure Silk', 'Hand-stitched details', 'Hidden back zipper', 'Dry clean only'],
    inStock: true,
    isFeatured: true,
  },
  {
    id: '3',
    name: 'Gold Chain Necklace',
    price: 12999,
    category: 'jewelry',
    subcategory: 'Necklaces',
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    ],
    description: 'A stunning 18K gold-plated chain necklace.',
    details: ['18K Gold Plated', '45cm length', 'Hypoallergenic', 'Comes in luxury box'],
    inStock: true,
    isNew: true,
  },
  {
    id: '4',
    name: 'Italian Leather Belt',
    price: 5999,
    category: 'accessories',
    subcategory: 'Belts',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    ],
    sizes: ['32', '34', '36', '38', '40'],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Brown', hex: '#8B4513' },
    ],
    description: 'Handcrafted Italian leather belt with brushed gold buckle.',
    details: ['100% Italian Leather', 'Brushed gold buckle', 'Width: 3.5cm', 'Made to last'],
    inStock: true,
  },
  {
    id: '5',
    name: 'Cashmere Sweater',
    price: 15999,
    category: 'men',
    subcategory: 'Knitwear',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Navy', hex: '#000080' },
      { name: 'Grey', hex: '#808080' },
      { name: 'Cream', hex: '#FFFDD0' },
    ],
    description: 'Ultra-soft cashmere sweater for ultimate comfort.',
    details: ['100% Mongolian Cashmere', 'Ribbed cuffs and hem', 'Regular fit', 'Hand wash recommended'],
    inStock: true,
    isFeatured: true,
  },
  {
    id: '6',
    name: 'Designer Sunglasses',
    price: 8999,
    originalPrice: 11999,
    category: 'accessories',
    subcategory: 'Eyewear',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Tortoise', hex: '#8B4513' },
    ],
    description: 'Premium acetate sunglasses with UV400 protection.',
    details: ['Italian Acetate Frame', 'UV400 Protection', 'Includes case and cloth', 'Unisex design'],
    inStock: true,
    isNew: true,
  },
  {
    id: '7',
    name: 'Diamond Stud Earrings',
    price: 28999,
    category: 'jewelry',
    subcategory: 'Earrings',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    ],
    description: 'Elegant diamond stud earrings set in 18K white gold.',
    details: ['0.5ct total weight', '18K White Gold', 'SI1 Clarity', 'Certificate included'],
    inStock: true,
    isFeatured: true,
  },
  {
    id: '8',
    name: 'Leather Tote Bag',
    price: 14999,
    category: 'women',
    subcategory: 'Bags',
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    ],
    colors: [
      { name: 'Black', hex: '#000000' },
      { name: 'Tan', hex: '#D2B48C' },
    ],
    description: 'Spacious leather tote bag for everyday elegance.',
    details: ['Full grain leather', 'Cotton lining', 'Interior zip pocket', 'Magnetic closure'],
    inStock: true,
  },
  {
    id: '9',
    name: 'Slim Fit Blazer',
    price: 19999,
    category: 'men',
    subcategory: 'Blazers',
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Navy', hex: '#000080' },
      { name: 'Black', hex: '#000000' },
    ],
    description: 'Modern slim fit blazer for the contemporary gentleman.',
    details: ['Wool blend fabric', 'Slim fit', 'Two-button closure', 'Fully lined'],
    inStock: true,
  },
  {
    id: '10',
    name: 'Luxury Watch',
    price: 45999,
    category: 'accessories',
    subcategory: 'Watches',
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
    ],
    colors: [
      { name: 'Silver', hex: '#C0C0C0' },
      { name: 'Gold', hex: '#FFD700' },
    ],
    description: 'Premium automatic watch with sapphire crystal.',
    details: ['Swiss movement', 'Sapphire crystal', 'Water resistant 100m', '2-year warranty'],
    inStock: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: '11',
    name: 'Silk Blouse',
    price: 9999,
    category: 'women',
    subcategory: 'Tops',
    images: [
      'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: [
      { name: 'White', hex: '#FFFFFF' },
      { name: 'Blush', hex: '#DE5D83' },
    ],
    description: 'Elegant silk blouse with subtle pleating.',
    details: ['100% Silk', 'Button-front closure', 'Relaxed fit', 'Dry clean only'],
    inStock: true,
  },
  {
    id: '12',
    name: 'Signet Ring',
    price: 7999,
    category: 'jewelry',
    subcategory: 'Rings',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    ],
    sizes: ['7', '8', '9', '10', '11'],
    colors: [
      { name: 'Gold', hex: '#FFD700' },
      { name: 'Silver', hex: '#C0C0C0' },
    ],
    description: 'Classic signet ring with modern minimalist design.',
    details: ['18K Gold Plated', 'Stainless steel core', 'Engravable surface', 'Comes in gift box'],
    inStock: true,
  },
];

export const formatPrice = (price: number): string => {
  return `৳${price.toLocaleString('en-BD')}`;
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter((p) => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((p) => p.isFeatured);
};

export const getNewArrivals = (): Product[] => {
  return products.filter((p) => p.isNew);
};

export const searchProducts = (query: string): Product[] => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery) ||
      p.subcategory.toLowerCase().includes(lowercaseQuery)
  );
};
