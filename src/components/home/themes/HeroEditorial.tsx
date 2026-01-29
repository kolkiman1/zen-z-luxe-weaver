import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LazyBackground } from '@/components/ui/lazy-background';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { useHeroContent, defaultHeroContent } from '@/hooks/useHeroContent';

const HeroEditorial = () => {
  const { data: sectionMedia } = useSectionMedia();
  const { data: heroContent } = useHeroContent();
  const content = heroContent || defaultHeroContent;
  const heroMedia = sectionMedia?.hero;

  return (
    <header className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0">
        <LazyBackground
          src={heroMedia?.url || 'https://images.unsplash.com/photo-1520975687961-9f0f5f6d6c2f?w=1920&q=80'}
          className="absolute inset-0"
          overlayOpacity={70}
        />
      </div>

      <div className="relative z-10 container-luxury min-h-screen pt-28 md:pt-32 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-end min-h-[calc(100vh-11rem)]">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs tracking-[0.35em] uppercase text-muted-foreground"
            >
              {content.badgePrefix} {content.badgeHighlight}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-4 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.92]"
            >
              <span className="block">{content.headingLine1}</span>
              <span className="block mt-2 text-gradient-gold">{content.headingLine2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to={content.primaryButtonLink}>
                <Button className="btn-primary rounded-full px-7 h-12">
                  {content.primaryButtonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to={content.secondaryButtonLink}>
                <Button variant="outline" className="rounded-full px-7 h-12">
                  {content.secondaryButtonText}
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="glass rounded-2xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground">Curated</p>
                <span className="inline-flex items-center rounded-full border border-border/50 px-3 py-1 text-xs text-muted-foreground">
                  2026 Edition
                </span>
              </div>
              <p className="mt-4 font-display text-2xl md:text-3xl leading-tight">
                A runway-first collection built for everyday Bangladesh.
              </p>
              <div className="mt-6 h-px bg-border/60" />
              <p className="mt-6 text-sm text-muted-foreground">
                Premium fabric, precise tailoring, and statement silhouettes.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroEditorial;
