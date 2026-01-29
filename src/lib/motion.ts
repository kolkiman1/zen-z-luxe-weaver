import type { Transition, Variants } from 'framer-motion';
import type { ThemeId } from '@/hooks/useThemeSettings';

type MotionPreset = {
  variants: Variants;
  transition: Transition;
};

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Theme-aware page transition presets.
// Note: We keep values numeric so Framer Motion can interpolate efficiently.
export const getThemePageMotion = (theme: ThemeId): MotionPreset => {
  switch (theme) {
    case 'brutalist':
      return {
        variants: {
          initial: { opacity: 0, x: 18 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -18 },
        },
        transition: { duration: 0.22, ease: EASE_OUT },
      };
    case 'artisan':
      return {
        variants: {
          initial: { opacity: 0, y: 14, scale: 0.99 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -10, scale: 0.99 },
        },
        transition: { duration: 0.32, ease: EASE_OUT },
      };
    case 'editorial':
    default:
      return {
        variants: {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -8 },
        },
        transition: { duration: 0.26, ease: EASE_OUT },
      };
  }
};
