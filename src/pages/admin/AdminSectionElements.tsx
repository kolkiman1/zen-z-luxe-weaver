import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Edit3, 
  Eye, 
  Save, 
  RotateCcw, 
  Type, 
  Sparkles,
  Layout,
  ImageIcon,
  ShoppingBag,
  Star,
  Layers
} from 'lucide-react';
import { useSectionElements, useUpdateSectionElements, defaultSectionElements } from '@/hooks/useSectionElements';
import { useSectionMedia } from '@/hooks/useSectionMedia';
import { SectionElementEditor, SectionElement } from '@/components/admin/SectionElementEditor';
import { SectionElementPreview } from '@/components/admin/SectionElementPreview';

const sectionConfig = {
  hero: { 
    title: 'Hero Section', 
    description: 'Main landing banner with headline and CTA',
    icon: Layout,
    color: 'bg-purple-500'
  },
  categories: { 
    title: 'Categories Section', 
    description: 'Browse by category section',
    icon: Layers,
    color: 'bg-blue-500'
  },
  featuredProducts: { 
    title: 'Featured Products', 
    description: 'Highlighted product showcase',
    icon: Star,
    color: 'bg-amber-500'
  },
  newArrivals: { 
    title: 'New Arrivals', 
    description: 'Latest product additions',
    icon: ShoppingBag,
    color: 'bg-green-500'
  },
  brandBanner: { 
    title: 'Brand Banner', 
    description: 'Brand messaging section',
    icon: ImageIcon,
    color: 'bg-rose-500'
  },
};

export default function AdminSectionElements() {
  const { data: elements, isLoading: elementsLoading } = useSectionElements();
  const { data: media } = useSectionMedia();
  const updateElements = useUpdateSectionElements();
  
  const [editedElements, setEditedElements] = useState<typeof elements | null>(null);
  const [editingElement, setEditingElement] = useState<{ sectionKey: string; element: SectionElement } | null>(null);
  const [previewSection, setPreviewSection] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const currentElements = editedElements || elements || defaultSectionElements;

  const handleEditElement = (sectionKey: string, element: SectionElement) => {
    setEditingElement({ sectionKey, element });
  };

  const handleSaveElement = (updatedElement: SectionElement) => {
    if (!editingElement) return;

    const sectionKey = editingElement.sectionKey as keyof typeof currentElements;
    const updatedSectionElements = currentElements[sectionKey].map(el =>
      el.id === updatedElement.id ? updatedElement : el
    );

    const newElements = {
      ...currentElements,
      [sectionKey]: updatedSectionElements,
    };

    setEditedElements(newElements);
    setHasChanges(true);
    setEditingElement(null);
    toast.success('Element updated');
  };

  const handleSaveAll = async () => {
    if (!editedElements) return;

    try {
      await updateElements.mutateAsync(editedElements);
      setHasChanges(false);
      toast.success('All changes saved successfully');
    } catch (error) {
      toast.error('Failed to save changes');
    }
  };

  const handleResetSection = (sectionKey: string) => {
    const defaultSection = defaultSectionElements[sectionKey as keyof typeof defaultSectionElements];
    const newElements = {
      ...currentElements,
      [sectionKey]: defaultSection,
    };
    setEditedElements(newElements);
    setHasChanges(true);
    toast.info(`${sectionConfig[sectionKey as keyof typeof sectionConfig].title} reset to defaults`);
  };

  const getElementTypeLabel = (type: SectionElement['type']) => {
    const labels: Record<SectionElement['type'], string> = {
      heading: 'Heading',
      subheading: 'Subheading',
      description: 'Description',
      badge: 'Badge',
      button: 'Button',
      link: 'Link',
    };
    return labels[type];
  };

  const getElementTypeColor = (type: SectionElement['type']) => {
    const colors: Record<SectionElement['type'], string> = {
      heading: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      subheading: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      description: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      button: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      link: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    };
    return colors[type];
  };

  if (elementsLoading) {
    return (
      <AdminLayout title="Section Elements">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Section Elements">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Type className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Section Elements</h1>
              <p className="text-muted-foreground">Edit text, typography, and styling for each section</p>
            </div>
          </div>
          
          {hasChanges && (
            <Button onClick={handleSaveAll} disabled={updateElements.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateElements.isPending ? 'Saving...' : 'Save All Changes'}
            </Button>
          )}
        </div>

        {/* Section Cards */}
        <div className="grid gap-6">
          {Object.entries(sectionConfig).map(([key, config]) => {
            const Icon = config.icon;
            const sectionElements = currentElements[key as keyof typeof currentElements] || [];
            const sectionMedia = media?.[key as keyof typeof media];

            return (
              <Card key={key} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{config.title}</CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewSection(key)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Preview
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResetSection(key)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1.5" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <Separator />
                
                <CardContent className="pt-4">
                  <ScrollArea className="max-h-[400px]">
                    <div className="space-y-3">
                      {sectionElements.map((element) => (
                        <div
                          key={element.id}
                          className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Badge variant="secondary" className={getElementTypeColor(element.type)}>
                              {getElementTypeLabel(element.type)}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {element.content || 'Empty content'}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>Size: {element.style.fontSize || 'base'}</span>
                                <span>•</span>
                                <span>Weight: {element.style.fontWeight || 'normal'}</span>
                                {element.style.textTransform && element.style.textTransform !== 'none' && (
                                  <>
                                    <span>•</span>
                                    <span>Transform: {element.style.textTransform}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditElement(key, element)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit3 className="h-4 w-4 mr-1.5" />
                            Edit
                          </Button>
                        </div>
                      ))}
                      
                      {sectionElements.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No elements configured for this section</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Element Editor Modal */}
      {editingElement && (
        <SectionElementEditor
          open={!!editingElement}
          onOpenChange={() => setEditingElement(null)}
          element={editingElement.element}
          sectionKey={editingElement.sectionKey}
          onSave={handleSaveElement}
          backgroundMedia={media?.[editingElement.sectionKey as keyof typeof media]}
        />
      )}

      {/* Section Preview Modal */}
      {previewSection && (
        <SectionElementPreview
          open={!!previewSection}
          onOpenChange={() => setPreviewSection(null)}
          sectionKey={previewSection}
          elements={currentElements[previewSection as keyof typeof currentElements] || []}
          media={media?.[previewSection as keyof typeof media]}
        />
      )}
    </AdminLayout>
  );
}
