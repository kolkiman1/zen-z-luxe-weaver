import { motion } from 'framer-motion';
import { SectionOrderItem, isScheduledActive } from '@/hooks/useSectionOrder';
import { Eye, EyeOff, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface HomepagePreviewProps {
  sections: SectionOrderItem[];
}

const sectionColors: Record<string, string> = {
  hero: 'bg-primary/20 border-primary/40',
  features: 'bg-blue-500/20 border-blue-500/40',
  newArrivals: 'bg-green-500/20 border-green-500/40',
  categories: 'bg-purple-500/20 border-purple-500/40',
  featuredProducts: 'bg-orange-500/20 border-orange-500/40',
  brandBanner: 'bg-pink-500/20 border-pink-500/40',
  collection: 'bg-yellow-500/20 border-yellow-500/40',
};

const sectionHeights: Record<string, string> = {
  hero: 'h-24',
  features: 'h-8',
  newArrivals: 'h-16',
  categories: 'h-14',
  featuredProducts: 'h-16',
  brandBanner: 'h-12',
  collection: 'h-14',
};

const HomepagePreview = ({ sections }: HomepagePreviewProps) => {
  return (
    <div className="bg-muted/30 rounded-xl p-4 border border-border">
      <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
        <Eye className="w-3 h-3" />
        Homepage Preview
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
        <div className="p-2 space-y-1.5">
          {sections.map((section, index) => {
            const isActive = isScheduledActive(section);
            const hasSchedule = section.startDate || section.endDate;
            
            return (
              <motion.div
                key={section.id + (section.collectionId || '')}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  ${sectionHeights[section.id] || 'h-12'}
                  ${sectionColors[section.id] || 'bg-muted/50 border-border'}
                  ${!isActive ? 'opacity-40' : ''}
                  rounded border-2 flex items-center justify-center relative
                  transition-all duration-200
                `}
              >
                <span className="text-[10px] font-medium text-foreground/70 truncate px-2">
                  {section.label}
                </span>
                
                {/* Status indicators */}
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {hasSchedule && (
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                  )}
                  {!section.enabled && (
                    <EyeOff className="w-3 h-3 text-muted-foreground" />
                  )}
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
      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-primary/30 rounded" />
          <span className="text-muted-foreground">Active</span>
        </div>
        <div className="flex items-center gap-1">
          <EyeOff className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-muted-foreground">Hidden</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-muted-foreground">Scheduled</span>
        </div>
      </div>
    </div>
  );
};

export default HomepagePreview;
