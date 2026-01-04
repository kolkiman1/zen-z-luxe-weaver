import { motion } from 'framer-motion';
import { SectionOrderItem, isScheduledActive } from '@/hooks/useSectionOrder';
import { SectionMedia } from '@/hooks/useSectionMedia';
import { SectionContent } from '@/hooks/useSectionContent';
import { ProductCollection } from '@/hooks/useProductCollections';
import { Eye, EyeOff, Calendar, ExternalLink, Image, Video, Type, ShoppingBag, Sparkles, Grid, List, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomepagePreviewProps {
  sections: SectionOrderItem[];
  sectionMedia?: SectionMedia;
  sectionContent?: SectionContent;
  collections?: ProductCollection[];
  onPreviewClick?: () => void;
}

const sectionIcons: Record<string, React.ReactNode> = {
  hero: <Layout className="w-3 h-3" />,
  features: <Sparkles className="w-3 h-3" />,
  newArrivals: <ShoppingBag className="w-3 h-3" />,
  categories: <Grid className="w-3 h-3" />,
  featuredProducts: <List className="w-3 h-3" />,
  brandBanner: <Image className="w-3 h-3" />,
  collection: <ShoppingBag className="w-3 h-3" />,
};

const HomepagePreview = ({ sections, sectionMedia, sectionContent, collections, onPreviewClick }: HomepagePreviewProps) => {
  const getMediaThumbnail = (sectionId: string): string | null => {
    if (!sectionMedia) return null;
    const media = sectionMedia[sectionId as keyof SectionMedia];
    if (!media || media.type === 'none' || !media.url) return null;
    return media.url;
  };

  const getMediaType = (sectionId: string): 'image' | 'video' | 'none' => {
    if (!sectionMedia) return 'none';
    const media = sectionMedia[sectionId as keyof SectionMedia];
    return media?.type || 'none';
  };

  const getHeadline = (sectionId: string, collectionId?: string): string => {
    if (sectionId === 'collection' && collectionId) {
      const collection = collections?.find(c => c.id === collectionId);
      return collection?.name || 'Collection';
    }
    
    if (!sectionContent) return sectionId;
    const content = sectionContent[sectionId as keyof SectionContent];
    if (!content) return sectionId;
    
    if ('headline' in content && 'headlineHighlight' in content) {
      return `${(content as { headline: string; headlineHighlight: string }).headline} ${(content as { headline: string; headlineHighlight: string }).headlineHighlight}`;
    }
    if ('headline' in content) {
      return (content as { headline: string }).headline;
    }
    return sectionId;
  };

  const getDescription = (sectionId: string, collectionId?: string): string | null => {
    if (sectionId === 'collection' && collectionId) {
      const collection = collections?.find(c => c.id === collectionId);
      return collection?.description || null;
    }
    
    if (!sectionContent) return null;
    const content = sectionContent[sectionId as keyof SectionContent];
    if (!content) return null;
    
    if ('description' in content) {
      return content.description;
    }
    return null;
  };

  return (
    <div className="bg-muted/30 rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Eye className="w-3 h-3" />
          Homepage Preview
        </div>
        {onPreviewClick && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs gap-1.5"
            onClick={onPreviewClick}
          >
            <ExternalLink className="w-3 h-3" />
            Preview Live
          </Button>
        )}
      </div>
      
      <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
        {/* Header mockup */}
        <div className="h-6 bg-card border-b border-border flex items-center px-2 gap-1">
          <div className="w-8 h-2 bg-primary/30 rounded" />
          <div className="flex-1" />
          <div className="w-4 h-2 bg-muted rounded" />
          <div className="w-4 h-2 bg-muted rounded" />
          <div className="w-4 h-2 bg-muted rounded" />
        </div>
        
        {/* Sections */}
        <div className="p-2 space-y-1.5 max-h-[400px] overflow-y-auto">
          {sections.map((section, index) => {
            const isActive = isScheduledActive(section);
            const hasSchedule = section.startDate || section.endDate;
            const thumbnail = getMediaThumbnail(section.id);
            const mediaType = getMediaType(section.id);
            const headline = getHeadline(section.id, section.collectionId);
            const description = getDescription(section.id, section.collectionId);
            
            return (
              <motion.div
                key={section.id + (section.collectionId || '')}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`
                  relative overflow-hidden rounded-lg border-2 transition-all duration-200
                  ${!isActive ? 'opacity-40 border-border' : 'border-primary/30'}
                `}
              >
                {/* Thumbnail background */}
                {thumbnail && (
                  <div className="absolute inset-0">
                    {mediaType === 'video' ? (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Video className="w-4 h-4 text-primary/50" />
                      </div>
                    ) : (
                      <img 
                        src={thumbnail} 
                        alt={section.label}
                        className="w-full h-full object-cover opacity-30"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/50" />
                  </div>
                )}
                
                {/* Content */}
                <div className={`relative p-2.5 ${section.id === 'hero' ? 'min-h-[60px]' : 'min-h-[40px]'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-primary/70">{sectionIcons[section.id]}</span>
                        <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                          {section.label}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {headline}
                      </h4>
                      {description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {description}
                        </p>
                      )}
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex items-center gap-1 shrink-0">
                      {mediaType !== 'none' && (
                        <span className="text-muted-foreground">
                          {mediaType === 'video' ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <Image className="w-3 h-3" />
                          )}
                        </span>
                      )}
                      {hasSchedule && (
                        <Calendar className="w-3 h-3 text-primary" />
                      )}
                      {!section.enabled ? (
                        <EyeOff className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Eye className="w-3 h-3 text-primary" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {/* Footer mockup */}
        <div className="h-8 bg-card border-t border-border flex items-center justify-center">
          <div className="w-16 h-2 bg-muted rounded" />
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-[10px]">
        <div className="flex items-center gap-1">
          <Eye className="w-2.5 h-2.5 text-primary" />
          <span className="text-muted-foreground">Visible</span>
        </div>
        <div className="flex items-center gap-1">
          <EyeOff className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-muted-foreground">Hidden</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-2.5 h-2.5 text-primary" />
          <span className="text-muted-foreground">Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <Image className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-muted-foreground">Has media</span>
        </div>
      </div>
    </div>
  );
};

export default HomepagePreview;
