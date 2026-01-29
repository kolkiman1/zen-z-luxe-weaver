import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroContent, defaultHeroContent } from '@/hooks/useHeroContent';

const HeroBrutalist = () => {
  const { data: heroContent } = useHeroContent();
  const content = heroContent || defaultHeroContent;

  return (
    <header className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="hero-overlay-tech" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px), linear-gradient(hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            opacity: 0.25,
          }}
        />
        <div className="absolute -top-24 -left-24 h-80 w-80 bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 bg-accent/20 blur-3xl" />
      </div>

      <div className="relative z-10 container-luxury pt-28 md:pt-32 pb-16">
        <div className="min-h-[calc(100vh-11rem)] flex items-center">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 border-2 border-border surface-plate surface-motion px-4 py-2"
            >
              <span className="text-xs tracking-[0.35em] uppercase text-chrome">DROP</span>
              <span className="h-4 w-px bg-border" />
              <span className="text-xs text-muted-foreground tracking-[0.25em] uppercase">Bangladesh Y2K chrome</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 font-body text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[0.9] tracking-tight"
            >
              <span className="block">{content.headingLine1}</span>
              <span className="block mt-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 inline-block">{content.headingLine2}</span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground"
            >
              {content.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link to={content.primaryButtonLink}>
                <Button className="btn-primary rounded-none h-12 px-8">
                  {content.primaryButtonText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to={content.secondaryButtonLink}>
                <Button variant="outline" className="rounded-none h-12 px-8">
                  {content.secondaryButtonText}
                </Button>
              </Link>
            </motion.div>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
              {['NOISE', 'GRID', 'TYPE', 'IMPACT'].map((t) => (
                <div key={t} className="border border-border bg-card p-4">
                  <p className="text-xs tracking-[0.35em] uppercase text-muted-foreground">{t}</p>
                  <div className="mt-3 h-2 bg-primary/20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeroBrutalist;
