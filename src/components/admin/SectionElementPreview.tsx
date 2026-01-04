import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import type { SectionElement, ElementStyle } from './SectionElementEditor';
import type { SectionMediaItem } from '@/hooks/useSectionMedia';

interface SectionElementPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionKey: string;
  elements: SectionElement[];
  media?: SectionMediaItem;
}

const sectionTitles: Record<string, string> = {
  hero: 'Hero Section Preview',
  categories: 'Categories Section Preview',
  featuredProducts: 'Featured Products Preview',
  newArrivals: 'New Arrivals Preview',
  brandBanner: 'Brand Banner Preview',
};

const getHeightClass = (height?: string) => {
  switch (height) {
    case 'small': return 'h-[300px]';
    case 'medium': return 'h-[450px]';
    case 'large': return 'h-[600px]';
    case 'full': return 'h-[700px]';
    default: return 'h-[500px]';
  }
};

const getFontSizeClass = (size?: string) => {
  const sizes: Record<string, string> = {
    'xs': '0.75rem',
    'sm': '0.875rem',
    'base': '1rem',
    'lg': '1.125rem',
    'xl': '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  };
  return sizes[size || 'base'] || '1rem';
};

const getElementStyle = (style: ElementStyle): React.CSSProperties => {
  return {
    fontSize: getFontSizeClass(style.fontSize),
    fontWeight: style.fontWeight === 'light' ? 300 : 
                style.fontWeight === 'normal' ? 400 :
                style.fontWeight === 'medium' ? 500 :
                style.fontWeight === 'semibold' ? 600 :
                style.fontWeight === 'bold' ? 700 :
                style.fontWeight === 'extrabold' ? 800 : undefined,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    textAlign: style.textAlign as any,
    color: style.color,
    backgroundColor: style.backgroundColor,
    padding: style.padding,
    margin: style.margin,
    borderRadius: style.borderRadius,
    letterSpacing: style.letterSpacing === 'tighter' ? '-0.05em' :
                   style.letterSpacing === 'tight' ? '-0.025em' :
                   style.letterSpacing === 'normal' ? '0' :
                   style.letterSpacing === 'wide' ? '0.025em' :
                   style.letterSpacing === 'wider' ? '0.05em' :
                   style.letterSpacing === 'widest' ? '0.1em' : undefined,
    lineHeight: style.lineHeight === 'none' ? 1 :
                style.lineHeight === 'tight' ? 1.25 :
                style.lineHeight === 'snug' ? 1.375 :
                style.lineHeight === 'normal' ? 1.5 :
                style.lineHeight === 'relaxed' ? 1.625 :
                style.lineHeight === 'loose' ? 2 : undefined,
    textTransform: style.textTransform as any,
    opacity: style.opacity,
    textShadow: style.shadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.1)' :
                style.shadow === 'md' ? '0 2px 4px rgba(0,0,0,0.15)' :
                style.shadow === 'lg' ? '0 4px 8px rgba(0,0,0,0.2)' :
                style.shadow === 'xl' ? '0 8px 16px rgba(0,0,0,0.25)' :
                style.shadow === '2xl' ? '0 16px 32px rgba(0,0,0,0.3)' : undefined,
  };
};

export const SectionElementPreview = ({
  open,
  onOpenChange,
  sectionKey,
  elements,
  media,
}: SectionElementPreviewProps) => {
  const renderElement = (element: SectionElement) => {
    const style = getElementStyle(element.style);

    switch (element.type) {
      case 'badge':
        return (
          <Badge 
            key={element.id}
            variant="outline" 
            className="mb-4 border-white/30 text-white backdrop-blur-sm"
            style={style}
          >
            {element.content}
          </Badge>
        );
      case 'heading':
        return (
          <h1 key={element.id} style={style} className="mb-4">
            {element.content}
          </h1>
        );
      case 'subheading':
        return (
          <h2 key={element.id} style={style} className="mb-3">
            {element.content}
          </h2>
        );
      case 'description':
        return (
          <p key={element.id} style={style} className="mb-4 max-w-2xl">
            {element.content}
          </p>
        );
      case 'button':
        return (
          <button 
            key={element.id}
            className="px-6 py-3 bg-white text-black font-medium rounded hover:bg-white/90 transition-colors"
            style={style}
          >
            {element.content}
          </button>
        );
      case 'link':
        return (
          <a 
            key={element.id}
            href="#" 
            className="underline hover:no-underline"
            style={style}
          >
            {element.content}
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {sectionTitles[sectionKey] || 'Section Preview'}
          </DialogTitle>
        </DialogHeader>

        <div className={`relative overflow-hidden ${getHeightClass(media?.height)}`}>
          {/* Background Media */}
          {media?.type === 'video' && media.url ? (
            <video
              src={media.url}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : media?.type === 'image' && media.url ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${media.url})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />
          )}

          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: (media?.overlayOpacity ?? 50) / 100 }}
          />

          {/* Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
            {elements.map(renderElement)}
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            This preview shows how elements will appear on the live site. Colors and sizing are approximations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
