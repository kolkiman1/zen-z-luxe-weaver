import { useCallback, useMemo, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePerformanceOptional } from '@/contexts/PerformanceContext';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // -1 to 1, negative = slower, positive = faster
  direction?: 'up' | 'down';
  fadeIn?: boolean;
  scale?: boolean;
}

const ParallaxSection = ({
  children,
  className,
  speed = 0.2,
  direction = 'up',
  fadeIn = true,
  scale = false,
}: ParallaxSectionProps) => {
  const performance = usePerformanceOptional();
  const isPerformanceMode = performance?.settings?.disableParallax ?? false;
  const [targetEl, setTargetEl] = useState<HTMLDivElement | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    setTargetEl(node);
  }, []);

  const target = useMemo(
    () =>
      targetEl
        ? ({ current: targetEl } as React.RefObject<HTMLDivElement>)
        : undefined,
    [targetEl]
  );

  const { scrollYProgress } = useScroll({
    target,
    offset: ['start end', 'end start'],
  });

  const enabled = Boolean(targetEl) && !isPerformanceMode;

  const yValue = direction === 'up' ? speed * 100 : -speed * 100;
  const y = useTransform(scrollYProgress, [0, 1], [yValue, -yValue]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);
  const scaleValue = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  // Performance mode: just render children without effects
  if (isPerformanceMode) {
    return <div className={cn('relative', className)}>{children}</div>;
  }

  return (
    <motion.div
      ref={setRef}
      style={{
        y: enabled && speed !== 0 ? y : 0,
        opacity: enabled && fadeIn ? opacity : 1,
        scale: enabled && scale ? scaleValue : 1,
      }}
      className={cn('relative', className)}
    >
      {children}
    </motion.div>
  );
};

interface ParallaxBackgroundProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}

const ParallaxBackground = ({
  children,
  className,
  speed = 0.3,
}: ParallaxBackgroundProps) => {
  const [targetEl, setTargetEl] = useState<HTMLDivElement | null>(null);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    setTargetEl(node);
  }, []);

  const target = useMemo(
    () =>
      targetEl
        ? ({ current: targetEl } as React.RefObject<HTMLDivElement>)
        : undefined,
    [targetEl]
  );

  const { scrollYProgress } = useScroll({
    target,
    offset: ['start end', 'end start'],
  });

  const enabled = Boolean(targetEl);
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 50}%`, `-${speed * 50}%`]);

  return (
    <div ref={setRef} className={cn('relative overflow-hidden', className)}>
      <motion.div
        style={{ y: enabled ? y : 0 }}
        className="absolute inset-0 -top-[20%] -bottom-[20%]"
      >
        {children}
      </motion.div>
    </div>
  );
};

export { ParallaxSection, ParallaxBackground };
