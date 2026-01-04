import { motion } from 'framer-motion';
import { ArrowRight, SplitSquareHorizontal } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SectionContent, defaultSectionContent } from '@/hooks/useSectionContent';
import { SectionMedia } from '@/hooks/useSectionMedia';
import { Badge } from '@/components/ui/badge';

interface SectionContentComparisonProps {
  sectionKey: 'hero' | 'newArrivals' | 'categories' | 'featuredProducts' | 'brandBanner';
  originalContent: SectionContent;
  currentContent: SectionContent;
  media?: SectionMedia;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SectionContentComparison = ({
  sectionKey,
  originalContent,
  currentContent,
  media,
  open,
  onOpenChange,
}: SectionContentComparisonProps) => {
  const originalData = originalContent[sectionKey];
  const currentData = currentContent[sectionKey];
  const mediaData = media?.[sectionKey];

  const sectionTitles: Record<string, string> = {
    hero: 'Hero Section',
    newArrivals: 'New Arrivals',
    categories: 'Categories',
    featuredProducts: 'Featured Products',
    brandBanner: 'Brand Banner',
  };

  const hasChanges = JSON.stringify(originalData) !== JSON.stringify(currentData);

  const renderPreviewPanel = (data: typeof originalData, label: string, isOriginal: boolean) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant={isOriginal ? 'secondary' : 'default'} className="text-xs">
          {label}
        </Badge>
        {!isOriginal && hasChanges && (
          <Badge variant="outline" className="text-xs text-primary border-primary">
            Modified
          </Badge>
        )}
      </div>
      <div className="relative w-full min-h-[280px] rounded-lg overflow-hidden border border-border bg-card">
        {mediaData?.url && mediaData.type !== 'none' && (
          <>
            {mediaData.type === 'video' ? (
              <video
                src={mediaData.url}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <img
                src={mediaData.url}
                alt="Section background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div
              className="absolute inset-0 bg-background"
              style={{ opacity: (mediaData.overlayOpacity || 70) / 100 }}
            />
          </>
        )}
        {(!mediaData?.url || mediaData.type === 'none') && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-muted" />
        )}
        <div className="relative z-10 p-6 text-center flex flex-col justify-center min-h-[280px]">
          {'tagline' in data && data.tagline && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-primary font-medium tracking-wider uppercase text-[10px] mb-1"
            >
              {data.tagline}
            </motion.p>
          )}
          {'badgeText' in data && data.badgeText && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block px-3 py-0.5 bg-primary/20 text-primary text-[10px] font-medium rounded-full border border-primary/30 mb-2 mx-auto"
            >
              {data.badgeText}
            </motion.div>
          )}
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl font-display font-bold text-foreground mb-1"
          >
            {'headline' in data && data.headline}{' '}
            {'headlineHighlight' in data && (
              <span className="text-primary">{data.headlineHighlight}</span>
            )}
          </motion.h2>
          {'description' in data && (
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground max-w-xs mx-auto text-xs leading-relaxed"
            >
              {data.description}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );

  const renderFieldComparison = () => {
    const fields: { key: string; label: string }[] = [];
    
    if ('tagline' in originalData) fields.push({ key: 'tagline', label: 'Tagline' });
    if ('badgeText' in originalData) fields.push({ key: 'badgeText', label: 'Badge Text' });
    if ('headline' in originalData) fields.push({ key: 'headline', label: 'Headline' });
    if ('headlineHighlight' in originalData) fields.push({ key: 'headlineHighlight', label: 'Headline Highlight' });
    if ('description' in originalData) fields.push({ key: 'description', label: 'Description' });

    return (
      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-medium text-foreground">Field-by-Field Comparison</h4>
        <div className="space-y-2">
          {fields.map(({ key, label }) => {
            const originalValue = (originalData as Record<string, string>)[key] || '';
            const currentValue = (currentData as Record<string, string>)[key] || '';
            const isChanged = originalValue !== currentValue;
            
            return (
              <div
                key={key}
                className={`p-3 rounded-lg border ${
                  isChanged ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{label}</span>
                  {isChanged && (
                    <Badge variant="outline" className="text-[10px] text-primary border-primary h-4">
                      Changed
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-start">
                  <div className={`text-xs ${isChanged ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {originalValue || <span className="italic text-muted-foreground/50">(empty)</span>}
                  </div>
                  {isChanged && (
                    <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                  )}
                  {isChanged && (
                    <div className="text-xs text-foreground font-medium">
                      {currentValue || <span className="italic text-muted-foreground/50">(empty)</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SplitSquareHorizontal className="w-5 h-5 text-primary" />
            {sectionTitles[sectionKey]} — Before & After
            {!hasChanges && (
              <Badge variant="secondary" className="ml-2">No Changes</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {/* Visual Comparison */}
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          {renderPreviewPanel(originalData, 'Before (Saved)', true)}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-px h-full bg-border relative">
              <ArrowRight className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary bg-background p-1 rounded-full border border-border" />
            </div>
          </div>
          <div className="md:hidden flex items-center justify-center py-2">
            <ArrowRight className="w-6 h-6 text-primary rotate-90" />
          </div>
          {renderPreviewPanel(currentData, 'After (Current)', false)}
        </div>

        {/* Field Comparison */}
        {renderFieldComparison()}

        <p className="text-xs text-muted-foreground text-center mt-4">
          {hasChanges 
            ? "You have unsaved changes. Save your content to apply these updates." 
            : "No changes detected. Edit the fields above to see the comparison."}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SectionContentComparison;
