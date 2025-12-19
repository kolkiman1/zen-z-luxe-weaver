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

      {/* Background Image - Indian Fashion Style */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ 
            scale: [1.1, 1.15, 1.1],
            x: [0, 15, 0],
            y: [0, -10, 0],
            opacity: 1
          }}
          transition={{ 
            scale: { duration: 20, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
            x: { duration: 20, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
            y: { duration: 20, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
            opacity: { duration: 1.5, ease: 'easeOut' }
          }}
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&q=80"
          alt="Indian Fashion Model"
          className="w-full h-full object-cover object-top"
        />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" 
        />
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
          {/* Badge with animated text and glow */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 mb-4 md:mb-6"
          >
            <motion.span 
              className="relative px-4 py-2 md:px-6 md:py-3 bg-primary/10 border border-primary/30 rounded-full text-primary text-sm sm:text-base md:text-lg lg:text-xl font-medium tracking-wide flex items-center gap-2 overflow-hidden"
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
              <motion.span
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Sparkles size={18} className="text-gold" />
              </motion.span>
              <span className="flex relative z-10">
                {"Bangladesh's Biggest Trendy Fashion Shop".split("").map((char, index) => (
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
            </motion.span>
          </motion.div>

          {/* Tagline with typewriter effect */}
          <TypewriterTagline />

          {/* Main Heading with staggered word animation */}
          <div className="mb-4 md:mb-6 overflow-hidden">
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
            className="text-foreground/70 text-sm sm:text-base md:text-lg max-w-lg mb-6 md:mb-8 leading-relaxed"
          >
            Discover curated luxury fashion, exquisite jewelry, and premium accessories
            designed for the modern Bangladeshi.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Link to="/category/women" className="w-full sm:w-auto">
              <Button className="btn-primary w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base gap-2 group">
                Shop Women
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/category/men" className="w-full sm:w-auto">
              <Button variant="outline" className="btn-outline-gold w-full sm:w-auto px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base">
                Shop Men
              </Button>
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
