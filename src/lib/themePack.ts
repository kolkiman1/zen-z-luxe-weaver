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
      // Modern artisan: warm bone + deep ink + gold accents
      background: '34 25% 96%',
      foreground: '24 18% 10%',
      card: '34 30% 98%',
      'card-foreground': '24 18% 10%',
      popover: '34 30% 98%',
      'popover-foreground': '24 18% 10%',
      primary: '38 45% 60%',
      'primary-foreground': '24 18% 10%',
      secondary: '34 18% 92%',
      'secondary-foreground': '24 18% 10%',
      muted: '34 14% 92%',
      'muted-foreground': '24 10% 35%',
      accent: '32 40% 70%',
      'accent-foreground': '24 18% 10%',
      border: '34 10% 82%',
      input: '34 10% 82%',
      ring: '38 45% 60%',
      radius: '1rem',

      gold: '38 45% 60%',
      'gold-light': '38 55% 78%',
      'gold-dark': '38 40% 46%',
      charcoal: '24 18% 10%',
      'charcoal-light': '24 14% 16%',
      beige: '34 22% 92%',
      'beige-dark': '34 16% 78%',
      cream: '34 25% 96%',

      'shadow-gold': '0 4px 30px hsl(38 45% 60% / 0.15)',
      'shadow-soft': '0 4px 20px hsl(0 0% 0% / 0.3)',
      'shadow-elevated': '0 10px 40px hsl(0 0% 0% / 0.5)',

      'font-display': "'Space Grotesk', sans-serif",
      'font-body': "'Inter', sans-serif",

      'sidebar-background': '34 30% 95%',
      'sidebar-foreground': '25 25% 12%',
      'sidebar-primary': '38 45% 60%',
      'sidebar-primary-foreground': '24 18% 10%',
      'sidebar-accent': '34 20% 90%',
      'sidebar-accent-foreground': '25 25% 12%',
      'sidebar-border': '34 14% 82%',
      'sidebar-ring': '38 45% 60%',
    },
    editorial: {
      // Runway minimal: stark cream background + ink type + gold highlight
      background: '40 20% 97%',
      foreground: '24 18% 10%',
      card: '40 30% 98%',
      'card-foreground': '24 18% 10%',
      popover: '40 30% 98%',
      'popover-foreground': '24 18% 10%',
      primary: '24 18% 10%',
      'primary-foreground': '40 20% 97%',
      secondary: '40 12% 92%',
      'secondary-foreground': '24 18% 10%',
      muted: '40 10% 93%',
      'muted-foreground': '0 0% 35%',
      accent: '38 45% 60%',
      'accent-foreground': '24 18% 10%',
      border: '40 10% 84%',
      input: '40 10% 84%',
      ring: '24 18% 10%',
      radius: '0.35rem',

      gold: '38 45% 60%',
      'gold-light': '38 55% 78%',
      'gold-dark': '38 40% 46%',
      charcoal: '24 18% 10%',
      'charcoal-light': '24 14% 16%',
      beige: '40 24% 92%',
      'beige-dark': '40 18% 78%',
      cream: '40 20% 97%',

      'shadow-gold': '0 4px 30px hsl(38 45% 60% / 0.12)',
      'shadow-soft': '0 4px 22px hsl(0 0% 0% / 0.08)',
      'shadow-elevated': '0 18px 50px hsl(0 0% 0% / 0.12)',

      'font-display': "'Space Grotesk', sans-serif",
      'font-body': "'Inter', sans-serif",

      'sidebar-background': '40 20% 96%',
      'sidebar-foreground': '0 0% 10%',
      'sidebar-primary': '24 18% 10%',
      'sidebar-primary-foreground': '40 20% 97%',
      'sidebar-accent': '40 12% 92%',
      'sidebar-accent-foreground': '0 0% 10%',
      'sidebar-border': '40 10% 84%',
      'sidebar-ring': '24 18% 10%',
    },
    brutalist: {
      // Street-tech: charcoal base + gold punch + icy accent
      background: '0 0% 6%',
      foreground: '0 0% 98%',
      card: '0 0% 9%',
      'card-foreground': '0 0% 98%',
      popover: '0 0% 9%',
      'popover-foreground': '0 0% 98%',
      primary: '38 45% 60%',
      'primary-foreground': '0 0% 6%',
      secondary: '0 0% 12%',
      'secondary-foreground': '0 0% 98%',
      muted: '0 0% 14%',
      'muted-foreground': '0 0% 70%',
      accent: '195 100% 55%',
      'accent-foreground': '0 0% 6%',
      border: '0 0% 22%',
      input: '0 0% 22%',
      ring: '38 45% 60%',
      radius: '0.1rem',

      gold: '38 45% 60%',
      'gold-light': '38 55% 78%',
      'gold-dark': '38 40% 46%',
      charcoal: '0 0% 8%',
      'charcoal-light': '0 0% 12%',
      beige: '0 0% 92%',
      'beige-dark': '0 0% 80%',
      cream: '0 0% 98%',

      'shadow-gold': '0 0 0 0 hsl(var(--primary) / 0)',
      'shadow-soft': '0 0 0 0 hsl(var(--primary) / 0)',
      'shadow-elevated': '0 0 0 0 hsl(var(--primary) / 0)',

      'font-display': "'Space Grotesk', sans-serif",
      'font-body': "'Space Grotesk', sans-serif",

      'sidebar-background': '0 0% 7%',
      'sidebar-foreground': '0 0% 98%',
      'sidebar-primary': '60 100% 50%',
      'sidebar-primary-foreground': '0 0% 6%',
      'sidebar-accent': '0 0% 12%',
      'sidebar-accent-foreground': '0 0% 98%',
      'sidebar-border': '0 0% 18%',
      'sidebar-ring': '60 100% 50%',
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
