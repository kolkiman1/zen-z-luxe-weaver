import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const useTypewriter = (text: string, speed: number = 50, delay: number = 0) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let currentIndex = 0;

    const startTyping = () => {
      timeout = setTimeout(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
          startTyping();
        } else {
          setIsComplete(true);
        }
      }, currentIndex === 0 ? delay : speed);
    };

    startTyping();

    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { displayedText, isComplete };
};

const TypewriterTagline = () => {
  const taglineText = "Premium Fashion for the Next Generation";
  const { displayedText, isComplete } = useTypewriter(taglineText, 45, 400);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.3 }}
      className="mb-3 md:mb-4 h-6 md:h-7"
    >
      <p className="text-primary font-body text-xs sm:text-sm md:text-base tracking-[0.2em] md:tracking-[0.3em] uppercase">
        {displayedText}
        <motion.span
          animate={{ opacity: isComplete ? 0 : [1, 0, 1] }}
          transition={{ 
            duration: 0.8, 
            repeat: isComplete ? 0 : Infinity,
            ease: "linear"
          }}
          className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle"
        />
      </p>
    </motion.div>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Background Image with Ken Burns zoom effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ 
            opacity: 1, 
            scale: [1, 1.08, 1.12, 1.08, 1],
          }}
          transition={{ 
            opacity: { duration: 1.2, ease: 'easeOut' },
            scale: { 
              duration: 25, 
              ease: 'linear',
              repeat: Infinity,
              repeatType: 'reverse',
            }
          }}
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&q=80')`,
            backgroundPosition: 'center top',
            transform: 'translateZ(0)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Animated Glow Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gold/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Content */}
      <div className="container-luxury relative z-10 pt-20 md:pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          {/* Badge with animated text, glow, and shimmer */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 mb-6 md:mb-8"
          >
            <motion.span 
              className="relative px-4 py-2 md:px-6 md:py-3 bg-primary/10 border border-primary/30 rounded-full text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-wide flex items-center gap-2 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Glow pulse background */}
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/5"
                animate={{
                  boxShadow: [
                    "0 0 10px hsl(var(--primary) / 0.1), inset 0 0 10px hsl(var(--primary) / 0.05)",
                    "0 0 25px hsl(var(--primary) / 0.25), inset 0 0 20px hsl(var(--primary) / 0.1)",
                    "0 0 10px hsl(var(--primary) / 0.1), inset 0 0 10px hsl(var(--primary) / 0.05)"
                  ],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Continuous shimmer sweep */}
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent 0%, hsl(var(--gold) / 0.3) 50%, transparent 100%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{
                  backgroundPosition: ["200% 0%", "-200% 0%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.span
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Sparkles size={18} className="text-gold" />
              </motion.span>
              {/* Text with emphasized "Biggest" only */}
              <span className="relative z-10">
                <span 
                  className="relative inline-flex"
                  style={{
                    background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, hsl(var(--gold)) 50%, hsl(var(--primary)) 60%, hsl(var(--primary)) 100%)",
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    animation: "shimmer 3s linear infinite",
                  }}
                >
                  {"Bangladesh's ".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.4 + index * 0.025,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="inline-block"
                      style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
                {/* Biggest - Pure white with glow effect */}
                <motion.span
                  className="relative font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  animate={{
                    textShadow: [
                      "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)",
                      "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(255,255,255,0.5)",
                      "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {"Biggest".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.4 + 13 * 0.025 + index * 0.03,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.span>
                {/* Trendy Fashion Shop - Regular shimmer */}
                <span 
                  className="relative inline-flex"
                  style={{
                    background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--primary)) 40%, hsl(var(--gold)) 50%, hsl(var(--primary)) 60%, hsl(var(--primary)) 100%)",
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    animation: "shimmer 3s linear infinite",
                  }}
                >
                  {" Trendy Fashion Shop".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.4 + 20 * 0.025 + index * 0.025,
                        duration: 0.4,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="inline-block"
                      style={{ whiteSpace: char === " " ? "pre" : "normal" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </span>
            </motion.span>
          </motion.div>

          {/* Tagline with typewriter effect */}
          <TypewriterTagline />

          {/* Main Heading with staggered word animation */}
          <div className="mb-6 md:mb-10 overflow-hidden mt-4 md:mt-6">
            <motion.h1
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold leading-tight"
            >
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  Elevate Your
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.65, duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                  className="block relative"
                >
                  <span className="text-gradient-gold relative">
                    Signature Style
                    {/* Animated underline */}
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                      className="absolute -bottom-1 left-0 right-0 h-[2px] md:h-[3px] bg-gradient-to-r from-gold via-gold-light to-gold origin-left"
                    />
                  </span>
                </motion.span>
              </span>
            </motion.h1>
          </div>

          {/* Description with fade and blur effect */}
          <motion.p
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
            className="text-foreground/70 text-sm sm:text-base md:text-lg max-w-lg mb-8 md:mb-12 leading-relaxed"
          >
            Discover curated luxury fashion, exquisite jewelry, and premium accessories
            designed for the modern Bangladeshi.
          </motion.p>

          {/* CTA Buttons with glow effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Link to="/category/women" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                {/* Glow effect behind button */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-primary/50 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                />
                <Button className="btn-primary relative w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base gap-2 group overflow-hidden">
                  {/* Shimmer effect on hover */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="relative z-10">Shop Women</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <Link to="/category/men" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="relative group"
              >
                {/* Glow effect behind button */}
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gold/40 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"
                />
                <Button variant="outline" className="btn-outline-gold relative w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base overflow-hidden group">
                  {/* Border glow animation */}
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 20px hsl(var(--gold) / 0.3)' }} />
                  {/* Shimmer effect on hover */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
                  <span className="relative z-10 flex items-center gap-2">
                    Shop Men
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-primary/10 via-transparent to-transparent pointer-events-none"
      />

      {/* Scroll Indicator - Hidden on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-3 cursor-pointer group"
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <motion.span 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-xs text-muted-foreground tracking-widest uppercase group-hover:text-primary transition-colors"
        >
          Scroll
        </motion.span>
        <div className="relative w-6 h-10 border-2 border-muted-foreground/50 rounded-full group-hover:border-primary transition-colors">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full"
          />
        </div>
        <motion.div
          animate={{ y: [0, 4, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-px h-2 bg-primary/60" />
          <div className="w-px h-3 bg-primary/40" />
          <div className="w-px h-4 bg-primary/20" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
