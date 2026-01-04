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
  Sparkles
} from 'lucide-react';

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
}

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

  useEffect(() => {
    if (element) {
      setEditedElement({ ...element });
    }
  }, [element]);

  if (!editedElement) return null;

  const updateStyle = (key: keyof ElementStyle, value: string | number) => {
    setEditedElement(prev => prev ? {
      ...prev,
      style: { ...prev.style, [key]: value }
    } : null);
  };

  const updateContent = (content: string) => {
    setEditedElement(prev => prev ? { ...prev, content } : null);
  };

  const resetToDefault = () => {
    if (element) {
      setEditedElement({ ...element });
    }
  };

  const handleSave = () => {
    if (editedElement) {
      onSave(editedElement);
      onOpenChange(false);
    }
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
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Edit Element - {editedElement.type.charAt(0).toUpperCase() + editedElement.type.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Editor Panel */}
          <div className="w-1/2 border-r overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="mx-4 mt-2 grid w-auto grid-cols-3">
                <TabsTrigger value="content" className="flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="typography" className="flex items-center gap-1.5">
                  <Layout className="h-3.5 w-3.5" />
                  Typography
                </TabsTrigger>
                <TabsTrigger value="style" className="flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5" />
                  Style
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-4 pb-4">
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
              </ScrollArea>
            </Tabs>
          </div>

          {/* Live Preview Panel */}
          <div className="w-1/2 flex flex-col overflow-hidden">
            <div className="px-4 py-2 border-b flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Live Preview</span>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
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
                  className="transition-all duration-200"
                  style={{
                    ...getPreviewStyle(),
                    fontSize: getFontSizeClass(editedElement.style.fontSize || 'base'),
                  }}
                >
                  {editedElement.content || 'Preview Text'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={resetToDefault}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
