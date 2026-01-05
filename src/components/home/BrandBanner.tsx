import { useCallback, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatedButton } from '@/components/ui/animated-button';
import { LazyBackground, LazyVideo } from '@/components/ui/lazy-background';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { useSectionContent } from '@/hooks/useSectionContent';

const BrandBanner = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollTargetEl, setScrollTargetEl] = useState<HTMLElement | null>(null);
  const { data: sectionMedia } = useSectionMedia();
  const { data: sectionContent } = useSectionContent();
  const brandBannerMedia = sectionMedia?.brandBanner;
  const content = sectionContent?.brandBanner;

  const setSectionRef = useCallback((node: HTMLElement | null) => {
    sectionRef.current = node;
    setScrollTargetEl(node);
  }, []);

  const scrollTarget = useMemo(
    () =>
      scrollTargetEl
        ? ({ current: scrollTargetEl } as React.RefObject<HTMLElement>)
        : undefined,
    [scrollTargetEl]
  );

  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.15, 1.2]);

  return (
    <section ref={setSectionRef} className="relative py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
      {/* Background with Lazy Loading */}
      <div className="absolute inset-0 overflow-hidden">
        {brandBannerMedia?.type === 'video' && brandBannerMedia.url ? (
          <LazyVideo
            src={brandBannerMedia.url}
            className="absolute inset-0 -top-[20%] -bottom-[20%]"
            overlayOpacity={brandBannerMedia?.overlayOpacity || 85}
          />
        ) : (
          <LazyBackground
            src={brandBannerMedia?.url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&q=80"}
            className="absolute inset-0 -top-[20%] -bottom-[20%]"
            overlayOpacity={brandBannerMedia?.overlayOpacity || 85}
          />
        )}
      </div>

      {/* Content */}
      <div className="container-luxury relative z-10">
        <div className="max-w-3xl mx-auto text-center px-2">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary tracking-[0.2em] sm:tracking-[0.3em] uppercase text-xs sm:text-sm mb-3 sm:mb-4"
          >
            {content?.tagline || 'The Gen-Zee Promise'}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6"
          >
            {content?.headline || 'Crafted with Passion,'}
            <br />
            <span className="text-gradient-gold">{content?.headlineHighlight || 'Designed for You'}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-foreground/70 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-10 leading-relaxed"
          >
            {content?.description || 'We believe luxury should be accessible. Every piece in our collection is carefully curated to bring you premium quality, timeless design, and exceptional value. Experience the difference of true craftsmanship.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            <Link to="/about" className="w-full sm:w-auto">
              <AnimatedButton 
                className="btn-primary w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base"
                glowColor="primary"
                showArrow
              >
                Our Story
              </AnimatedButton>
            </Link>
            <Link to="/category/all" className="w-full sm:w-auto">
              <AnimatedButton 
                variant="outline" 
                className="btn-outline-gold w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base"
                glowColor="gold"
                showArrow
              >
                Explore Collection
              </AnimatedButton>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3 }}
        viewport={{ once: true }}
        className="absolute top-0 left-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-radial from-primary/20 via-transparent to-transparent pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.3 }}
        viewport={{ once: true }}
        className="absolute bottom-0 right-0 w-48 sm:w-64 md:w-80 lg:w-96 h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-radial from-primary/20 via-transparent to-transparent pointer-events-none"
      />
    </section>
  );
};

export default BrandBanner;
