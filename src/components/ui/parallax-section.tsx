import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const ref = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: isMounted ? ref : undefined,
    offset: ["start end", "end start"]
  });

  const yValue = direction === 'up' ? speed * 100 : -speed * 100;
  const y = useTransform(scrollYProgress, [0, 1], [yValue, -yValue]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);
  const scaleValue = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  return (
    <motion.div
      ref={ref}
      style={{
        y: isMounted && speed !== 0 ? y : 0,
        opacity: isMounted && fadeIn ? opacity : 1,
        scale: isMounted && scale ? scaleValue : 1,
      }}
      className={cn("relative", className)}
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
  const ref = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const { scrollYProgress } = useScroll({
    target: isMounted ? ref : undefined,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 50}%`, `-${speed * 50}%`]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        style={{ y: isMounted ? y : 0 }}
        className="absolute inset-0 -top-[20%] -bottom-[20%]"
      >
        {children}
      </motion.div>
    </div>
  );
};

export { ParallaxSection, ParallaxBackground };
