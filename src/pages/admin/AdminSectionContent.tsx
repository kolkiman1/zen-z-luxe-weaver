import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Type, GripVertical, Eye, EyeOff } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useSectionContent, useUpdateSectionContent, SectionContent, defaultSectionContent } from '@/hooks/useSectionContent';
import { useSectionOrder, useUpdateSectionOrder, SectionOrderItem, defaultSectionOrder } from '@/hooks/useSectionOrder';

interface SortableItemProps {
  item: SectionOrderItem;
  onToggle: (id: string, enabled: boolean) => void;
}

const SortableItem = ({ item, onToggle }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 sm:p-4 bg-card border border-border rounded-lg ${isDragging ? 'shadow-lg' : ''}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </button>
      <span className="flex-1 font-medium text-sm sm:text-base">{item.label}</span>
      <div className="flex items-center gap-2">
        {item.enabled ? (
          <Eye className="w-4 h-4 text-primary" />
        ) : (
          <EyeOff className="w-4 h-4 text-muted-foreground" />
        )}
        <Switch
          checked={item.enabled}
          onCheckedChange={(checked) => onToggle(item.id, checked)}
          disabled={item.id === 'hero'}
        />
      </div>
    </div>
  );
};

const AdminSectionContent = () => {
  const { data: sectionContent, isLoading: contentLoading } = useSectionContent();
  const { data: sectionOrder, isLoading: orderLoading } = useSectionOrder();
  const updateContentMutation = useUpdateSectionContent();
  const updateOrderMutation = useUpdateSectionOrder();

  const [localContent, setLocalContent] = useState<SectionContent>(defaultSectionContent);
  const [localOrder, setLocalOrder] = useState<SectionOrderItem[]>(defaultSectionOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (sectionContent) setLocalContent(sectionContent);
  }, [sectionContent]);

  useEffect(() => {
    if (sectionOrder) setLocalOrder(sectionOrder);
  }, [sectionOrder]);

  const handleContentChange = (section: keyof SectionContent, field: string, value: string) => {
    setLocalContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleFeatureChange = (index: number, field: 'title' | 'description', value: string) => {
    setLocalContent(prev => ({
      ...prev,
      features: {
        ...prev.features,
        items: prev.features.items.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        ),
      },
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalOrder(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggle = (id: string, enabled: boolean) => {
    setLocalOrder(items => items.map(item => item.id === id ? { ...item, enabled } : item));
  };

  const handleSaveContent = async () => {
    try {
      await updateContentMutation.mutateAsync(localContent);
      toast.success('Section content saved!');
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  const handleSaveOrder = async () => {
    try {
      await updateOrderMutation.mutateAsync(localOrder);
      toast.success('Section order saved!');
    } catch (error) {
      toast.error('Failed to save order');
    }
  };

  if (contentLoading || orderLoading) {
    return (
      <AdminLayout title="Section Content">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Section Content">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Section Content & Order</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Edit text, headlines, and reorder homepage sections
            </p>
          </div>
        </div>

        <Tabs defaultValue="order" className="w-full">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 p-1 bg-muted/50">
            <TabsTrigger value="order" className="flex-1 min-w-[100px] text-xs sm:text-sm py-2">
              Section Order
            </TabsTrigger>
            <TabsTrigger value="hero" className="flex-1 min-w-[100px] text-xs sm:text-sm py-2">
              Hero
            </TabsTrigger>
            <TabsTrigger value="features" className="flex-1 min-w-[100px] text-xs sm:text-sm py-2">
              Features
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex-1 min-w-[100px] text-xs sm:text-sm py-2">
              Other Sections
            </TabsTrigger>
          </TabsList>

          {/* Section Order Tab */}
          <TabsContent value="order" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-primary" />
                  Homepage Section Order
                </CardTitle>
                <CardDescription>Drag to reorder sections. Toggle visibility with the switch.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={localOrder.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {localOrder.map(item => (
                      <SortableItem key={item.id} item={item} onToggle={handleToggle} />
                    ))}
                  </SortableContext>
                </DndContext>
                <Button onClick={handleSaveOrder} disabled={updateOrderMutation.isPending} className="w-full mt-4 gap-2">
                  {updateOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Order
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Content Tab */}
          <TabsContent value="hero" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  Hero Section Content
                </CardTitle>
                <CardDescription>Edit the main landing section text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Badge Text</Label>
                    <Input
                      value={localContent.hero.badgeText}
                      onChange={e => handleContentChange('hero', 'badgeText', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline</Label>
                    <Input
                      value={localContent.hero.tagline}
                      onChange={e => handleContentChange('hero', 'tagline', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input
                      value={localContent.hero.headline}
                      onChange={e => handleContentChange('hero', 'headline', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Highlight (Gold text)</Label>
                    <Input
                      value={localContent.hero.headlineHighlight}
                      onChange={e => handleContentChange('hero', 'headlineHighlight', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={localContent.hero.description}
                    onChange={e => handleContentChange('hero', 'description', e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleSaveContent} disabled={updateContentMutation.isPending} className="w-full gap-2">
                  {updateContentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Features Bar</CardTitle>
                <CardDescription>Edit the 4 feature cards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {localContent.features.items.map((item, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                    <div className="space-y-2">
                      <Label>Title {index + 1}</Label>
                      <Input
                        value={item.title}
                        onChange={e => handleFeatureChange(index, 'title', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={e => handleFeatureChange(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={handleSaveContent} disabled={updateContentMutation.isPending} className="w-full gap-2">
                  {updateContentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Content
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Sections Tab */}
          <TabsContent value="sections" className="mt-6 space-y-6">
            {/* New Arrivals */}
            <Card>
              <CardHeader>
                <CardTitle>New Arrivals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input value={localContent.newArrivals.headline} onChange={e => handleContentChange('newArrivals', 'headline', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Highlight</Label>
                    <Input value={localContent.newArrivals.headlineHighlight} onChange={e => handleContentChange('newArrivals', 'headlineHighlight', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={localContent.newArrivals.description} onChange={e => handleContentChange('newArrivals', 'description', e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input value={localContent.categories.headline} onChange={e => handleContentChange('categories', 'headline', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Highlight</Label>
                    <Input value={localContent.categories.headlineHighlight} onChange={e => handleContentChange('categories', 'headlineHighlight', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={localContent.categories.description} onChange={e => handleContentChange('categories', 'description', e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Featured Products */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={localContent.featuredProducts.tagline} onChange={e => handleContentChange('featuredProducts', 'tagline', e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input value={localContent.featuredProducts.headline} onChange={e => handleContentChange('featuredProducts', 'headline', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Highlight</Label>
                    <Input value={localContent.featuredProducts.headlineHighlight} onChange={e => handleContentChange('featuredProducts', 'headlineHighlight', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={localContent.featuredProducts.description} onChange={e => handleContentChange('featuredProducts', 'description', e.target.value)} />
                </div>
              </CardContent>
            </Card>

            {/* Brand Banner */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Banner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input value={localContent.brandBanner.tagline} onChange={e => handleContentChange('brandBanner', 'tagline', e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input value={localContent.brandBanner.headline} onChange={e => handleContentChange('brandBanner', 'headline', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Headline Highlight</Label>
                    <Input value={localContent.brandBanner.headlineHighlight} onChange={e => handleContentChange('brandBanner', 'headlineHighlight', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={localContent.brandBanner.description} onChange={e => handleContentChange('brandBanner', 'description', e.target.value)} rows={3} />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveContent} disabled={updateContentMutation.isPending} className="w-full gap-2">
              {updateContentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All Content
            </Button>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSectionContent;
