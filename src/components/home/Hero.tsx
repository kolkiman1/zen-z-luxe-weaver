import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSectionMedia } from '@/hooks/useSectionMedia';

const Hero = () => {
  const { data: sectionMedia } = useSectionMedia();
  const heroMedia = sectionMedia?.hero;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.1]);
  const y = useTransform(scrollY, [0, 400], [0, 100]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden bg-background">
      {/* Background Media with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ scale, y }}
      >
        {heroMedia?.type === 'video' && heroMedia.url ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroMedia.url} type="video/mp4" />
          </video>
        ) : (
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${heroMedia?.url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&q=80'}')`,
              x: mousePosition.x * 0.5,
              y: mousePosition.y * 0.5,
            }}
            transition={{ type: "spring", stiffness: 50, damping: 30 }}
          />
        )}
        
        {/* Dark Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background"
          style={{ opacity: (heroMedia?.overlayOpacity || 75) / 100 }}
        />
        
        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} 
        />
      </motion.div>

      {/* Animated Grid Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute inset-0"
        >
          {/* Vertical lines */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent"
              style={{ left: `${20 + i * 15}%` }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 1.5, ease: "easeOut" }}
            />
          ))}
          {/* Horizontal lines */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
              style={{ top: `${30 + i * 20}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.5 + i * 0.1, duration: 1.5, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 h-full flex items-center"
        style={{ opacity }}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              {/* Eyebrow Text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                className="flex items-center gap-4"
              >
                <div className="h-px w-12 bg-primary" />
                <span className="text-primary font-medium tracking-[0.2em] uppercase text-sm">
                  Est. 2024 — Bangladesh
                </span>
              </motion.div>

              {/* Main Heading */}
              <div className="space-y-2">
                <div className="overflow-hidden">
                  <motion.h1
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                    className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9]"
                  >
                    Gen
                  </motion.h1>
                </div>
                <div className="overflow-hidden flex items-baseline gap-4">
                  <motion.h1
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                    className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] text-gradient-gold"
                  >
                    Zee
                  </motion.h1>
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
                    className="text-gold text-2xl md:text-3xl"
                  >
                    ™
                  </motion.span>
                </div>
              </div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="text-lg md:text-xl text-muted-foreground max-w-md leading-relaxed"
              >
                Where tradition meets contemporary fashion. 
                <span className="text-foreground font-medium"> Premium quality</span>, 
                crafted for the modern generation.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Link to="/category/women">
                  <Button 
                    size="lg" 
                    className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-6 text-base font-medium group"
                  >
                    Shop Women
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/category/men">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="rounded-full px-8 py-6 text-base font-medium border-foreground/30 hover:bg-foreground/10 group"
                  >
                    Shop Men
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="flex gap-8 pt-8 border-t border-border/50"
              >
                {[
                  { value: "10K+", label: "Happy Customers" },
                  { value: "500+", label: "Products" },
                  { value: "4.9", label: "Rating" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + index * 0.1, duration: 0.6 }}
                    className="space-y-1"
                  >
                    <p className="text-2xl md:text-3xl font-bold font-display">{stat.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Right Column - Featured Product Card */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              className="hidden lg:block relative"
            >
              <div 
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-gold/20 backdrop-blur-sm border border-white/10"
                style={{
                  transform: `perspective(1000px) rotateY(${mousePosition.x * 0.3}deg) rotateX(${-mousePosition.y * 0.3}deg)`,
                }}
              >
                {/* Floating Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="absolute top-6 left-6 z-10"
                >
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-gold text-background text-sm font-semibold">
                    New Collection
                  </span>
                </motion.div>

                {/* Decorative Elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-64 h-64 border border-dashed border-primary/30 rounded-full"
                  />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="w-80 h-80 border border-dashed border-gold/20 rounded-full"
                  />
                </div>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                      className="text-6xl font-display font-bold text-foreground/10"
                    >
                      2024
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.4, duration: 0.8 }}
                      className="text-sm uppercase tracking-[0.3em] text-muted-foreground"
                    >
                      Winter Collection
                    </motion.p>
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                {/* Bottom Info */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6, duration: 0.8 }}
                  className="absolute bottom-0 left-0 right-0 p-6"
                >
                  <Link to="/category/new-arrivals" className="group block">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Explore</p>
                        <p className="text-lg font-semibold group-hover:text-primary transition-colors">
                          Latest Arrivals →
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gold/20 blur-2xl"
              />
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer group"
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.div>
      </motion.div>

      {/* Side Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">
          Premium Fashion Since 2024
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;
