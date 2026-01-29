import type { ReactNode } from 'react';
import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { usePerformanceOptional } from '@/contexts/PerformanceContext';
import { getThemePageMotion } from '@/lib/motion';

type PageTransitionProps = {
  children: ReactNode;
};

const PageTransition = ({ children }: PageTransitionProps) => {
  const reducedMotion = useReducedMotion();
  const performance = usePerformanceOptional();
  const { activeTheme } = useTheme();

  const disableAnimations = Boolean(
    reducedMotion ||
      performance?.settings?.disableAnimations ||
      performance?.settings?.reducedMotion ||
      performance?.isPerformanceMode,
  );

  if (disableAnimations) return <>{children}</>;

  const preset = getThemePageMotion(activeTheme);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={preset.variants}
      transition={preset.transition}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

export default memo(PageTransition);
