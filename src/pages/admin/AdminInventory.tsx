import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Search, 
  Save, 
  RefreshCw,
  CheckCircle,
  X,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLog } from '@/hooks/useActivityLog';
import { formatPrice } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock_quantity: number;
  in_stock: boolean;
  images: string[];
}

interface StockUpdate {
  id: string;
  quantity: number;
}

const LOW_STOCK_THRESHOLD = 5;

const AdminInventory = () => {
  const { logActivity } = useActivityLog();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('stock_asc');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [bulkQuantity, setBulkQuantity] = useState<string>('');
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, category, price, stock_quantity, in_stock, images')
      .order('stock_quantity', { ascending: true });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Set up real-time subscription for product changes
    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateSingleStock = async (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('products')
      .update({ 
        stock_quantity: newQuantity, 
        in_stock: newQuantity > 0 
      })
      .eq('id', productId);

    if (error) {
      toast.error('Failed to update stock');
    } else {
      await logActivity('stock_updated', 'product', productId, {
        product_name: product.name,
        old_quantity: product.stock_quantity,
        new_quantity: newQuantity
      });
      toast.success(`Stock updated for ${product.name}`);
      setEditingStock(prev => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
      fetchProducts();
    }
    setIsUpdating(false);
  };

  const handleBulkUpdate = async (operation: 'set' | 'add' | 'subtract') => {
    if (selectedProducts.size === 0) {
      toast.error('Please select products first');
      return;
    }

    const quantity = parseInt(bulkQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    setIsUpdating(true);

    const updates: StockUpdate[] = [];
    
    for (const productId of selectedProducts) {
      const product = products.find(p => p.id === productId);
      if (!product) continue;

      let newQuantity = 0;
      switch (operation) {
        case 'set':
          newQuantity = quantity;
          break;
        case 'add':
          newQuantity = product.stock_quantity + quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, product.stock_quantity - quantity);
          break;
      }

      updates.push({ id: productId, quantity: newQuantity });
    }

    try {
      for (const update of updates) {
        const { error } = await supabase
          .from('products')
          .update({ 
            stock_quantity: update.quantity, 
            in_stock: update.quantity > 0 
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      await logActivity('bulk_stock_updated', 'product', null, {
        products_count: updates.length,
        operation,
        quantity
      });

      toast.success(`Updated stock for ${updates.length} products`);
      setSelectedProducts(new Set());
      setBulkQuantity('');
      setIsBulkDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update some products');
    }

    setIsUpdating(false);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleAllProducts = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      
      let matchesStock = true;
      switch (stockFilter) {
        case 'low':
          matchesStock = p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD;
          break;
        case 'out':
          matchesStock = p.stock_quantity === 0;
          break;
        case 'in':
          matchesStock = p.stock_quantity > LOW_STOCK_THRESHOLD;
          break;
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock_asc':
          return a.stock_quantity - b.stock_quantity;
        case 'stock_desc':
          return b.stock_quantity - a.stock_quantity;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    total: products.length,
    lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= LOW_STOCK_THRESHOLD).length,
    outOfStock: products.filter(p => p.stock_quantity === 0).length,
    totalUnits: products.reduce((sum, p) => sum + p.stock_quantity, 0),
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <>
      <Helmet>
        <title>Inventory | Admin - Gen-zee.store</title>
      </Helmet>

      <AdminLayout title="Inventory Management">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Package className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Total Products</p>
                  <p className="text-2xl font-display font-bold">{stats.total}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="text-yellow-500" size={20} />
                </div>
                <div>
                  <p className="text-yellow-500 text-sm">Low Stock</p>
                  <p className="text-2xl font-display font-bold text-yellow-500">{stats.lowStock}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingDown className="text-red-500" size={20} />
                </div>
                <div>
                  <p className="text-red-500 text-sm">Out of Stock</p>
                  <p className="text-2xl font-display font-bold text-red-500">{stats.outOfStock}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <CheckCircle className="text-emerald-500" size={20} />
                </div>
                <div>
                  <p className="text-emerald-500 text-sm">Total Units</p>
                  <p className="text-2xl font-display font-bold text-emerald-500">{stats.totalUnits}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Low Stock Alerts */}
          {stats.lowStock > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h3 className="font-medium text-yellow-500">Low Stock Alert</h3>
                  <p className="text-sm text-yellow-500/80 mt-1">
                    {stats.lowStock} product{stats.lowStock > 1 ? 's' : ''} have low stock (≤{LOW_STOCK_THRESHOLD} units). 
                    Consider restocking soon.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Filters and Actions */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-36">
                  <Filter size={16} className="mr-2" />
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                  <SelectItem value="in">In Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <ArrowUpDown size={16} className="mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_asc">Stock: Low to High</SelectItem>
                  <SelectItem value="stock_desc">Stock: High to Low</SelectItem>
                  <SelectItem value="name_asc">Name: A to Z</SelectItem>
                  <SelectItem value="name_desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={fetchProducts}
                disabled={loading}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="ml-2 hidden sm:inline">Refresh</span>
              </Button>

              {selectedProducts.size > 0 && (
                <Button 
                  onClick={() => setIsBulkDialogOpen(true)}
                  className="btn-primary"
                >
                  <Save size={16} className="mr-2" />
                  Bulk Update ({selectedProducts.size})
                </Button>
              )}
            </div>
          </div>

          {/* Products Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="text-left p-4 font-medium w-12">
                        <Checkbox 
                          checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                          onCheckedChange={toggleAllProducts}
                        />
                      </th>
                      <th className="text-left p-4 font-medium">Product</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Price</th>
                      <th className="text-left p-4 font-medium">Stock Quantity</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filteredProducts.map((product, index) => {
                        const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= LOW_STOCK_THRESHOLD;
                        const isOutOfStock = product.stock_quantity === 0;
                        const isEditing = editingStock[product.id] !== undefined;

                        return (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className={`border-t border-border hover:bg-secondary/20 ${
                              isOutOfStock ? 'bg-red-500/5' : isLowStock ? 'bg-yellow-500/5' : ''
                            }`}
                          >
                            <td className="p-4">
                              <Checkbox 
                                checked={selectedProducts.has(product.id)}
                                onCheckedChange={() => toggleProductSelection(product.id)}
                              />
                            </td>
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
                            <td className="p-4 text-primary font-medium">
                              {formatPrice(Number(product.price))}
                            </td>
                            <td className="p-4">
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    value={editingStock[product.id]}
                                    onChange={(e) => setEditingStock(prev => ({
                                      ...prev,
                                      [product.id]: e.target.value
                                    }))}
                                    className="w-20"
                                    min="0"
                                  />
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => updateSingleStock(product.id, parseInt(editingStock[product.id]) || 0)}
                                    disabled={isUpdating}
                                    className="text-emerald-500 hover:text-emerald-600"
                                  >
                                    <CheckCircle size={16} />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setEditingStock(prev => {
                                      const updated = { ...prev };
                                      delete updated[product.id];
                                      return updated;
                                    })}
                                    className="text-muted-foreground"
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingStock(prev => ({
                                    ...prev,
                                    [product.id]: product.stock_quantity.toString()
                                  }))}
                                  className={`font-mono text-lg font-bold hover:text-primary transition-colors ${
                                    isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-500' : ''
                                  }`}
                                >
                                  {product.stock_quantity}
                                </button>
                              )}
                            </td>
                            <td className="p-4">
                              {isOutOfStock ? (
                                <Badge className="bg-red-500/20 text-red-500 border border-red-500/30">
                                  Out of Stock
                                </Badge>
                              ) : isLowStock ? (
                                <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                                  Low Stock
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                                  In Stock
                                </Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingStock(prev => ({
                                    ...prev,
                                    [product.id]: product.stock_quantity.toString()
                                  }))}
                                >
                                  Update Stock
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No products found</p>
              )}
            </div>
          )}
        </div>

        {/* Bulk Update Dialog */}
        <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Bulk Stock Update</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Updating stock for <strong>{selectedProducts.size}</strong> selected product{selectedProducts.size > 1 ? 's' : ''}.
              </p>

              <div>
                <Label htmlFor="bulkQuantity">Quantity</Label>
                <Input
                  id="bulkQuantity"
                  type="number"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(e.target.value)}
                  placeholder="Enter quantity"
                  min="0"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Button
                  onClick={() => handleBulkUpdate('set')}
                  disabled={isUpdating || !bulkQuantity}
                  variant="outline"
                >
                  Set to
                </Button>
                <Button
                  onClick={() => handleBulkUpdate('add')}
                  disabled={isUpdating || !bulkQuantity}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Add
                </Button>
                <Button
                  onClick={() => handleBulkUpdate('subtract')}
                  disabled={isUpdating || !bulkQuantity}
                  variant="destructive"
                >
                  Subtract
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
};

export default AdminInventory;
