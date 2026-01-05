import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useVideoShowcase } from '@/hooks/useVideoShowcase';

const VideoShowcase = () => {
  const { data: settings } = useVideoShowcase();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.3 });
  const [isPlaying, setIsPlaying] = useState(settings?.autoplay ?? true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeProduct, setActiveProduct] = useState(0);
  const [scrollTargetEl, setScrollTargetEl] = useState<HTMLDivElement | null>(null);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
    setScrollTargetEl(node);
  }, []);

  const scrollTarget = useMemo(
    () =>
      scrollTargetEl
        ? ({ current: scrollTargetEl } as React.RefObject<HTMLDivElement>)
        : undefined,
    [scrollTargetEl]
  );

  const enabledHighlights = settings?.productHighlights.filter(h => h.enabled) || [];

  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ['start end', 'end start'],
  });

  const canAnimate = Boolean(scrollTargetEl);

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    if (videoRef.current) {
      if (isInView && isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, isPlaying]);

  useEffect(() => {
    if (enabledHighlights.length === 0) return;
    const interval = setInterval(() => {
      setActiveProduct((prev) => (prev + 1) % enabledHighlights.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [enabledHighlights.length]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (!settings?.enabled) return null;

  return (
    <section ref={setContainerRef} className="relative py-20 lg:py-32 overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium">{settings?.tagline || 'Featured Collection'}</span>
          </motion.div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {settings?.headline || 'Experience the'}
            <span className="text-gradient-gold ml-2">{settings?.headlineHighlight || 'Elegance'}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {settings?.description || 'Discover our handpicked collection of premium fashion pieces crafted for the modern generation.'}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Video Section */}
          <motion.div
            style={canAnimate ? { y, opacity } : undefined}
            className="relative aspect-[4/5] lg:aspect-[3/4] rounded-3xl overflow-hidden group"
          >
            {/* Video */}
            <video
              ref={videoRef}
              autoPlay={settings?.autoplay}
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={settings?.videoUrl || '/videos/new-arrivals-bg.mp4'} type="video/mp4" />
            </video>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/30 to-transparent" />

            {/* Video Controls */}
            {settings?.showControls && (
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMute}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 mx-4 h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white/60"
                    initial={{ width: '0%' }}
                    animate={{ width: isPlaying ? '100%' : '0%' }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </div>
            )}

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="absolute top-6 left-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-background text-sm font-semibold shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-background/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-background" />
                </span>
                Now Playing
              </span>
            </motion.div>

            {/* Corner Decorations */}
            <div className="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-white/20 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-white/20 rounded-bl-3xl" />
          </motion.div>

          {/* Product Highlights */}
          <div className="space-y-6">
            <motion.h3
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="font-display text-2xl lg:text-3xl font-bold"
            >
              {settings?.sideHeadline || 'Trending This Season'}
            </motion.h3>

            <div className="space-y-4">
              {enabledHighlights.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  onMouseEnter={() => setActiveProduct(index)}
                  className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeProduct === index
                      ? 'bg-primary/5 border-primary/30 shadow-lg shadow-primary/5'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <Link to={product.link} className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {activeProduct === index && (
                        <motion.div
                          layoutId="activeProductBorder"
                          className="absolute inset-0 border-2 border-primary rounded-xl"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {product.category}
                      </p>
                      <h4 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-gold font-bold">{product.price}</p>
                    </div>

                    {/* Arrow */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      activeProduct === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted group-hover:bg-primary/10'
                    }`}>
                      <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${
                        activeProduct === index ? 'translate-x-0.5' : 'group-hover:translate-x-0.5'
                      }`} />
                    </div>
                  </Link>

                  {/* Active Indicator */}
                  {activeProduct === index && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              <Link to="/category/all">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-8 group">
                  View All Products
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoShowcase;
