import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight, ChevronDown, Play, Sparkles, Star, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LazyBackground, LazyVideo } from '@/components/ui/lazy-background';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { useHeroContent, defaultHeroContent } from '@/hooks/useHeroContent';

// Floating particle component
const FloatingParticle = ({ delay, duration, size, left, top }: { 
  delay: number; 
  duration: number; 
  size: number; 
  left: string; 
  top: string 
}) => (
  <motion.div
    className="absolute rounded-full bg-primary/20 blur-sm will-change-transform"
    style={{ width: size, height: size, left, top }}
    animate={{
      y: [-30, 30, -30],
      x: [-10, 10, -10],
      opacity: [0.2, 0.5, 0.2],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

// Animated stat card component
const StatCard = ({ value, label, icon: Icon, delay }: { 
  value: string; 
  label: string; 
  icon: React.ElementType;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl p-4 hover:border-primary/30 transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold font-display">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </motion.div>
);

const Hero = () => {
  const { data: sectionMedia } = useSectionMedia();
  const { data: heroContent } = useHeroContent();
  const content = heroContent || defaultHeroContent;
  const heroMedia = sectionMedia?.hero;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 30, damping: 30 });
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const bgY = useTransform(scrollY, [0, 500], [0, 50]);
  const textY = useTransform(scrollY, [0, 300], [0, -30]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth - 0.5) * 20);
      mouseY.set((clientY / innerHeight - 0.5) * 20);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isMounted]);

  const categories = useMemo(() => 
    content.categories.filter(c => c.enabled).map(cat => ({
      name: cat.name,
      href: cat.href,
      color: `from-${cat.colorFrom} to-${cat.colorTo}`,
    })), [content.categories]);

  const particles = useMemo(() => 
    [...Array(8)].map((_, i) => ({
      key: i,
      delay: i * 0.4,
      duration: 6 + (i % 4),
      size: 6 + (i % 4) * 3,
      left: `${8 + i * 12}%`,
      top: `${10 + (i % 4) * 20}%`,
    })), []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-background"
    >
      {/* Background Media with enhanced Lazy Loading */}
      {heroMedia?.type === 'video' && heroMedia.url ? (
        <LazyVideo
          src={heroMedia.url}
          className="absolute inset-0"
          overlayOpacity={0}
        >
          <motion.div 
            className="absolute inset-0 z-10"
            style={isMounted ? { y: bgY } : undefined}
          >
            <div 
              className="absolute inset-0"
              style={{ 
                background: `
                  radial-gradient(ellipse at 20% 10%, hsl(var(--primary) / 0.2) 0%, transparent 40%),
                  radial-gradient(ellipse at 80% 90%, hsl(var(--gold) / 0.15) 0%, transparent 40%),
                  radial-gradient(ellipse at 50% 50%, hsl(var(--background) / 0.3) 0%, transparent 70%),
                  linear-gradient(180deg, hsl(var(--background) / 0.6) 0%, hsl(var(--background) / 0.3) 40%, hsl(var(--background) / 0.9) 100%)
                `,
                opacity: (heroMedia?.overlayOpacity || 75) / 100 
              }}
            />
          </motion.div>
        </LazyVideo>
      ) : (
        <LazyBackground
          src={heroMedia?.url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&q=80'}
          className="absolute inset-0"
          overlayOpacity={0}
        >
          <motion.div 
            className="absolute inset-0 z-10"
            style={isMounted ? { y: bgY } : undefined}
          >
            <div 
              className="absolute inset-0"
              style={{ 
                background: `
                  radial-gradient(ellipse at 20% 10%, hsl(var(--primary) / 0.2) 0%, transparent 40%),
                  radial-gradient(ellipse at 80% 90%, hsl(var(--gold) / 0.15) 0%, transparent 40%),
                  radial-gradient(ellipse at 50% 50%, hsl(var(--background) / 0.3) 0%, transparent 70%),
                  linear-gradient(180deg, hsl(var(--background) / 0.6) 0%, hsl(var(--background) / 0.3) 40%, hsl(var(--background) / 0.9) 100%)
                `,
                opacity: (heroMedia?.overlayOpacity || 75) / 100 
              }}
            />
          </motion.div>
        </LazyBackground>
      )}

      {/* Animated Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <FloatingParticle key={p.key} {...p} />
        ))}
      </div>

      {/* Glow Orbs */}
      <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-gold/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="h-full w-full" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 min-h-screen flex items-center"
        style={isMounted ? { opacity, y: textY } : undefined}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="lg:col-span-7 space-y-6 lg:space-y-8">
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <span className="relative inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors">
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-gold" />
                  </motion.span>
                  <span className="relative text-xs sm:text-sm font-medium tracking-wide">
                    <span className="text-primary">{content.badgePrefix}</span>
                    <span className="text-gold font-bold ml-1">{content.badgeHighlight}</span>
                    <span className="text-muted-foreground ml-1">{content.badgeSuffix}</span>
                  </span>
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  />
                </span>
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-1 sm:space-y-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.9]">
                    {content.headingLine1}
                  </h1>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-[0.9]">
                    <span className="relative inline-block">
                      <span className="text-gradient-gold">{content.headingLine2}</span>
                      <motion.span
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                        className="absolute -bottom-1 sm:-bottom-2 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-r from-gold via-gold-light to-gold origin-left"
                      />
                    </span>
                  </h1>
                </motion.div>
              </div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
              >
                {content.description}
              </motion.p>

              {/* Category Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap gap-2 sm:gap-3"
              >
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1, duration: 0.4 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to={cat.href}
                      className={`inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r ${cat.color} border border-primary/10 backdrop-blur-sm text-xs sm:text-sm font-medium hover:border-primary/30 transition-all duration-300 shadow-lg shadow-background/50`}
                    >
                      {cat.name}
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4"
              >
                <Link to={content.primaryButtonLink}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-gold to-primary rounded-full opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500" />
                    <Button 
                      size="lg" 
                      className="relative bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold shadow-xl"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" />
                        {content.primaryButtonText}
                      </span>
                    </Button>
                  </motion.div>
                </Link>
                <Link to={content.secondaryButtonLink}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-semibold border-foreground/20 hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-300"
                    >
                      {content.secondaryButtonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Stats & Visual Elements */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="lg:col-span-5 hidden lg:block relative"
            >
              <div className="relative">
                {/* Decorative card */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-border/50 bg-gradient-to-br from-card/80 via-card/40 to-transparent backdrop-blur-xl">
                  {/* Animated rings */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute border border-primary/10 rounded-full"
                        style={{ width: `${40 + i * 25}%`, height: `${40 + i * 25}%` }}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                        transition={{ duration: 40 + i * 20, repeat: Infinity, ease: "linear" }}
                      />
                    ))}
                  </div>

                  {/* Floating badge */}
                  <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-6 right-6 z-20"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-background text-sm font-bold shadow-lg shadow-gold/30">
                      <Sparkles className="w-4 h-4" />
                      New Season
                    </span>
                  </motion.div>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.6, type: "spring" }}
                      className="space-y-4"
                    >
                      <p className="text-8xl font-display font-bold text-foreground/5">GZ</p>
                      <div className="w-20 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
                      <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                        Premium Fashion
                      </p>
                    </motion.div>
                  </div>

                  {/* Bottom CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/90 to-transparent"
                  >
                    <Link to="/category/new-arrivals" className="group flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Discover</p>
                        <p className="text-lg font-semibold group-hover:text-primary transition-colors">
                          Winter 2024 Collection
                        </p>
                      </div>
                      <motion.div
                        whileHover={{ x: 5 }}
                        className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </Link>
                  </motion.div>

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/30 rounded-tl-3xl" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-gold/30 rounded-br-3xl" />
                </div>

                {/* Floating stat cards */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -left-6 top-1/4 z-20"
                >
                  <StatCard value="500+" label="Products" icon={TrendingUp} delay={1} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                  className="absolute -right-6 top-1/2 z-20"
                >
                  <StatCard value="4.9★" label="Rating" icon={Star} delay={1.1} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="absolute -left-4 bottom-24 z-20"
                >
                  <StatCard value="10K+" label="Customers" icon={Award} delay={1.2} />
                </motion.div>

                {/* Glow effects */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold/20 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-border/50 bg-background/40 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {[
                { value: "10K+", label: "Happy Customers" },
                { value: "24/7", label: "Support" },
                { value: "Free", label: "Shipping 1000+" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-2 lg:gap-3"
                >
                  <span className="text-lg lg:text-xl font-bold font-display">{stat.value}</span>
                  <span className="text-[10px] lg:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  {i < 2 && <span className="w-px h-5 lg:h-6 bg-border ml-3 lg:ml-4" />}
                </motion.div>
              ))}
            </div>
            
            {/* Scroll Indicator */}
            <motion.div
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group ml-auto"
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                Scroll to explore
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Side Text Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="hidden xl:flex absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4"
      >
        <div className="w-px h-16 lg:h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <p className="text-[10px] lg:text-xs uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">
          Est. 2024
        </p>
        <div className="w-px h-16 lg:h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="hidden xl:flex absolute right-6 lg:right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4"
      >
        <div className="w-px h-16 lg:h-20 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
        <p className="text-[10px] lg:text-xs uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl]">
          Gen Zee™
        </p>
        <div className="w-px h-16 lg:h-20 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
