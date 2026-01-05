import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Zap, Gift, Truck, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAnnouncementBar } from '@/hooks/useAnnouncementBar';

const iconMap = {
  zap: Zap,
  gift: Gift,
  truck: Truck,
  clock: Clock,
  sparkles: Sparkles,
};

interface CountdownProps {
  targetDate: Date;
}

const Countdown = ({ targetDate }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <span className="bg-background/20 px-1.5 py-0.5 rounded">{String(timeLeft.days).padStart(2, '0')}d</span>
      <span>:</span>
      <span className="bg-background/20 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
      <span>:</span>
      <span className="bg-background/20 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
      <span>:</span>
      <motion.span 
        key={timeLeft.seconds}
        initial={{ scale: 1.2, opacity: 0.5 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-background/20 px-1.5 py-0.5 rounded"
      >
        {String(timeLeft.seconds).padStart(2, '0')}s
      </motion.span>
    </div>
  );
};

const FloatingAnnouncementBar = () => {
  const { data: settings } = useAnnouncementBar();
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const enabledPromotions = settings?.promotions.filter(p => p.enabled) || [];

  // Sale ends based on settings
  const saleEndDate = new Date();
  saleEndDate.setDate(saleEndDate.getDate() + (settings?.countdownDays || 7));

  useEffect(() => {
    if (isPaused || !settings?.autoRotate || enabledPromotions.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % enabledPromotions.length);
    }, settings?.rotationInterval || 4000);

    return () => clearInterval(interval);
  }, [isPaused, settings?.autoRotate, settings?.rotationInterval, enabledPromotions.length]);

  const handlePrev = () => {
    if (enabledPromotions.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + enabledPromotions.length) % enabledPromotions.length);
  };

  const handleNext = () => {
    if (enabledPromotions.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % enabledPromotions.length);
  };

  if (!isVisible || !settings?.enabled || enabledPromotions.length === 0) return null;

  const currentPromo = enabledPromotions[currentIndex];
  const Icon = iconMap[currentPromo?.icon || 'zap'] || Zap;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="relative bg-gradient-to-r from-primary via-primary/90 to-gold text-primary-foreground overflow-hidden">
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{ left: `${10 + i * 20}%`, top: '50%' }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative">
          <div 
            className="flex items-center justify-between py-2.5"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Left - Countdown */}
            {settings?.showCountdown && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Sale Ends:</span>
                <Countdown targetDate={saleEndDate} />
              </div>
            )}

            {/* Center - Rotating Promotions */}
            <div className="flex-1 flex items-center justify-center gap-2">
              <button 
                onClick={handlePrev}
                className="p-1 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPromo.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  
                  {currentPromo.link ? (
                    <Link 
                      to={currentPromo.link}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <span className="text-sm">{currentPromo.text}</span>
                      {currentPromo.highlight && (
                        <span className="font-bold text-sm bg-background/20 px-2 py-0.5 rounded-full">
                          {currentPromo.highlight}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{currentPromo.text}</span>
                      {currentPromo.highlight && (
                        <span className="font-bold text-sm bg-background/20 px-2 py-0.5 rounded-full">
                          {currentPromo.highlight}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <button 
                onClick={handleNext}
                className="p-1 hover:bg-white/10 rounded-full transition-colors hidden sm:block"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right - Indicators & Close */}
            <div className="flex items-center gap-3">
              {/* Progress indicators */}
              <div className="hidden sm:flex items-center gap-1">
                {enabledPromotions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === currentIndex 
                        ? 'bg-white w-4' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>

              {/* Close button */}
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close announcement"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </motion.div>
  );
};

export default FloatingAnnouncementBar;
