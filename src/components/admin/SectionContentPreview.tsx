import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SectionContent } from '@/hooks/useSectionContent';
import { SectionMedia } from '@/hooks/useSectionMedia';

interface SectionContentPreviewProps {
  sectionKey: 'hero' | 'newArrivals' | 'categories' | 'featuredProducts' | 'brandBanner';
  content: SectionContent;
  media?: SectionMedia;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SectionContentPreview = ({
  sectionKey,
  content,
  media,
  open,
  onOpenChange,
}: SectionContentPreviewProps) => {
  const sectionData = content[sectionKey];
  const mediaData = media?.[sectionKey];

  const renderHeroPreview = () => (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
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
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div
            className="absolute inset-0 bg-background"
            style={{ opacity: (mediaData.overlayOpacity || 70) / 100 }}
          />
        </>
      )}
      {!mediaData?.url && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          {'badgeText' in sectionData && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-block px-4 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full border border-primary/30"
            >
              {sectionData.badgeText}
            </motion.div>
          )}
          {'tagline' in sectionData && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-primary font-medium tracking-wider uppercase text-sm"
            >
              {sectionData.tagline}
            </motion.p>
          )}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-display font-bold text-foreground"
          >
            {'headline' in sectionData && sectionData.headline}{' '}
            {'headlineHighlight' in sectionData && (
              <span className="text-primary">{sectionData.headlineHighlight}</span>
            )}
          </motion.h1>
          {'description' in sectionData && (
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground max-w-lg mx-auto text-sm"
            >
              {sectionData.description}
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSectionPreview = () => (
    <div className="relative w-full min-h-[300px] rounded-lg overflow-hidden bg-card">
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
      <div className={`relative z-10 p-8 text-center ${!mediaData?.url || mediaData.type === 'none' ? '' : ''}`}>
        {'tagline' in sectionData && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-primary font-medium tracking-wider uppercase text-xs mb-2"
          >
            {sectionData.tagline}
          </motion.p>
        )}
        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2"
        >
          {'headline' in sectionData && sectionData.headline}{' '}
          {'headlineHighlight' in sectionData && (
            <span className="text-primary">{sectionData.headlineHighlight}</span>
          )}
        </motion.h2>
        {'description' in sectionData && (
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-md mx-auto text-sm"
          >
            {sectionData.description}
          </motion.p>
        )}
        
        {/* Placeholder content area */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="aspect-square bg-muted rounded-lg flex items-center justify-center"
            >
              <span className="text-muted-foreground text-xs">Item {i}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const sectionTitles: Record<string, string> = {
    hero: 'Hero Section',
    newArrivals: 'New Arrivals',
    categories: 'Categories',
    featuredProducts: 'Featured Products',
    brandBanner: 'Brand Banner',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            {sectionTitles[sectionKey]} Preview
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {sectionKey === 'hero' ? renderHeroPreview() : renderSectionPreview()}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          This is a preview of how your content will appear. Actual products/items will be displayed on the live site.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default SectionContentPreview;
