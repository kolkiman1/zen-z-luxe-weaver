import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Eye, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  size: string | null;
  price: number;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string | null;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[];
}

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  processing: 'bg-blue-500/20 text-blue-500',
  shipped: 'bg-purple-500/20 text-purple-500',
  delivered: 'bg-green-500/20 text-green-500',
  cancelled: 'bg-red-500/20 text-red-500',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
    setIsUpdating(false);
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.shipping_city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>Orders | Admin - zen-z.store</title>
      </Helmet>

      <AdminLayout title="Orders">
        <div className="space-y-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by order ID or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Orders Table */}
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
                      <th className="text-left p-4 font-medium">Order ID</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Items</th>
                      <th className="text-left p-4 font-medium">Total</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Payment</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-t border-border hover:bg-secondary/20"
                      >
                        <td className="p-4">
                          <span className="font-mono text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                        </td>
                        <td className="p-4 text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4">{order.order_items.length} items</td>
                        <td className="p-4 text-primary font-medium">
                          {formatPrice(Number(order.total_amount))}
                        </td>
                        <td className="p-4">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-32">
                              <Badge className={statusColors[order.status]}>
                                {order.status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map(status => (
                                <SelectItem key={status} value={status} className="capitalize">
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4 text-sm capitalize">{order.payment_method}</td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye size={16} />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No orders found</p>
              )}
            </div>
          )}
        </div>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Date</p>
                    <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <Badge className={statusColors[selectedOrder.status]}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Payment Method</p>
                    <p className="capitalize">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="text-primary font-display text-lg">
                      {formatPrice(Number(selectedOrder.total_amount))}
                    </p>
                  </div>
                </div>

                {/* Shipping Info */}
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shipping_address}<br />
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-2">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} {item.size && `• Size: ${item.size}`}
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
};

export default AdminOrders;
