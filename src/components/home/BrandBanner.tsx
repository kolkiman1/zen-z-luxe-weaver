import { useCallback, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimatedButton } from '@/components/ui/animated-button';
import { LazyBackground, LazyVideo } from '@/components/ui/lazy-background';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { useSectionContent } from '@/hooks/useSectionContent';
import SectionHeader from '@/components/home/SectionHeader';

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
        <div className="max-w-3xl mx-auto px-2">
          <div className="surface-float surface-motion surface-hover rounded-3xl px-5 sm:px-8 md:px-10 py-10 sm:py-12 text-center">
            <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <SectionHeader
                align="center"
                tagline={content?.tagline || 'The Zen Zee Promise'}
                headline={<>{content?.headline || 'Crafted with Passion,'}<br /></>}
                headlineHighlight={content?.headlineHighlight || 'Designed for You'}
                description={
                  content?.description ||
                  'We believe luxury should be accessible. Every piece in our collection is carefully curated to bring you premium quality, timeless design, and exceptional value. Experience the difference of true craftsmanship.'
                }
                actions={
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                    <Link to="/about" className="w-full sm:w-auto">
                      <AnimatedButton className="btn-primary w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base" glowColor="primary" showArrow>
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
                  </div>
                }
              />
            </motion.div>
          </div>
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
