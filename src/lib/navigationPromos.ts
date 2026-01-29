export type NavigationPromo = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
};

export type NavigationPromoThemeId = 'artisan' | 'editorial' | 'brutalist';

// Built-in defaults (used as fallback + “reset” baseline).
export const defaultNavigationPromos: Record<NavigationPromoThemeId, NavigationPromo> = {
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

// Backwards-compat alias (so existing imports don't crash).
export const navigationPromos = defaultNavigationPromos;
