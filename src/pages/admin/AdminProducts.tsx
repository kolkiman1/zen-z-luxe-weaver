import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Loader2, Check } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import ImageUpload from '@/components/admin/ImageUpload';
import ProductPreview from '@/components/admin/ProductPreview';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLog } from '@/hooks/useActivityLog';
import { formatPrice } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

interface ProductColor {
  name: string;
  hex: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  variants: ProductVariant[];
  in_stock: boolean;
  stock_quantity: number;
  is_new: boolean;
  is_featured: boolean;
}

const categories = ['men', 'women', 'jewelry', 'accessories'];
const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const defaultColors: ProductColor[] = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Navy', hex: '#1E3A5F' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Brown', hex: '#92400E' },
  { name: 'Gray', hex: '#6B7280' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Beige', hex: '#F5F5DC' },
];

const AdminProducts = () => {
  const { logActivity } = useActivityLog();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    original_price: '',
    category: 'men',
    images: [] as string[],
    selectedSizes: [] as string[],
    selectedColors: [] as ProductColor[],
    variants: [] as ProductVariant[],
    stock_quantity: '',
    is_new: false,
    is_featured: false,
  });

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const mapped = data.map(p => ({
        ...p,
        colors: parseJsonArray<ProductColor>(p.colors),
        variants: parseJsonArray<ProductVariant>(p.variants),
      }));
      setProducts(mapped as Product[]);
    }
    setLoading(false);
  };

  const parseJsonArray = <T,>(val: Json | null): T[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val as T[];
    return [];
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price.toString(),
        original_price: product.original_price?.toString() || '',
        category: product.category,
        images: product.images || [],
        selectedSizes: product.sizes || [],
        selectedColors: product.colors || [],
        variants: product.variants || [],
        stock_quantity: product.stock_quantity?.toString() || '0',
        is_new: product.is_new || false,
        is_featured: product.is_featured || false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        original_price: '',
        category: 'men',
        images: [],
        selectedSizes: [],
        selectedColors: [],
        variants: [],
        stock_quantity: '0',
        is_new: false,
        is_featured: false,
      });
    }
    setActiveTab('basic');
    setIsDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const toggleSize = (size: string) => {
    const newSizes = formData.selectedSizes.includes(size)
      ? formData.selectedSizes.filter(s => s !== size)
      : [...formData.selectedSizes, size];
    setFormData(prev => ({ ...prev, selectedSizes: newSizes }));
    updateVariantsGrid(newSizes, formData.selectedColors);
  };

  const toggleColor = (color: ProductColor) => {
    const exists = formData.selectedColors.find(c => c.name === color.name);
    const newColors = exists
      ? formData.selectedColors.filter(c => c.name !== color.name)
      : [...formData.selectedColors, color];
    setFormData(prev => ({ ...prev, selectedColors: newColors }));
    updateVariantsGrid(formData.selectedSizes, newColors);
  };

  const updateVariantsGrid = (sizes: string[], colors: ProductColor[]) => {
    if (sizes.length === 0 || colors.length === 0) {
      setFormData(prev => ({ ...prev, variants: [] }));
      return;
    }
    const newVariants: ProductVariant[] = [];
    sizes.forEach(size => {
      colors.forEach(color => {
        const existing = formData.variants.find(v => v.size === size && v.color === color.name);
        newVariants.push({
          size,
          color: color.name,
          stock: existing?.stock ?? 0,
        });
      });
    });
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const updateVariantStock = (size: string, color: string, stock: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        v.size === size && v.color === color ? { ...v, stock } : v
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    const totalVariantStock = formData.variants.reduce((sum, v) => sum + v.stock, 0);
    const effectiveStock = formData.variants.length > 0 ? totalVariantStock : parseInt(formData.stock_quantity) || 0;

    const productData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      category: formData.category,
      images: formData.images,
      sizes: formData.selectedSizes,
      colors: formData.selectedColors as unknown as Json,
      variants: formData.variants as unknown as Json,
      stock_quantity: effectiveStock,
      in_stock: effectiveStock > 0,
      is_new: formData.is_new,
      is_featured: formData.is_featured,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        await logActivity('product_updated', 'product', editingProduct.id, { product_name: formData.name });
        toast.success('Product updated successfully');
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        await logActivity('product_created', 'product', data?.id, { product_name: formData.name });
        toast.success('Product created successfully');
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error('Error saving product', { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const productToDelete = products.find(p => p.id === id);
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting product');
    } else {
      await logActivity('product_deleted', 'product', id, { product_name: productToDelete?.name });
      toast.success('Product deleted');
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPreviewData = () => ({
    name: formData.name,
    price: formData.price,
    original_price: formData.original_price,
    images: formData.images,
    is_new: formData.is_new,
    is_featured: formData.is_featured,
    sizes: formData.selectedSizes.join(', '),
    stock_quantity: formData.variants.length > 0 
      ? formData.variants.reduce((sum, v) => sum + v.stock, 0).toString()
      : formData.stock_quantity,
    category: formData.category,
    description: formData.description,
  });

  return (
    <>
      <Helmet>
        <title>Products | Admin - Gen-zee.store</title>
      </Helmet>

      <AdminLayout title="Products">
        <div className="space-y-4 sm:space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="btn-primary w-full sm:w-auto">
              <Plus size={18} className="mr-2" />
              Add Product
            </Button>
          </div>

          {/* Products Grid/Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-xl border border-border p-4 space-y-3"
                  >
                    <div className="flex gap-3">
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                        <p className="text-primary font-medium">{formatPrice(Number(product.price))}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 flex-wrap">
                        {product.is_new && <Badge className="bg-green-500/20 text-green-500 text-xs">New</Badge>}
                        {product.is_featured && <Badge className="bg-primary/20 text-primary text-xs">Featured</Badge>}
                        <Badge variant={product.in_stock ? 'secondary' : 'destructive'} className="text-xs">
                          {product.stock_quantity} in stock
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                          <Pencil size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-4 font-medium">Product</th>
                        <th className="text-left p-4 font-medium">Category</th>
                        <th className="text-left p-4 font-medium">Price</th>
                        <th className="text-left p-4 font-medium">Variants</th>
                        <th className="text-left p-4 font-medium">Stock</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-right p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product, index) => (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-t border-border hover:bg-secondary/20"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {product.images[0] && (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground">{product.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 capitalize">{product.category}</td>
                          <td className="p-4">
                            <span className="text-primary">{formatPrice(Number(product.price))}</span>
                            {product.original_price && (
                              <span className="text-sm text-muted-foreground line-through ml-2">
                                {formatPrice(Number(product.original_price))}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1">
                              {product.sizes?.slice(0, 3).map(s => (
                                <span key={s} className="px-1.5 py-0.5 bg-secondary rounded text-xs">{s}</span>
                              ))}
                              {(product.sizes?.length || 0) > 3 && (
                                <span className="text-xs text-muted-foreground">+{product.sizes.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">{product.stock_quantity}</td>
                          <td className="p-4">
                            <div className="flex gap-1 flex-wrap">
                              {product.is_new && <Badge className="bg-green-500/20 text-green-500">New</Badge>}
                              {product.is_featured && <Badge className="bg-primary/20 text-primary">Featured</Badge>}
                              {!product.in_stock && <Badge className="bg-red-500/20 text-red-500">Out of Stock</Badge>}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}>
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No products found</p>
                )}
              </div>

              {/* Mobile empty state */}
              {filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8 lg:hidden">No products found</p>
              )}
            </>
          )}
        </div>

        {/* Product Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="variants">Sizes & Colors</TabsTrigger>
              </TabsList>

              <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 py-4">
                <div className="lg:col-span-2">
                  <TabsContent value="basic" className="mt-0 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="Auto-generated from name"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="price">Price (BDT) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="original_price">Original Price</Label>
                        <Input
                          id="original_price"
                          type="number"
                          value={formData.original_price}
                          onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat} value={cat} className="capitalize">
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Product Images</Label>
                      <div className="mt-2">
                        <ImageUpload
                          images={formData.images}
                          onImagesChange={(images) => setFormData({ ...formData, images })}
                          maxImages={6}
                        />
                      </div>
                    </div>

                    {formData.variants.length === 0 && (
                      <div>
                        <Label htmlFor="stock_quantity">Stock Quantity (if no variants)</Label>
                        <Input
                          id="stock_quantity"
                          type="number"
                          value={formData.stock_quantity}
                          onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 sm:gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_new}
                          onChange={(e) => setFormData({ ...formData, is_new: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Mark as New</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span>Featured Product</span>
                      </label>
                    </div>
                  </TabsContent>

                  <TabsContent value="variants" className="mt-0 space-y-6">
                    {/* Size Selection */}
                    <div>
                      <Label className="mb-2 block">Available Sizes</Label>
                      <div className="flex flex-wrap gap-2">
                        {defaultSizes.map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                              formData.selectedSizes.includes(size)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-secondary/50 border-border hover:border-primary/50'
                            }`}
                          >
                            {size}
                            {formData.selectedSizes.includes(size) && <Check size={14} className="inline ml-1" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                      <Label className="mb-2 block">Available Colors</Label>
                      <div className="flex flex-wrap gap-2">
                        {defaultColors.map(color => {
                          const selected = formData.selectedColors.find(c => c.name === color.name);
                          return (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => toggleColor(color)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                                selected
                                  ? 'border-primary bg-primary/10'
                                  : 'bg-secondary/50 border-border hover:border-primary/50'
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-border/50"
                                style={{ backgroundColor: color.hex }}
                              />
                              {color.name}
                              {selected && <Check size={14} className="text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Variant Stock Grid */}
                    {formData.variants.length > 0 && (
                      <div>
                        <Label className="mb-2 block">Stock per Variant</Label>
                        <div className="border border-border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-secondary/50">
                                <tr>
                                  <th className="text-left p-3 font-medium">Size</th>
                                  <th className="text-left p-3 font-medium">Color</th>
                                  <th className="text-left p-3 font-medium w-24">Stock</th>
                                </tr>
                              </thead>
                              <tbody>
                                {formData.variants.map((variant, idx) => (
                                  <tr key={idx} className="border-t border-border">
                                    <td className="p-3">{variant.size}</td>
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <span
                                          className="w-4 h-4 rounded-full border border-border/50"
                                          style={{ backgroundColor: defaultColors.find(c => c.name === variant.color)?.hex }}
                                        />
                                        {variant.color}
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <Input
                                        type="number"
                                        min="0"
                                        value={variant.stock}
                                        onChange={(e) => updateVariantStock(variant.size, variant.color, parseInt(e.target.value) || 0)}
                                        className="w-20 h-8"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="bg-secondary/30 p-3 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                              Total Stock: <span className="font-medium text-foreground">
                                {formData.variants.reduce((sum, v) => sum + v.stock, 0)}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.selectedSizes.length === 0 && formData.selectedColors.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Select sizes and colors to create variant combinations
                      </p>
                    )}
                  </TabsContent>
                </div>

                {/* Live Preview */}
                <div className="lg:col-span-1 order-first lg:order-last">
                  <ProductPreview formData={getPreviewData()} />
                </div>
              </div>
            </Tabs>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingProduct ? 'Update' : 'Create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
};

export default AdminProducts;
