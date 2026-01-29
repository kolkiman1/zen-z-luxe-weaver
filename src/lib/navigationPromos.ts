export type NavigationPromo = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
};

// NOTE: These are hard-coded for now.
// Future: make configurable via backend site settings (per-theme promos).
export const navigationPromos: Record<'artisan' | 'editorial' | 'brutalist', NavigationPromo> = {
  artisan: {
    eyebrow: 'Handpicked',
    title: 'Festive Edit',
    description: 'Traditional silhouettes with modern finishing touches.',
    href: '/category/men?sub=festive',
    image: '/products/royal-sherwani-set-1.webp',
  },
  editorial: {
    eyebrow: 'This Week',
    title: 'The Saree Issue',
    description: 'Quiet luxury textures, bold drape, zero noise.',
    href: '/category/women?sub=sarees',
    image: '/products/banarasi-silk-saree-1.jpg',
  },
  brutalist: {
    eyebrow: 'DROP',
    title: 'Accessories Hit',
    description: 'Utility-first pieces with hard edges and louder intent.',
    href: '/category/accessories',
    image: '/products/oxford-backpack-1.jpg',
  },
};
