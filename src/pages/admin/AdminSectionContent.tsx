import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Type, GripVertical, Eye, EyeOff, Calendar, Plus, Clock, Undo2, Redo2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import AdminLayout from '@/components/admin/AdminLayout';
import HomepagePreview from '@/components/admin/HomepagePreview';
import SectionContentPreview from '@/components/admin/SectionContentPreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { useSectionContent, useUpdateSectionContent, SectionContent, defaultSectionContent } from '@/hooks/useSectionContent';
import { useSectionOrder, useUpdateSectionOrder, SectionOrderItem, defaultSectionOrder } from '@/hooks/useSectionOrder';
import { useProductCollections } from '@/hooks/useProductCollections';
import { useSectionMedia } from '@/hooks/useSectionMedia';

type ContentSectionKey = 'hero' | 'newArrivals' | 'categories' | 'featuredProducts' | 'brandBanner';

// Custom hook for undo/redo functionality
const useUndoRedo = <T,>(initialState: T) => {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    const actualNewState = typeof newState === 'function' 
      ? (newState as (prev: T) => T)(history[currentIndex])
      : newState;
    
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(actualNewState);
    // Limit history to 50 items
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  return { state: currentState, setState, undo, redo, canUndo, canRedo, reset };
};

interface SortableItemProps {
  item: SectionOrderItem;
  onToggle: (id: string, enabled: boolean) => void;
  onScheduleChange: (id: string, startDate: string | null, endDate: string | null) => void;
}

const SortableItem = ({ item, onToggle, onScheduleChange }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id + (item.collectionId || '') });
  const [showSchedule, setShowSchedule] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasSchedule = item.startDate || item.endDate;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-2 p-3 sm:p-4 bg-card border border-border rounded-lg ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="flex-1 font-medium text-sm sm:text-base">{item.label}</span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSchedule(!showSchedule)}
            className={`p-1.5 rounded hover:bg-muted transition-colors ${hasSchedule ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          {item.enabled ? (
            <Eye className="w-4 h-4 text-primary" />
          ) : (
            <EyeOff className="w-4 h-4 text-muted-foreground" />
          )}
          <Switch
            checked={item.enabled}
            onCheckedChange={(checked) => onToggle(item.id + (item.collectionId || ''), checked)}
            disabled={item.id === 'hero'}
          />
        </div>
      </div>
      
      {/* Schedule Settings */}
      {showSchedule && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }} 
          animate={{ height: 'auto', opacity: 1 }}
          className="pt-3 mt-2 border-t border-border"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left text-xs">
                    {item.startDate ? format(new Date(item.startDate), 'PPP') : 'Not set'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={item.startDate ? new Date(item.startDate) : undefined}
                    onSelect={(date) => onScheduleChange(item.id + (item.collectionId || ''), date?.toISOString() || null, item.endDate || null)}
                  />
                  {item.startDate && (
                    <div className="p-2 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => onScheduleChange(item.id + (item.collectionId || ''), null, item.endDate || null)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left text-xs">
                    {item.endDate ? format(new Date(item.endDate), 'PPP') : 'Not set'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={item.endDate ? new Date(item.endDate) : undefined}
                    onSelect={(date) => onScheduleChange(item.id + (item.collectionId || ''), item.startDate || null, date?.toISOString() || null)}
                  />
                  {item.endDate && (
                    <div className="p-2 border-t">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => onScheduleChange(item.id + (item.collectionId || ''), item.startDate || null, null)}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {hasSchedule && (
            <p className="text-[10px] text-muted-foreground mt-2">
              This section will only show during the scheduled period
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
};

const AdminSectionContent = () => {
  const { data: sectionContent, isLoading: contentLoading } = useSectionContent();
  const { data: sectionOrder, isLoading: orderLoading } = useSectionOrder();
  const { data: collections } = useProductCollections();
  const { data: sectionMedia } = useSectionMedia();
  const updateContentMutation = useUpdateSectionContent();
  const updateOrderMutation = useUpdateSectionOrder();

  const [localContent, setLocalContent] = useState<SectionContent>(defaultSectionContent);
  const [previewSection, setPreviewSection] = useState<ContentSectionKey | null>(null);
  
  // Use undo/redo for section order
  const { 
    state: localOrder, 
    setState: setLocalOrder, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    reset: resetOrderHistory 
  } = useUndoRedo<SectionOrderItem[]>(defaultSectionOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (sectionContent) setLocalContent(sectionContent);
  }, [sectionContent]);

  useEffect(() => {
    if (sectionOrder) resetOrderHistory(sectionOrder);
  }, [sectionOrder, resetOrderHistory]);

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
        const oldIndex = items.findIndex(i => (i.id + (i.collectionId || '')) === active.id);
        const newIndex = items.findIndex(i => (i.id + (i.collectionId || '')) === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleToggle = (uniqueId: string, enabled: boolean) => {
    setLocalOrder(items => items.map(item => 
      (item.id + (item.collectionId || '')) === uniqueId ? { ...item, enabled } : item
    ));
  };

  const handleScheduleChange = (uniqueId: string, startDate: string | null, endDate: string | null) => {
    setLocalOrder(items => items.map(item => 
      (item.id + (item.collectionId || '')) === uniqueId 
        ? { ...item, startDate, endDate } 
        : item
    ));
  };

  const handleAddCollection = (collectionId: string) => {
    const collection = collections?.find(c => c.id === collectionId);
    if (collection) {
      const newSection: SectionOrderItem = {
        id: 'collection',
        label: collection.name,
        enabled: true,
        collectionId: collection.id,
      };
      setLocalOrder([...localOrder, newSection]);
    }
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

  // Get available collections that aren't already added
  const availableCollections = collections?.filter(c => 
    c.enabled && !localOrder.some(item => item.collectionId === c.id)
  ) || [];

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
              Edit text, headlines, reorder, and schedule homepage sections
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
            <div className="grid lg:grid-cols-[1fr_300px] gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-primary" />
                        Homepage Section Order
                      </CardTitle>
                      <CardDescription>
                        Drag to reorder sections. Click the calendar icon to schedule visibility.
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={undo}
                        disabled={!canUndo}
                        title="Undo"
                        className="h-8 w-8"
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={redo}
                        disabled={!canRedo}
                        title="Redo"
                        className="h-8 w-8"
                      >
                        <Redo2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext 
                      items={localOrder.map(i => i.id + (i.collectionId || ''))} 
                      strategy={verticalListSortingStrategy}
                    >
                      {localOrder.map(item => (
                        <SortableItem 
                          key={item.id + (item.collectionId || '')} 
                          item={item} 
                          onToggle={handleToggle}
                          onScheduleChange={handleScheduleChange}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  
                  {/* Add Collection Section */}
                  {availableCollections.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <Label className="text-sm mb-2 block">Add Product Collection</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableCollections.map(collection => (
                          <Button
                            key={collection.id}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddCollection(collection.id)}
                            className="gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            {collection.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button onClick={handleSaveOrder} disabled={updateOrderMutation.isPending} className="w-full mt-4 gap-2">
                    {updateOrderMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Order
                  </Button>
                </CardContent>
              </Card>

              {/* Homepage Preview */}
              <div className="lg:sticky lg:top-4">
                <HomepagePreview 
                  sections={localOrder} 
                  sectionMedia={sectionMedia}
                  sectionContent={localContent}
                  collections={collections}
                  onPreviewClick={() => {
                    sessionStorage.setItem('preview-section-order', JSON.stringify(localOrder));
                    window.open('/?preview=true', '_blank');
                  }}
                />
              </div>
            </div>
          </TabsContent>

          {/* Hero Content Tab */}
          <TabsContent value="hero" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-primary" />
                      Hero Section Content
                    </CardTitle>
                    <CardDescription>Edit the main landing section text</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewSection('hero')}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle>New Arrivals</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewSection('newArrivals')}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle>Categories Section</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewSection('categories')}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle>Featured Products</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewSection('featuredProducts')}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
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
                <div className="flex items-center justify-between">
                  <CardTitle>Brand Banner</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewSection('brandBanner')}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
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

        {/* Content Preview Modal */}
        {previewSection && (
          <SectionContentPreview
            sectionKey={previewSection}
            content={localContent}
            media={sectionMedia}
            open={!!previewSection}
            onOpenChange={(open) => !open && setPreviewSection(null)}
          />
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSectionContent;
