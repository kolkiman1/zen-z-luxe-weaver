import type { ThemeId } from '@/hooks/useThemeSettings';

export type ThemeTokenSet = Record<string, string>;

export type ThemePackV1 = {
  version: 1;
  themes: Record<ThemeId, ThemeTokenSet>;
};

// Keep these keys aligned with src/index.css variables.
// Values are stored as raw CSS var values (e.g. "34 30% 96%", "1rem", "'Inter', sans-serif").
export const defaultThemePack: ThemePackV1 = {
  version: 1,
  themes: {
    artisan: {
      // Heritage Premium: warm ivory base + deep maroon primary + gold accent
      background: '34 30% 97%',
      foreground: '25 28% 12%',
      card: '34 40% 99%',
      'card-foreground': '25 28% 12%',
      popover: '34 40% 99%',
      'popover-foreground': '25 28% 12%',
      primary: '356 62% 34%',
      'primary-foreground': '34 30% 97%',
      secondary: '34 22% 92%',
      'secondary-foreground': '25 28% 12%',
      muted: '34 18% 93%',
      'muted-foreground': '25 16% 36%',
      accent: '38 55% 56%',
      'accent-foreground': '25 28% 12%',
      border: '34 14% 84%',
      input: '34 14% 84%',
      ring: '356 62% 34%',
      radius: '1.05rem',

      gold: '38 55% 56%',
      'gold-light': '38 70% 72%',
      'gold-dark': '38 45% 42%',
      charcoal: '25 28% 12%',
      'charcoal-light': '25 18% 18%',
      beige: '34 26% 92%',
      'beige-dark': '34 18% 78%',
      cream: '34 30% 97%',

      'shadow-gold': '0 10px 40px hsl(38 55% 56% / 0.18)',
      'shadow-soft': '0 14px 44px -30px hsl(25 28% 12% / 0.14)',
      'shadow-elevated': '0 30px 80px -48px hsl(25 28% 12% / 0.18)',

      'font-display': "'Space Grotesk', sans-serif",
      'font-body': "'Inter', sans-serif",

      'sidebar-background': '34 30% 96%',
      'sidebar-foreground': '25 28% 12%',
      'sidebar-primary': '356 62% 34%',
      'sidebar-primary-foreground': '34 30% 97%',
      'sidebar-accent': '34 22% 92%',
      'sidebar-accent-foreground': '25 28% 12%',
      'sidebar-border': '34 14% 84%',
      'sidebar-ring': '356 62% 34%',
    },
    editorial: {
      // Luxe Marketplace: bright, clean, premium marketplace (Myntra-scale)
      background: '40 33% 99%',
      foreground: '220 15% 10%',
      card: '0 0% 100%',
      'card-foreground': '220 15% 10%',
      popover: '0 0% 100%',
      'popover-foreground': '220 15% 10%',
      primary: '220 15% 10%',
      'primary-foreground': '40 33% 99%',
      secondary: '40 14% 95%',
      'secondary-foreground': '220 15% 10%',
      muted: '40 12% 95%',
      'muted-foreground': '220 10% 40%',
      accent: '38 55% 56%',
      'accent-foreground': '220 15% 10%',
      border: '40 10% 88%',
      input: '40 10% 88%',
      ring: '220 15% 10%',
      radius: '0.75rem',

      gold: '38 55% 56%',
      'gold-light': '38 70% 72%',
      'gold-dark': '38 45% 42%',
      charcoal: '220 15% 10%',
      'charcoal-light': '220 10% 18%',
      beige: '40 18% 94%',
      'beige-dark': '40 14% 82%',
      cream: '40 33% 99%',

      'shadow-gold': '0 12px 50px -28px hsl(38 55% 56% / 0.16)',
      'shadow-soft': '0 16px 44px -30px hsl(220 15% 10% / 0.10)',
      'shadow-elevated': '0 34px 86px -52px hsl(220 15% 10% / 0.14)',

      'font-display': "'Space Grotesk', sans-serif",
      'font-body': "'Inter', sans-serif",

      'sidebar-background': '40 33% 98%',
      'sidebar-foreground': '220 15% 10%',
      'sidebar-primary': '220 15% 10%',
      'sidebar-primary-foreground': '40 33% 99%',
      'sidebar-accent': '40 14% 95%',
      'sidebar-accent-foreground': '220 15% 10%',
      'sidebar-border': '40 10% 88%',
      'sidebar-ring': '220 15% 10%',
    },
    brutalist: {
      // Trend Pop: light marketplace + Myntra-pink primary + energetic accents
      background: '340 25% 98%',
      foreground: '220 15% 10%',
      card: '0 0% 100%',
      'card-foreground': '220 15% 10%',
      popover: '0 0% 100%',
      'popover-foreground': '220 15% 10%',
      primary: '330 92% 55%',
      'primary-foreground': '0 0% 100%',
      secondary: '340 30% 95%',
      'secondary-foreground': '220 15% 10%',
      muted: '340 18% 95%',
      'muted-foreground': '220 10% 42%',
      accent: '48 100% 55%',
      'accent-foreground': '220 15% 10%',
      border: '340 12% 88%',
      input: '340 12% 88%',
      ring: '330 92% 55%',
      radius: '0.9rem',

      gold: '330 92% 55%',
      'gold-light': '330 100% 66%',
      'gold-dark': '330 72% 42%',
      charcoal: '220 15% 10%',
      'charcoal-light': '220 10% 18%',
      beige: '340 18% 94%',
      'beige-dark': '340 12% 82%',
      cream: '340 25% 98%',

      'shadow-gold': '0 16px 60px -34px hsl(330 92% 55% / 0.22)',
      'shadow-soft': '0 14px 44px -30px hsl(220 15% 10% / 0.10)',
      'shadow-elevated': '0 30px 86px -54px hsl(220 15% 10% / 0.14)',

      'font-display': "'Space Grotesk', sans-serif",
      'font-body': "'Inter', sans-serif",

      'sidebar-background': '340 22% 97%',
      'sidebar-foreground': '220 15% 10%',
      'sidebar-primary': '330 92% 55%',
      'sidebar-primary-foreground': '0 0% 100%',
      'sidebar-accent': '340 30% 95%',
      'sidebar-accent-foreground': '220 15% 10%',
      'sidebar-border': '340 12% 88%',
      'sidebar-ring': '330 92% 55%',
    },
  },
};

export const isThemeId = (value: unknown): value is ThemeId =>
  value === 'artisan' || value === 'editorial' || value === 'brutalist';

export const isThemePackV1 = (value: unknown): value is ThemePackV1 => {
  if (!value || typeof value !== 'object') return false;
  const v = value as any;
  if (v.version !== 1) return false;
  const themes = v.themes;
  if (!themes || typeof themes !== 'object') return false;
  return isThemeId(themes?.artisan && 'artisan') && isThemeId(themes?.editorial && 'editorial') && isThemeId(themes?.brutalist && 'brutalist');
};
