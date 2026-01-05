import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LazyBackgroundProps {
  src: string;
  className?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const LazyBackground = ({
  src,
  className,
  overlayOpacity = 0,
  children,
  style,
}: LazyBackgroundProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView || !src) return;

    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsLoaded(true); // Still show content on error
  }, [isInView, src]);

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)} style={style}>
      {/* Blur placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted animate-pulse"
            style={{
              backdropFilter: 'blur(20px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Actual background */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ 
          opacity: isLoaded ? 1 : 0,
          scale: isLoaded ? 1 : 1.05
        }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: isInView ? `url('${src}')` : undefined,
        }}
      />

      {/* Overlay */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}

      {/* Content */}
      {children}
    </div>
  );
};

interface LazyVideoProps {
  src: string;
  className?: string;
  overlayOpacity?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export const LazyVideo = ({
  src,
  className,
  overlayOpacity = 0,
  children,
  style,
}: LazyVideoProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleVideoLoaded = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', className)} style={style}>
      {/* Blur placeholder */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-gradient-to-br from-muted/80 to-muted animate-pulse"
          />
        )}
      </AnimatePresence>

      {/* Video */}
      {isInView && (
        <motion.video
          ref={videoRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.7 }}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={handleVideoLoaded}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </motion.video>
      )}

      {/* Overlay */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity / 100 }}
        />
      )}

      {/* Content */}
      {children}
    </div>
  );
};
