import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { ArrowRight, ChevronDown, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSectionMedia } from '@/hooks/useSectionMedia';

const FloatingParticle = ({ delay, duration, size, left, top }: { delay: number; duration: number; size: number; left: string; top: string }) => (
  <motion.div
    className="absolute rounded-full bg-primary/30"
    style={{ width: size, height: size, left, top }}
    animate={{
      y: [-20, 20, -20],
      x: [-10, 10, -10],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.3, 1],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
      delay,
    }}
  />
);

const GlowOrb = ({ color, size, position, animationDelay }: { color: string; size: string; position: string; animationDelay: number }) => (
  <motion.div
    className={`absolute ${size} ${position} rounded-full blur-3xl pointer-events-none`}
    style={{ background: color }}
    animate={{
      scale: [1, 1.3, 1],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
      delay: animationDelay,
    }}
  />
);

const AnimatedText = ({ text, delay, className }: { text: string; delay: number; className?: string }) => (
  <span className={className}>
    {text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0, y: 50, rotateX: -90 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          delay: delay + i * 0.03,
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="inline-block"
        style={{ transformOrigin: 'bottom' }}
      >
        {char === ' ' ? '\u00A0' : char}
      </motion.span>
    ))}
  </span>
);

const Hero = () => {
  const { data: sectionMedia } = useSectionMedia();
  const heroMedia = sectionMedia?.hero;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.15]);
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX / innerWidth - 0.5) * 40);
      mouseY.set((clientY / innerHeight - 0.5) * 40);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const categories = [
    { name: "Women", href: "/category/women", color: "from-rose-500/20 to-pink-500/20" },
    { name: "Men", href: "/category/men", color: "from-blue-500/20 to-indigo-500/20" },
    { name: "Accessories", href: "/category/accessories", color: "from-amber-500/20 to-orange-500/20" },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-background"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Media with Advanced Parallax */}
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
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url('${heroMedia?.url || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&q=80'}')`,
              x: smoothMouseX,
              y: smoothMouseY,
            }}
          />
        )}
        
        {/* Multi-layer Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `
              radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, hsl(var(--gold) / 0.1) 0%, transparent 50%),
              linear-gradient(180deg, hsl(var(--background) / 0.7) 0%, hsl(var(--background) / 0.4) 50%, hsl(var(--background) / 0.95) 100%)
            `,
            opacity: (heroMedia?.overlayOpacity || 75) / 100 
          }}
        />
        
        {/* Animated Noise Texture */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay animate-pulse" 
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            animationDuration: '8s'
          }} 
        />
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 0.3}
            duration={4 + Math.random() * 3}
            size={4 + Math.random() * 6}
            left={`${5 + i * 8}%`}
            top={`${10 + (i % 4) * 22}%`}
          />
        ))}
      </div>

      {/* Glow Orbs */}
      <GlowOrb color="hsl(var(--primary) / 0.2)" size="w-96 h-96" position="top-0 -left-48" animationDelay={0} />
      <GlowOrb color="hsl(var(--gold) / 0.15)" size="w-80 h-80" position="bottom-20 -right-40" animationDelay={1.5} />
      <GlowOrb color="hsl(var(--primary) / 0.1)" size="w-64 h-64" position="top-1/2 left-1/3" animationDelay={3} />

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.06 }}
          transition={{ delay: 1, duration: 2 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Scanning Line Effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none"
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Main Content */}
      <motion.div 
        className="relative z-10 min-h-screen flex items-center"
        style={{ opacity, y: textY }}
      >
        <div className="container mx-auto px-6 lg:px-12 py-20">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="lg:col-span-7 space-y-8">
              {/* Animated Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex"
              >
                <span className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm overflow-hidden group cursor-pointer">
                  {/* Shimmer effect */}
                  <motion.span
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.3), transparent)',
                    }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
                  />
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-4 h-4 text-gold" />
                  </motion.span>
                  <span className="relative text-sm font-medium tracking-wide">
                    <span className="text-primary">Bangladesh's</span>
                    <span className="text-gold font-bold ml-1">Biggest</span>
                    <span className="text-muted-foreground ml-1">Fashion Destination</span>
                  </span>
                </span>
              </motion.div>

              {/* Main Heading with Character Animation */}
              <div className="space-y-2">
                <div className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  >
                    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter leading-[0.85]">
                      <AnimatedText text="Redefine" delay={0.5} />
                    </h1>
                  </motion.div>
                </div>
                <div className="overflow-hidden flex items-end gap-4">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  >
                    <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tighter leading-[0.85]">
                      <span className="relative">
                        <span className="text-gradient-gold">
                          <AnimatedText text="Your Style" delay={0.7} />
                        </span>
                        {/* Animated underline */}
                        <motion.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
                          className="absolute -bottom-2 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r from-gold via-gold-light to-gold origin-left"
                        />
                      </span>
                    </h1>
                  </motion.div>
                </div>
              </div>

              {/* Tagline with Stagger */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-xl leading-relaxed"
              >
                Curated collections that blend 
                <motion.span 
                  className="text-foreground font-semibold mx-1"
                  animate={{ color: ['hsl(var(--foreground))', 'hsl(var(--primary))', 'hsl(var(--foreground))'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  tradition
                </motion.span>
                with contemporary elegance for the modern generation.
              </motion.p>

              {/* Category Pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex flex-wrap gap-3"
              >
                {categories.map((cat, i) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.3 + i * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      to={cat.href}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r ${cat.color} border border-white/10 backdrop-blur-sm text-sm font-medium hover:border-white/20 transition-colors`}
                    >
                      {cat.name}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Link to="/category/new-arrivals">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group"
                  >
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-gold to-primary rounded-full opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-500" />
                    <Button 
                      size="lg" 
                      className="relative bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 py-6 text-base font-semibold overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current" />
                        Explore Collection
                      </span>
                      {/* Button shimmer */}
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                      />
                    </Button>
                  </motion.div>
                </Link>
                <Link to="/about">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="rounded-full px-8 py-6 text-base font-semibold border-foreground/20 hover:bg-foreground/5 hover:border-foreground/40 transition-all duration-300"
                    >
                      Our Story
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </div>

            {/* Right Column - Interactive 3D Card */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              className="lg:col-span-5 hidden lg:block relative"
            >
              <motion.div 
                className="relative aspect-[4/5] rounded-3xl overflow-hidden"
                style={{
                  rotateY: useTransform(smoothMouseX, [-20, 20], [5, -5]),
                  rotateX: useTransform(smoothMouseY, [-20, 20], [-5, 5]),
                  transformStyle: 'preserve-3d',
                  perspective: 1000,
                }}
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background/50 to-gold/10 backdrop-blur-xl border border-white/10" />
                
                {/* Animated Rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute border border-primary/20 rounded-full"
                      style={{ width: `${50 + i * 25}%`, height: `${50 + i * 25}%` }}
                      animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                      transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
                    />
                  ))}
                </div>

                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-8 right-8 z-20"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-background text-sm font-bold shadow-lg shadow-gold/30">
                    <Sparkles className="w-4 h-4" />
                    New Season
                  </span>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.6, duration: 0.6 }}
                  className="absolute bottom-24 left-6 z-20"
                >
                  <div className="bg-background/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
                    <p className="text-3xl font-bold font-display">500+</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Products</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="absolute top-1/3 right-6 z-20"
                >
                  <div className="bg-background/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
                    <p className="text-3xl font-bold font-display text-gold">4.9★</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Rating</p>
                  </div>
                </motion.div>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8, type: "spring" }}
                    className="space-y-4"
                  >
                    <p className="text-7xl font-display font-bold text-foreground/10">GZ</p>
                    <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto" />
                    <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">
                      Premium Fashion
                    </p>
                  </motion.div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
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

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-primary/30 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-gold/30 rounded-br-3xl" />
              </motion.div>

              {/* Floating Orbs around card */}
              <motion.div
                animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold/20 blur-3xl"
              />
              <motion.div
                animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/5 bg-background/30 backdrop-blur-md"
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between py-4">
            <div className="hidden md:flex items-center gap-8">
              {[
                { value: "10K+", label: "Happy Customers" },
                { value: "24/7", label: "Support" },
                { value: "Free", label: "Shipping 1000+" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 + i * 0.1, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xl font-bold font-display">{stat.value}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                  {i < 2 && <span className="w-px h-6 bg-border ml-4" />}
                </motion.div>
              ))}
            </div>
            
            {/* Scroll Indicator */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer group ml-auto"
              onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                Scroll to explore
              </span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Side Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="hidden xl:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4"
      >
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl] rotate-180">
          Est. 2024
        </p>
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
        className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4"
      >
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground [writing-mode:vertical-rl]">
          Gen Zee™
        </p>
        <div className="w-px h-20 bg-gradient-to-b from-transparent via-gold/50 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
