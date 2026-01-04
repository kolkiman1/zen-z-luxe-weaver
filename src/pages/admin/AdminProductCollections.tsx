import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Plus, Trash2, Package, Tag, Grid, List, ShoppingBag, Copy, ToggleLeft, ToggleRight, CheckSquare } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useProductCollections, useUpdateProductCollections, ProductCollection, defaultCollections } from '@/hooks/useProductCollections';

const AdminProductCollections = () => {
  const { data: collections, isLoading } = useProductCollections();
  const updateMutation = useUpdateProductCollections();

  const [localCollections, setLocalCollections] = useState<ProductCollection[]>(defaultCollections);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (collections) setLocalCollections(collections);
  }, [collections]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === localCollections.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(localCollections.map(c => c.id)));
    }
  };

  const bulkEnable = () => {
    setLocalCollections(prev => prev.map(c => 
      selectedIds.has(c.id) ? { ...c, enabled: true } : c
    ));
    toast.success(`${selectedIds.size} collection(s) enabled`);
  };

  const bulkDisable = () => {
    setLocalCollections(prev => prev.map(c => 
      selectedIds.has(c.id) ? { ...c, enabled: false } : c
    ));
    toast.success(`${selectedIds.size} collection(s) disabled`);
  };

  const bulkDelete = () => {
    const deletableIds = [...selectedIds].filter(id => !['best-sellers', 'on-sale'].includes(id));
    if (deletableIds.length === 0) {
      toast.error('Cannot delete default collections');
      return;
    }
    setLocalCollections(prev => prev.filter(c => !deletableIds.includes(c.id)));
    setSelectedIds(new Set());
    toast.success(`${deletableIds.length} collection(s) deleted`);
  };

  const hasSelection = selectedIds.size > 0;

  const handleChange = (id: string, field: keyof ProductCollection, value: any) => {
    setLocalCollections(prev => prev.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleAddCollection = () => {
    const newCollection: ProductCollection = {
      id: `collection-${Date.now()}`,
      name: 'New Collection',
      slug: `new-collection-${Date.now()}`,
      description: 'Collection description',
      filterType: 'manual',
      enabled: false,
      displayStyle: 'carousel',
      maxProducts: 8,
      productIds: [],
    };
    setLocalCollections([...localCollections, newCollection]);
  };

  const handleDeleteCollection = (id: string) => {
    // Don't allow deleting default collections
    if (['best-sellers', 'on-sale'].includes(id)) {
      toast.error('Cannot delete default collections');
      return;
    }
    setLocalCollections(prev => prev.filter(c => c.id !== id));
  };

  const handleDuplicateCollection = (collection: ProductCollection) => {
    const newCollection: ProductCollection = {
      ...collection,
      id: `collection-${Date.now()}`,
      name: `${collection.name} (Copy)`,
      slug: `${collection.slug}-copy-${Date.now()}`,
      enabled: false,
    };
    setLocalCollections([...localCollections, newCollection]);
    toast.success('Collection duplicated! Don\'t forget to save.');
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(localCollections);
      toast.success('Collections saved successfully!');
    } catch (error) {
      toast.error('Failed to save collections');
    }
  };

  const filterTypeLabels: Record<string, string> = {
    manual: 'Manual Selection',
    on_sale: 'On Sale Products',
    best_sellers: 'Best Sellers (Featured)',
    new: 'New Arrivals',
    category: 'By Category',
  };

  if (isLoading) {
    return (
      <AdminLayout title="Product Collections">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Product Collections">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold">Product Collections</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Create dynamic product sections for your homepage
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddCollection} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Collection
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <Card className="border-dashed">
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
                className="gap-2"
              >
                <CheckSquare className="w-4 h-4" />
                {selectedIds.size === localCollections.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              {hasSelection && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.size} selected
                  </span>
                  <div className="h-4 w-px bg-border" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkEnable}
                    className="gap-2 text-green-600 hover:text-green-700"
                  >
                    <ToggleRight className="w-4 h-4" />
                    Enable
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkDisable}
                    className="gap-2 text-amber-600 hover:text-amber-700"
                  >
                    <ToggleLeft className="w-4 h-4" />
                    Disable
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkDelete}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {localCollections.map((collection) => (
            <Card key={collection.id} className={selectedIds.has(collection.id) ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedIds.has(collection.id)}
                      onCheckedChange={() => toggleSelection(collection.id)}
                      className="mt-1"
                    />
                    <div className={`p-2 rounded-lg ${collection.enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{collection.name}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {filterTypeLabels[collection.filterType]}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`enabled-${collection.id}`} className="text-xs text-muted-foreground">
                        Active
                      </Label>
                      <Switch
                        id={`enabled-${collection.id}`}
                        checked={collection.enabled}
                        onCheckedChange={(checked) => handleChange(collection.id, 'enabled', checked)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => handleDuplicateCollection(collection)}
                      title="Duplicate collection"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {!['best-sellers', 'on-sale'].includes(collection.id) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteCollection(collection.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Collection Name</Label>
                    <Input
                      value={collection.name}
                      onChange={(e) => handleChange(collection.id, 'name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL Slug</Label>
                    <Input
                      value={collection.slug}
                      onChange={(e) => handleChange(collection.id, 'slug', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={collection.description}
                    onChange={(e) => handleChange(collection.id, 'description', e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Filter Type</Label>
                    <Select
                      value={collection.filterType}
                      onValueChange={(value) => handleChange(collection.id, 'filterType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_sale">
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            On Sale
                          </div>
                        </SelectItem>
                        <SelectItem value="best_sellers">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Best Sellers
                          </div>
                        </SelectItem>
                        <SelectItem value="new">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            New Arrivals
                          </div>
                        </SelectItem>
                        <SelectItem value="category">By Category</SelectItem>
                        <SelectItem value="manual">Manual Selection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Display Style</Label>
                    <Select
                      value={collection.displayStyle}
                      onValueChange={(value: 'carousel' | 'grid') => handleChange(collection.id, 'displayStyle', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carousel">
                          <div className="flex items-center gap-2">
                            <List className="w-4 h-4" />
                            Carousel
                          </div>
                        </SelectItem>
                        <SelectItem value="grid">
                          <div className="flex items-center gap-2">
                            <Grid className="w-4 h-4" />
                            Grid
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Products</Label>
                    <Input
                      type="number"
                      min={1}
                      max={20}
                      value={collection.maxProducts}
                      onChange={(e) => handleChange(collection.id, 'maxProducts', parseInt(e.target.value) || 8)}
                    />
                  </div>
                </div>

                {collection.filterType === 'category' && (
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={collection.filterValue || ''}
                      onValueChange={(value) => handleChange(collection.id, 'filterValue', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="jewelry">Jewelry</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {localCollections.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-medium text-lg mb-1">No Collections</h3>
              <p className="text-muted-foreground text-sm mb-4">Create your first product collection</p>
              <Button onClick={handleAddCollection} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Collection
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default AdminProductCollections;
