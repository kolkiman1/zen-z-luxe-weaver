import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Smartphone, Tablet, Eye, Play, Pause, RefreshCw,
  Sparkles, ArrowRight, Clock, Zap, Gift, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroContentSettings } from '@/hooks/useHeroContent';
import { AnnouncementBarSettings, Promotion } from '@/hooks/useAnnouncementBar';
import { VideoShowcaseSettings } from '@/hooks/useVideoShowcase';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface LivePreviewPanelProps {
  type: 'hero' | 'announcement' | 'video';
  heroData?: HeroContentSettings;
  announcementData?: AnnouncementBarSettings;
  videoData?: VideoShowcaseSettings;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  zap: Zap,
  gift: Gift,
  truck: Truck,
  clock: Clock,
  sparkles: Sparkles,
};

const LivePreviewPanel = ({ type, heroData, announcementData, videoData }: LivePreviewPanelProps) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  // Auto-rotate promotions for announcement preview
  useEffect(() => {
    if (type !== 'announcement' || !announcementData?.autoRotate || !isPlaying) return;
    
    const enabledPromos = announcementData.promotions.filter(p => p.enabled);
    if (enabledPromos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex(prev => (prev + 1) % enabledPromos.length);
    }, announcementData.rotationInterval || 4000);

    return () => clearInterval(interval);
  }, [type, announcementData, isPlaying]);

  const renderHeroPreview = () => {
    if (!heroData) return null;

    const categories = heroData.categories.filter(c => c.enabled);

    return (
      <div className="relative min-h-[400px] bg-gradient-to-br from-background via-background/95 to-background/90 overflow-hidden">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/10" />
        
        <div className="relative z-10 p-8 space-y-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-primary">{heroData.badgePrefix}</span>
              <span className="text-gold font-bold">{heroData.badgeHighlight}</span>
              <span className="text-muted-foreground">{heroData.badgeSuffix}</span>
            </span>
          </motion.div>

          {/* Heading */}
          <div className={`space-y-1 ${device === 'mobile' ? 'text-3xl' : device === 'tablet' ? 'text-4xl' : 'text-5xl'}`}>
            <motion.h1 
              key={heroData.headingLine1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold tracking-tighter"
            >
              {heroData.headingLine1}
            </motion.h1>
            <motion.h1 
              key={heroData.headingLine2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold tracking-tighter text-gradient-gold"
            >
              {heroData.headingLine2}
            </motion.h1>
          </div>

          {/* Description */}
          <motion.p
            key={heroData.description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground max-w-md text-sm"
          >
            {heroData.description}
          </motion.p>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.span
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-${cat.colorFrom} to-${cat.colorTo} border border-border/50 text-xs font-medium`}
              >
                {cat.name}
                <ArrowRight className="w-3 h-3" />
              </motion.span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="sm" className="bg-foreground text-background gap-2">
              <Play className="w-3 h-3 fill-current" />
              {heroData.primaryButtonText}
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              {heroData.secondaryButtonText}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderAnnouncementPreview = () => {
    if (!announcementData) return null;

    const enabledPromos = announcementData.promotions.filter(p => p.enabled);
    if (enabledPromos.length === 0) {
      return (
        <div className="bg-muted/50 p-4 text-center text-muted-foreground text-sm">
          No enabled promotions to preview
        </div>
      );
    }

    const currentPromo = enabledPromos[currentPromoIndex % enabledPromos.length];
    const Icon = iconMap[currentPromo?.icon || 'zap'] || Zap;

    return (
      <div className="relative">
        <div className="bg-gradient-to-r from-primary via-primary/90 to-gold text-primary-foreground overflow-hidden">
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          <div className="relative px-4 py-2.5 flex items-center justify-center gap-2">
            {announcementData.showCountdown && (
              <div className="hidden md:flex items-center gap-2 text-xs absolute left-4">
                <Clock className="w-3 h-3" />
                <span>Sale Ends:</span>
                <span className="bg-background/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                  {announcementData.countdownDays}d
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPromo.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 text-sm"
              >
                <Icon className="w-4 h-4" />
                <span>{currentPromo.text}</span>
                {currentPromo.highlight && (
                  <span className="font-bold bg-background/20 px-2 py-0.5 rounded-full text-xs">
                    {currentPromo.highlight}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const renderVideoPreview = () => {
    if (!videoData) return null;

    return (
      <div className="relative min-h-[300px] bg-background overflow-hidden">
        {/* Video background */}
        {videoData.videoUrl && (
          <video
            src={videoData.videoUrl}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />

        <div className="relative z-10 p-8 space-y-4">
          <p className="text-xs uppercase tracking-widest text-primary">{videoData.tagline}</p>
          <div className={`font-display font-bold ${device === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
            {videoData.headline} <span className="text-gradient-gold">{videoData.headlineHighlight}</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-sm">{videoData.description}</p>

          {/* Product highlights */}
          <div className="flex gap-3 pt-4">
            {videoData.productHighlights.filter(h => h.enabled).slice(0, 2).map((highlight) => (
              <div key={highlight.id} className="bg-card/50 backdrop-blur rounded-lg p-2 border border-border/50 flex gap-2">
                <img src={highlight.image} alt={highlight.name} className="w-12 h-12 rounded object-cover" />
                <div>
                  <p className="text-xs font-medium">{highlight.name}</p>
                  <p className="text-xs text-muted-foreground">{highlight.category}</p>
                  <p className="text-xs font-bold text-gold">{highlight.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">Live Preview</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device toggles */}
          <div className="flex items-center border rounded-md bg-background">
            <Button
              variant={device === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={device === 'tablet' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('tablet')}
            >
              <Tablet className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant={device === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </Button>
          </div>

          {type === 'announcement' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div 
        className="bg-muted/20 p-4 flex justify-center overflow-auto"
        style={{ minHeight: type === 'announcement' ? '80px' : '300px' }}
      >
        <div
          className="bg-background rounded-lg overflow-hidden shadow-lg transition-all duration-300 border"
          style={{ 
            width: deviceWidths[device],
            maxWidth: '100%',
          }}
        >
          {type === 'hero' && renderHeroPreview()}
          {type === 'announcement' && renderAnnouncementPreview()}
          {type === 'video' && renderVideoPreview()}
        </div>
      </div>
    </div>
  );
};

export default LivePreviewPanel;
