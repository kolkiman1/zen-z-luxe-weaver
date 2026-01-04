import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Type, 
  Palette, 
  Layout, 
  Eye, 
  Save, 
  RotateCcw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Sparkles,
  Wand2,
  Play,
  Zap
} from 'lucide-react';

export interface ElementAnimation {
  type: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale' | 'bounce' | 'rotate';
  duration: number;
  delay: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring';
}

export interface ElementStyle {
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  borderRadius?: string;
  letterSpacing?: string;
  lineHeight?: string;
  textTransform?: string;
  opacity?: number;
  shadow?: string;
}

export interface SectionElement {
  id: string;
  type: 'heading' | 'subheading' | 'description' | 'badge' | 'button' | 'link';
  content: string;
  style: ElementStyle;
  animation?: ElementAnimation;
}

// Style Presets
const stylePresets = [
  {
    id: 'elegant-heading',
    name: 'Elegant Heading',
    description: 'Sophisticated serif-inspired style',
    style: {
      fontSize: '5xl',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#ffffff',
      letterSpacing: 'wide',
      lineHeight: 'tight',
      shadow: 'lg',
      opacity: 1,
    } as ElementStyle,
  },
  {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    description: 'Simple and modern',
    style: {
      fontSize: '3xl',
      fontWeight: 'light',
      textAlign: 'center',
      color: '#ffffff',
      letterSpacing: 'wider',
      lineHeight: 'relaxed',
      textTransform: 'uppercase',
      opacity: 0.9,
    } as ElementStyle,
  },
  {
    id: 'bold-impact',
    name: 'Bold Impact',
    description: 'Strong and attention-grabbing',
    style: {
      fontSize: '6xl',
      fontWeight: 'extrabold',
      textAlign: 'center',
      color: '#ffffff',
      letterSpacing: 'tight',
      lineHeight: 'none',
      shadow: 'xl',
      opacity: 1,
    } as ElementStyle,
  },
  {
    id: 'soft-subtle',
    name: 'Soft & Subtle',
    description: 'Gentle and understated',
    style: {
      fontSize: '2xl',
      fontWeight: 'normal',
      textAlign: 'center',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 'normal',
      lineHeight: 'relaxed',
      opacity: 0.85,
    } as ElementStyle,
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Premium golden accent',
    style: {
      fontSize: '4xl',
      fontWeight: 'semibold',
      textAlign: 'center',
      color: '#D4AF37',
      letterSpacing: 'wider',
      lineHeight: 'snug',
      shadow: 'md',
      opacity: 1,
    } as ElementStyle,
  },
  {
    id: 'badge-style',
    name: 'Badge Style',
    description: 'Compact with background',
    style: {
      fontSize: 'sm',
      fontWeight: 'medium',
      textAlign: 'center',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.15)',
      padding: '0.5rem',
      borderRadius: '9999px',
      letterSpacing: 'widest',
      textTransform: 'uppercase',
      opacity: 1,
    } as ElementStyle,
  },
  {
    id: 'glass-effect',
    name: 'Glass Effect',
    description: 'Frosted glass appearance',
    style: {
      fontSize: 'xl',
      fontWeight: 'medium',
      textAlign: 'center',
      color: '#ffffff',
      backgroundColor: 'rgba(255,255,255,0.1)',
      padding: '1rem',
      borderRadius: '0.5rem',
      shadow: 'sm',
      opacity: 1,
    } as ElementStyle,
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Vibrant with glow effect',
    style: {
      fontSize: '4xl',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#E91E63',
      letterSpacing: 'wide',
      shadow: '2xl',
      opacity: 1,
    } as ElementStyle,
  },
];

// Animation Presets
const animationTypes = [
  { value: 'none', label: 'None', description: 'No animation' },
  { value: 'fade', label: 'Fade In', description: 'Smooth opacity transition' },
  { value: 'slide-up', label: 'Slide Up', description: 'Enter from bottom' },
  { value: 'slide-down', label: 'Slide Down', description: 'Enter from top' },
  { value: 'slide-left', label: 'Slide Left', description: 'Enter from right' },
  { value: 'slide-right', label: 'Slide Right', description: 'Enter from left' },
  { value: 'scale', label: 'Scale', description: 'Grow from small' },
  { value: 'bounce', label: 'Bounce', description: 'Playful bounce effect' },
  { value: 'rotate', label: 'Rotate', description: 'Spin into view' },
];

const easingOptions = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'spring', label: 'Spring' },
];

const defaultAnimation: ElementAnimation = {
  type: 'none',
  duration: 500,
  delay: 0,
  easing: 'ease-out',
};

interface SectionElementEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  element: SectionElement | null;
  sectionKey: string;
  onSave: (element: SectionElement) => void;
  backgroundMedia?: { type: string; url: string; overlayOpacity?: number };
}

const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'];
const fontWeights = ['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold'];
const textTransforms = ['none', 'uppercase', 'lowercase', 'capitalize'];
const letterSpacings = ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'];
const lineHeights = ['none', 'tight', 'snug', 'normal', 'relaxed', 'loose'];
const shadows = ['none', 'sm', 'md', 'lg', 'xl', '2xl'];

const presetColors = [
  { name: 'Primary', value: 'hsl(var(--primary))' },
  { name: 'Secondary', value: 'hsl(var(--secondary))' },
  { name: 'Accent', value: 'hsl(var(--accent))' },
  { name: 'Foreground', value: 'hsl(var(--foreground))' },
  { name: 'Muted', value: 'hsl(var(--muted-foreground))' },
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#000000' },
  { name: 'Gold', value: '#D4AF37' },
  { name: 'Rose', value: '#E91E63' },
  { name: 'Emerald', value: '#10B981' },
];

export const SectionElementEditor = ({
  open,
  onOpenChange,
  element,
  sectionKey,
  onSave,
  backgroundMedia
}: SectionElementEditorProps) => {
  const [editedElement, setEditedElement] = useState<SectionElement | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (element) {
      setEditedElement({ 
        ...element,
        animation: element.animation || defaultAnimation
      });
    }
  }, [element]);

  if (!editedElement) return null;

  const updateStyle = (key: keyof ElementStyle, value: string | number) => {
    setEditedElement(prev => prev ? {
      ...prev,
      style: { ...prev.style, [key]: value }
    } : null);
  };

  const updateAnimation = (key: keyof ElementAnimation, value: string | number) => {
    setEditedElement(prev => prev ? {
      ...prev,
      animation: { ...(prev.animation || defaultAnimation), [key]: value }
    } : null);
  };

  const applyPreset = (preset: typeof stylePresets[0]) => {
    setEditedElement(prev => prev ? {
      ...prev,
      style: { ...preset.style }
    } : null);
  };

  const updateContent = (content: string) => {
    setEditedElement(prev => prev ? { ...prev, content } : null);
  };

  const resetToDefault = () => {
    if (element) {
      setEditedElement({ 
        ...element,
        animation: element.animation || defaultAnimation
      });
    }
  };

  const handleSave = () => {
    if (editedElement) {
      onSave(editedElement);
      onOpenChange(false);
    }
  };

  const playAnimation = () => {
    setIsAnimating(false);
    setTimeout(() => setIsAnimating(true), 50);
  };

  const getAnimationStyle = (): React.CSSProperties => {
    const anim = editedElement.animation || defaultAnimation;
    if (!isAnimating || anim.type === 'none') return {};

    const duration = `${anim.duration}ms`;
    const delay = `${anim.delay}ms`;
    const easing = anim.easing === 'spring' 
      ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
      : anim.easing;

    return {
      animation: `element-${anim.type} ${duration} ${easing} ${delay} forwards`,
    };
  };

  const getPreviewStyle = (): React.CSSProperties => {
    const style = editedElement.style;
    return {
      fontSize: style.fontSize ? `var(--text-${style.fontSize})` : undefined,
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

  const getFontSizeClass = (size: string) => {
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
    return sizes[size] || '1rem';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Edit - {editedElement.type.charAt(0).toUpperCase() + editedElement.type.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Editor Panel */}
          <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-2 sm:px-4 pt-2 overflow-x-auto">
                <TabsList className="grid w-full min-w-[300px] grid-cols-5">
                  <TabsTrigger value="presets" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-2">
                    <Wand2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Presets</span>
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-2">
                    <Type className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Content</span>
                  </TabsTrigger>
                  <TabsTrigger value="typography" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-2">
                    <Layout className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Type</span>
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-2">
                    <Palette className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Style</span>
                  </TabsTrigger>
                  <TabsTrigger value="animation" className="flex items-center gap-1 text-xs sm:text-sm px-1 sm:px-2">
                    <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Animate</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 px-3 sm:px-4 pb-4 max-h-[40vh] lg:max-h-[60vh]">
                {/* Presets Tab */}
                <TabsContent value="presets" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      Style Templates
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Click to apply a preset style instantly
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {stylePresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        className="group relative p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm">{preset.name}</span>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {preset.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                            Apply
                          </Badge>
                        </div>
                        {/* Mini preview */}
                        <div 
                          className="mt-2 p-2 rounded bg-background/50 text-center truncate"
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: preset.style.fontWeight === 'bold' ? 700 : 
                                        preset.style.fontWeight === 'extrabold' ? 800 :
                                        preset.style.fontWeight === 'semibold' ? 600 :
                                        preset.style.fontWeight === 'light' ? 300 : 400,
                            letterSpacing: preset.style.letterSpacing === 'wider' ? '0.05em' :
                                          preset.style.letterSpacing === 'widest' ? '0.1em' : 'normal',
                            textTransform: preset.style.textTransform as any,
                            color: preset.style.color,
                            backgroundColor: preset.style.backgroundColor,
                            borderRadius: preset.style.borderRadius,
                          }}
                        >
                          {editedElement.content || 'Preview'}
                        </div>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Text Content</Label>
                    {editedElement.type === 'description' ? (
                      <Textarea
                        value={editedElement.content}
                        onChange={(e) => updateContent(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                    ) : (
                      <Input
                        value={editedElement.content}
                        onChange={(e) => updateContent(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Text Alignment</Label>
                    <div className="flex gap-1">
                      {[
                        { value: 'left', icon: AlignLeft },
                        { value: 'center', icon: AlignCenter },
                        { value: 'right', icon: AlignRight },
                      ].map(({ value, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={editedElement.style.textAlign === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateStyle('textAlign', value)}
                        >
                          <Icon className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Style</Label>
                    <div className="flex gap-1">
                      <Button
                        variant={editedElement.style.fontWeight === 'bold' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStyle('fontWeight', editedElement.style.fontWeight === 'bold' ? 'normal' : 'bold')}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={editedElement.style.fontStyle === 'italic' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStyle('fontStyle', editedElement.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={editedElement.style.textDecoration === 'underline' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateStyle('textDecoration', editedElement.style.textDecoration === 'underline' ? 'none' : 'underline')}
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="typography" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select
                      value={editedElement.style.fontSize || 'base'}
                      onValueChange={(v) => updateStyle('fontSize', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontSizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size.toUpperCase()} ({getFontSizeClass(size)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Font Weight</Label>
                    <Select
                      value={editedElement.style.fontWeight || 'normal'}
                      onValueChange={(v) => updateStyle('fontWeight', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontWeights.map((weight) => (
                          <SelectItem key={weight} value={weight}>
                            {weight.charAt(0).toUpperCase() + weight.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Text Transform</Label>
                    <Select
                      value={editedElement.style.textTransform || 'none'}
                      onValueChange={(v) => updateStyle('textTransform', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {textTransforms.map((transform) => (
                          <SelectItem key={transform} value={transform}>
                            {transform.charAt(0).toUpperCase() + transform.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Letter Spacing</Label>
                    <Select
                      value={editedElement.style.letterSpacing || 'normal'}
                      onValueChange={(v) => updateStyle('letterSpacing', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {letterSpacings.map((spacing) => (
                          <SelectItem key={spacing} value={spacing}>
                            {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Line Height</Label>
                    <Select
                      value={editedElement.style.lineHeight || 'normal'}
                      onValueChange={(v) => updateStyle('lineHeight', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {lineHeights.map((height) => (
                          <SelectItem key={height} value={height}>
                            {height.charAt(0).toUpperCase() + height.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {presetColors.map((color) => (
                        <button
                          key={color.name}
                          className={`h-8 w-full rounded border-2 transition-all ${
                            editedElement.style.color === color.value 
                              ? 'border-primary ring-2 ring-primary/30' 
                              : 'border-border hover:border-primary/50'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => updateStyle('color', color.value)}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <Input
                      type="text"
                      placeholder="Custom color (hex or hsl)"
                      value={editedElement.style.color || ''}
                      onChange={(e) => updateStyle('color', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Text Shadow</Label>
                    <Select
                      value={editedElement.style.shadow || 'none'}
                      onValueChange={(v) => updateStyle('shadow', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shadows.map((shadow) => (
                          <SelectItem key={shadow} value={shadow}>
                            {shadow === 'none' ? 'None' : shadow.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Opacity ({Math.round((editedElement.style.opacity ?? 1) * 100)}%)</Label>
                    <Slider
                      value={[(editedElement.style.opacity ?? 1) * 100]}
                      onValueChange={([v]) => updateStyle('opacity', v / 100)}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!editedElement.style.backgroundColor}
                        onCheckedChange={(checked) => 
                          updateStyle('backgroundColor', checked ? 'rgba(0,0,0,0.5)' : '')
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {editedElement.style.backgroundColor ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    {editedElement.style.backgroundColor && (
                      <Input
                        type="text"
                        placeholder="Background color"
                        value={editedElement.style.backgroundColor}
                        onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Padding</Label>
                    <Select
                      value={editedElement.style.padding || '0'}
                      onValueChange={(v) => updateStyle('padding', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="0.25rem">XS (4px)</SelectItem>
                        <SelectItem value="0.5rem">SM (8px)</SelectItem>
                        <SelectItem value="0.75rem">MD (12px)</SelectItem>
                        <SelectItem value="1rem">LG (16px)</SelectItem>
                        <SelectItem value="1.5rem">XL (24px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Border Radius</Label>
                    <Select
                      value={editedElement.style.borderRadius || '0'}
                      onValueChange={(v) => updateStyle('borderRadius', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        <SelectItem value="0.25rem">SM</SelectItem>
                        <SelectItem value="0.375rem">MD</SelectItem>
                        <SelectItem value="0.5rem">LG</SelectItem>
                        <SelectItem value="0.75rem">XL</SelectItem>
                        <SelectItem value="9999px">Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Animation Tab */}
                <TabsContent value="animation" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Animation Effect
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {animationTypes.map((anim) => (
                        <button
                          key={anim.value}
                          onClick={() => updateAnimation('type', anim.value)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            editedElement.animation?.type === anim.value
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="text-xs font-medium">{anim.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Duration ({editedElement.animation?.duration || 500}ms)</Label>
                    <Slider
                      value={[editedElement.animation?.duration || 500]}
                      onValueChange={([v]) => updateAnimation('duration', v)}
                      min={100}
                      max={2000}
                      step={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Delay ({editedElement.animation?.delay || 0}ms)</Label>
                    <Slider
                      value={[editedElement.animation?.delay || 0]}
                      onValueChange={([v]) => updateAnimation('delay', v)}
                      min={0}
                      max={2000}
                      step={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Easing</Label>
                    <Select
                      value={editedElement.animation?.easing || 'ease-out'}
                      onValueChange={(v) => updateAnimation('easing', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {easingOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={playAnimation}
                    disabled={editedElement.animation?.type === 'none'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Preview Animation
                  </Button>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Live Preview Panel - Hidden on mobile, shown on lg screens */}
          <div className="hidden lg:flex w-1/2 flex-col overflow-hidden">
            <div className="px-4 py-2 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Live Preview</span>
              </div>
              {editedElement.animation?.type !== 'none' && (
                <Button variant="ghost" size="sm" onClick={playAnimation}>
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Replay
                </Button>
              )}
            </div>
            
            <div className="flex-1 relative overflow-hidden">
              {/* Animation keyframes */}
              <style>{`
                @keyframes element-fade {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes element-slide-up {
                  from { opacity: 0; transform: translateY(30px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes element-slide-down {
                  from { opacity: 0; transform: translateY(-30px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes element-slide-left {
                  from { opacity: 0; transform: translateX(30px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                @keyframes element-slide-right {
                  from { opacity: 0; transform: translateX(-30px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                @keyframes element-scale {
                  from { opacity: 0; transform: scale(0.8); }
                  to { opacity: 1; transform: scale(1); }
                }
                @keyframes element-bounce {
                  0% { opacity: 0; transform: translateY(-20px); }
                  50% { transform: translateY(10px); }
                  70% { transform: translateY(-5px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes element-rotate {
                  from { opacity: 0; transform: rotate(-10deg) scale(0.9); }
                  to { opacity: 1; transform: rotate(0) scale(1); }
                }
              `}</style>

              {/* Background simulation */}
              {backgroundMedia?.type === 'video' && backgroundMedia.url ? (
                <video
                  src={backgroundMedia.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : backgroundMedia?.type === 'image' && backgroundMedia.url ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${backgroundMedia.url})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-background to-muted" />
              )}
              
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: (backgroundMedia?.overlayOpacity ?? 50) / 100 }}
              />
              
              {/* Element Preview */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div
                  key={isAnimating ? 'animating' : 'static'}
                  className="transition-all duration-200"
                  style={{
                    ...getPreviewStyle(),
                    ...getAnimationStyle(),
                    fontSize: getFontSizeClass(editedElement.style.fontSize || 'base'),
                  }}
                >
                  {editedElement.content || 'Preview Text'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 border-t flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={resetToDefault} className="w-full sm:w-auto" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
