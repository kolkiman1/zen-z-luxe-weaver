import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LazyBackground } from '@/components/ui/lazy-background';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { useHeroContent, defaultHeroContent } from '@/hooks/useHeroContent';

const HeroArtisan = () => {
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
          overlayOpacity={82}
        />
      </div>

      {/* soft texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, hsl(var(--accent) / 0.9) 0%, transparent 50%), radial-gradient(circle at 80% 70%, hsl(var(--primary) / 0.6) 0%, transparent 55%)',
        }}
      />

      <div className="relative z-10 container-luxury min-h-screen pt-28 md:pt-32 pb-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[calc(100vh-11rem)]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs tracking-[0.22em] uppercase text-muted-foreground">Handpicked drops</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
              {content.headingLine1}{' '}
              <span className="text-gradient-gold">{content.headingLine2}</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
              {content.description}
            </p>

            <div className="flex flex-wrap gap-3">
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
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-border/60 bg-card/70 backdrop-blur overflow-hidden">
              <div className="p-6 md:p-8">
                <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground">Boutique notes</p>
                <p className="mt-4 font-display text-2xl md:text-3xl leading-tight">
                  Soft drape, rich texture, and heritage silhouettes.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {['Craft', 'Fit', 'Finish'].map((k) => (
                    <div key={k} className="rounded-xl bg-secondary/30 border border-border/50 p-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-[0.25em]">{k}</p>
                      <p className="mt-2 text-sm">Premium</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-20 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default HeroArtisan;
