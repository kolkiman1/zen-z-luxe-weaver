import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Smartphone, Tablet, Eye, Play, Pause, RefreshCw,
  Sparkles, ArrowRight, Clock, Zap, Gift, Truck, ExternalLink,
  Image as ImageIcon, Video, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

interface UniversalLivePreviewProps {
  type: 'hero' | 'sections' | 'media' | 'elements' | 'announcement' | 'video';
  data?: any;
  media?: any;
  title?: string;
  onOpenFullPreview?: () => void;
}

const deviceWidths = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  zap: Zap,
  gift: Gift,
  truck: Truck,
  clock: Clock,
  sparkles: Sparkles,
};

const UniversalLivePreview = ({ 
  type, 
  data, 
  media,
  title,
  onOpenFullPreview 
}: UniversalLivePreviewProps) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  // Auto-rotate for announcements
  useEffect(() => {
    if (type !== 'announcement' || !data?.autoRotate || !isPlaying) return;
    
    const enabledPromos = data.promotions?.filter((p: any) => p.enabled) || [];
    if (enabledPromos.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPromoIndex(prev => (prev + 1) % enabledPromos.length);
    }, data.rotationInterval || 4000);

    return () => clearInterval(interval);
  }, [type, data, isPlaying]);

  const renderHeroPreview = () => {
    if (!data) return null;

    const categories = data.categories?.filter((c: any) => c.enabled) || [];

    return (
      <div className="relative min-h-[350px] overflow-hidden">
        {/* Background */}
        {media?.type === 'video' && media?.url ? (
          <video 
            src={media.url} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : media?.url ? (
          <img 
            src={media.url} 
            alt="Hero background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90" />
        )}
        
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/90"
          style={{ opacity: (media?.overlayOpacity || 75) / 100 }}
        />
        
        {/* Content */}
        <div className="relative z-10 p-6 sm:p-8 space-y-4">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-xs sm:text-sm">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
              <span className="text-primary">{data.badgePrefix}</span>
              <span className="text-gold font-bold">{data.badgeHighlight}</span>
              <span className="text-muted-foreground">{data.badgeSuffix}</span>
            </span>
          </motion.div>

          {/* Heading */}
          <div className={`space-y-1 ${device === 'mobile' ? 'text-2xl' : device === 'tablet' ? 'text-3xl' : 'text-4xl'}`}>
            <motion.h1 
              key={data.headingLine1}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold tracking-tighter"
            >
              {data.headingLine1}
            </motion.h1>
            <motion.h1 
              key={data.headingLine2}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display font-bold tracking-tighter text-gradient-gold"
            >
              {data.headingLine2}
            </motion.h1>
          </div>

          {/* Description */}
          <motion.p
            key={data.description}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground max-w-md text-xs sm:text-sm"
          >
            {data.description}
          </motion.p>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 3).map((cat: any) => (
              <motion.span
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium"
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
              {data.primaryButtonText}
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              {data.secondaryButtonText}
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/30 backdrop-blur-md border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span><strong>10K+</strong> Happy Customers</span>
              <span><strong>24/7</strong> Support</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Scroll to explore</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMediaPreview = () => {
    if (!data) return null;

    return (
      <div className="relative min-h-[200px] overflow-hidden rounded-lg">
        {data.type === 'video' && data.url ? (
          <video 
            src={data.url} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-48 object-cover"
          />
        ) : data.url ? (
          <img 
            src={data.url} 
            alt="Preview" 
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="h-48 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground text-sm">No media selected</p>
          </div>
        )}
        
        {data.overlayOpacity > 0 && (
          <div 
            className="absolute inset-0 bg-background" 
            style={{ opacity: data.overlayOpacity / 100 }}
          />
        )}
        
        {/* Overlay content preview */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-primary text-xs font-medium tracking-wider uppercase mb-1">
              Preview
            </p>
            <p className="text-foreground font-display font-bold text-lg">
              Section <span className="text-primary">Content</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderElementsPreview = () => {
    if (!data || !Array.isArray(data)) return null;

    return (
      <div className="relative min-h-[200px] p-6 space-y-3 bg-gradient-to-br from-background via-muted/20 to-background">
        {media?.url && (
          <div className="absolute inset-0">
            <img src={media.url} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-background/70" />
          </div>
        )}
        <div className="relative z-10 space-y-2">
          {data.map((element: any) => {
            const style: React.CSSProperties = {
              fontSize: element.style?.fontSize || 'inherit',
              fontWeight: element.style?.fontWeight || 'normal',
              textTransform: element.style?.textTransform || 'none',
              letterSpacing: element.style?.letterSpacing || 'normal',
              color: element.style?.color === 'primary' ? 'hsl(var(--primary))' : 
                     element.style?.color === 'gold' ? 'hsl(var(--gold))' :
                     element.style?.color === 'muted' ? 'hsl(var(--muted-foreground))' : 'inherit',
            };

            if (element.type === 'button') {
              return (
                <Button key={element.id} size="sm" variant={element.variant || 'default'}>
                  {element.content}
                </Button>
              );
            }

            return (
              <p key={element.id} style={style} className={element.type === 'heading' ? 'font-display' : ''}>
                {element.content}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnnouncementPreview = () => {
    if (!data) return null;

    const enabledPromos = data.promotions?.filter((p: any) => p.enabled) || [];
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
            {data.showCountdown && (
              <div className="hidden md:flex items-center gap-2 text-xs absolute left-4">
                <Clock className="w-3 h-3" />
                <span>Sale Ends:</span>
                <span className="bg-background/20 px-1.5 py-0.5 rounded text-[10px] font-mono">
                  {data.countdownDays}d
                </span>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={currentPromo?.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center gap-2 text-sm"
              >
                <Icon className="w-4 h-4" />
                <span>{currentPromo?.text}</span>
                {currentPromo?.highlight && (
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

  const renderPreview = () => {
    switch (type) {
      case 'hero':
        return renderHeroPreview();
      case 'media':
        return renderMediaPreview();
      case 'elements':
        return renderElementsPreview();
      case 'announcement':
        return renderAnnouncementPreview();
      default:
        return (
          <div className="p-8 text-center text-muted-foreground">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Preview not available for this section</p>
          </div>
        );
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">{title || 'Live Preview'}</span>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Real-time
          </Badge>
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

          {onOpenFullPreview && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={onOpenFullPreview}
            >
              <ExternalLink className="w-3 h-3" />
              Full Preview
            </Button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      <div 
        className="bg-muted/20 p-4 flex justify-center overflow-auto"
        style={{ minHeight: type === 'announcement' ? '80px' : '250px' }}
      >
        <div
          className="bg-background rounded-lg overflow-hidden shadow-lg transition-all duration-300 border w-full"
          style={{ 
            maxWidth: deviceWidths[device],
          }}
        >
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default UniversalLivePreview;
