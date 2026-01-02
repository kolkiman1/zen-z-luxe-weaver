import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Search, Eye, Package, MapPin, Filter, Copy, Check, Printer, FileText, Mail, User, Phone } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLog } from '@/hooks/useActivityLog';
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
import OrderInvoice from '@/components/admin/OrderInvoice';
import ShippingLabel from '@/components/admin/ShippingLabel';
import EmailStatusWidget from '@/components/admin/EmailStatusWidget';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
}

interface Order {
  id: string;
  order_number: string | null;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string | null;
  payment_method: string;
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  confirmed: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  processing: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-500 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/30',
};

const AdminOrders = () => {
  const { logActivity } = useActivityLog();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [printMode, setPrintMode] = useState<'invoice' | 'label' | null>(null);
  const [customerInfo, setCustomerInfo] = useState<{ full_name?: string; email?: string; phone?: string; address?: string; city?: string; postal_code?: string } | null>(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = async (order: Order, mode: 'invoice' | 'label') => {
    // Fetch customer info
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, phone')
      .eq('user_id', order.user_id)
      .single();
    
    setCustomerInfo(profile);
    setSelectedOrder(order);
    setPrintMode(mode);
    
    setTimeout(() => {
      if (printRef.current) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>${mode === 'invoice' ? 'Invoice' : 'Shipping Label'} - ${order.order_number || order.id}</title>
                <style>
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                  @media print { body { padding: 0; } }
                </style>
              </head>
              <body>${printRef.current.innerHTML}</body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        }
      }
      setPrintMode(null);
    }, 100);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    const oldStatus = order?.status;
    
    setIsUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      await logActivity('order_status_updated', 'order', orderId, { 
        order_number: order?.order_number,
        old_status: oldStatus, 
        new_status: newStatus 
      });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // Send cancellation email if status changed to cancelled
      if (newStatus === 'cancelled' && order) {
        try {
          // Fetch customer info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('user_id', order.user_id)
            .single();

          if (profile?.email) {
            const subtotal = order.order_items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            );

            await supabase.functions.invoke('order-cancellation', {
              body: {
                email: profile.email,
                customerName: profile.full_name,
                orderNumber: order.order_number || order.id,
                orderId: order.id,
                orderDate: order.created_at,
                cancellationDate: new Date().toISOString(),
                items: order.order_items.map(item => ({
                  product_name: item.product_name,
                  quantity: item.quantity,
                  size: item.size,
                  color: item.color,
                  price: item.price,
                })),
                subtotal: subtotal,
                shipping: 0,
                discount: 0,
                total: Number(order.total_amount),
                shippingAddress: order.shipping_address,
                shippingCity: order.shipping_city,
                shippingPostalCode: order.shipping_postal_code,
                paymentMethod: order.payment_method,
              },
            });
            toast.info('Cancellation email sent to customer');
          }
        } catch (emailError) {
          console.error('Failed to send cancellation email:', emailError);
        }
      }
    }
    setIsUpdating(false);
  };

  const copyOrderNumber = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    toast.success('Order ID copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shipping_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shipping_address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    
    // Date filtering
    const orderDate = new Date(o.created_at);
    const matchesDateFrom = !dateFrom || orderDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59');
    
    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  // Helper to check if order is from outside Dhaka
  const isOutsideDhaka = (order: Order) => {
    const city = order.shipping_city.toLowerCase().trim();
    return !city.includes('dhaka');
  };

  // Helper to extract delivery payment info
  const getDeliveryPaymentInfo = (notes: string | null) => {
    if (!notes) return null;
    const match = notes.match(/Delivery Advance: ৳(\d+) via (\w+), TxID: ([^,]+), From: (.+)/);
    if (match) {
      return {
        amount: match[1],
        method: match[2],
        txId: match[3],
        phone: match[4]
      };
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Orders | Admin - Gen-zee.store</title>
      </Helmet>

      <AdminLayout title="Orders">
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-muted-foreground text-sm">Total Orders</p>
              <p className="text-2xl font-display font-bold">{stats.total}</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <p className="text-yellow-500 text-sm">Pending</p>
              <p className="text-2xl font-display font-bold text-yellow-500">{stats.pending}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-500 text-sm">Confirmed</p>
              <p className="text-2xl font-display font-bold text-emerald-500">{stats.confirmed}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-500 text-sm">Processing</p>
              <p className="text-2xl font-display font-bold text-blue-500">{stats.processing}</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-purple-500 text-sm">Shipped</p>
              <p className="text-2xl font-display font-bold text-purple-500">{stats.shipped}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-500 text-sm">Delivered</p>
              <p className="text-2xl font-display font-bold text-green-500">{stats.delivered}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search by Order ID, city, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOptions.map(status => (
                      <SelectItem key={status} value={status} className="capitalize">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Date Range Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">From:</span>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">To:</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              {(dateFrom || dateTo || statusFilter !== 'all' || searchTerm) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setStatusFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                Showing {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
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
                      <th className="text-left p-4 font-medium">Delivery Location</th>
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
                        transition={{ delay: index * 0.03 }}
                        className="border-t border-border hover:bg-secondary/20"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyOrderNumber(order.order_number || order.id)}
                              className="flex items-center gap-2 hover:text-primary transition-colors group"
                            >
                              <span className="font-mono text-sm font-medium bg-primary/10 px-2 py-1 rounded">
                                {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                              </span>
                              {copiedId === (order.order_number || order.id) ? (
                                <Check size={14} className="text-green-500" />
                              ) : (
                                <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div>{new Date(order.created_at).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-muted-foreground" />
                            <span>{order.order_items.length} items</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start gap-2">
                            <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-sm">{order.shipping_city}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                                {order.shipping_address}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-primary font-medium">
                          {formatPrice(Number(order.total_amount))}
                        </td>
                        <td className="p-4">
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChange(order.id, value)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-32 border-0 bg-transparent p-0 h-auto">
                              <Badge className={`${statusColors[order.status]} border`}>
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
                        <td className="p-4 text-sm">
                          <div className="capitalize font-medium">{order.payment_method}</div>
                          {order.notes && (order.payment_method === 'bkash' || order.payment_method === 'nagad') && (
                            <div className="text-xs text-muted-foreground mt-1 font-mono">
                              TxID: {order.notes.match(/TxID:\s*([^,]+)/)?.[1]?.trim()}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handlePrint(order, 'invoice'); }}
                              title="Print Invoice"
                            >
                              <FileText size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handlePrint(order, 'label'); }}
                              title="Print Label"
                            >
                              <Printer size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                setSelectedOrder(order);
                                setLoadingCustomer(true);
                                const { data: profile } = await supabase
                                  .from('profiles')
                                  .select('full_name, email, phone, address, city, postal_code')
                                  .eq('user_id', order.user_id)
                                  .maybeSingle();
                                setCustomerInfo(profile);
                                setLoadingCustomer(false);
                              }}
                              className="gap-2"
                            >
                              <Eye size={14} />
                              View
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No orders found</p>
                  {searchTerm && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Try searching with a different Order ID or location
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hidden Print Components */}
        <div className="hidden">
          <div ref={printRef}>
            {printMode === 'invoice' && selectedOrder && (
              <OrderInvoice order={selectedOrder} customer={customerInfo} />
            )}
            {printMode === 'label' && selectedOrder && (
              <ShippingLabel order={selectedOrder} customer={customerInfo} />
            )}
          </div>
        </div>

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder && !printMode} onOpenChange={() => { setSelectedOrder(null); setCustomerInfo(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <span className="font-mono bg-primary/10 px-3 py-1 rounded-lg text-primary">
                  {selectedOrder?.order_number || `#${selectedOrder?.id.slice(0, 8).toUpperCase()}`}
                </span>
                {selectedOrder && (
                  <Badge className={`${statusColors[selectedOrder.status]} border`}>
                    {selectedOrder.status}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyOrderNumber(selectedOrder.order_number || selectedOrder.id)}
                    className="gap-2"
                  >
                    {copiedId === (selectedOrder.order_number || selectedOrder.id) ? (
                      <>
                        <Check size={14} className="text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy Order ID
                      </>
                    )}
                  </Button>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-secondary/30 rounded-xl">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
                    <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">{new Date(selectedOrder.created_at).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-32 mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Payment</p>
                    <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                    <p className="text-xl font-display font-bold text-primary">
                      {formatPrice(Number(selectedOrder.total_amount))}
                    </p>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="p-4 bg-secondary/30 rounded-xl">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    Customer Details
                  </h4>
                {loadingCustomer ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                      Loading customer info...
                    </div>
                  ) : customerInfo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Name</p>
                          <p className="font-medium">{customerInfo.full_name || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{customerInfo.email || 'N/A'}</p>
                            {customerInfo.email && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(customerInfo.email || '');
                                  toast.success('Email copied!');
                                }}
                                className="p-1 hover:bg-secondary rounded transition-colors"
                                title="Copy email"
                              >
                                <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{customerInfo.phone || 'N/A'}</p>
                            {customerInfo.phone && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(customerInfo.phone || '');
                                  toast.success('Phone copied!');
                                }}
                                className="p-1 hover:bg-secondary rounded transition-colors"
                                title="Copy phone"
                              >
                                <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Profile Address</p>
                          <div className="flex items-start gap-2">
                            <p className="text-sm text-muted-foreground">
                              {customerInfo.address ? (
                                <>
                                  {customerInfo.address}
                                  {customerInfo.city && `, ${customerInfo.city}`}
                                  {customerInfo.postal_code && ` - ${customerInfo.postal_code}`}
                                </>
                              ) : 'Not set in profile'}
                            </p>
                            {customerInfo.address && (
                              <button
                                onClick={() => {
                                  const fullAddress = `${customerInfo.address}${customerInfo.city ? `, ${customerInfo.city}` : ''}${customerInfo.postal_code ? ` - ${customerInfo.postal_code}` : ''}`;
                                  navigator.clipboard.writeText(fullAddress);
                                  toast.success('Address copied!');
                                }}
                                className="p-1 hover:bg-secondary rounded transition-colors shrink-0"
                                title="Copy address"
                              >
                                <Copy size={14} className="text-muted-foreground hover:text-foreground" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Contact Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                        {customerInfo.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => window.open(`tel:${customerInfo.phone}`, '_self')}
                          >
                            <Phone size={14} />
                            Call Customer
                          </Button>
                        )}
                        {customerInfo.email && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            onClick={() => window.open(`mailto:${customerInfo.email}?subject=Regarding Order ${selectedOrder?.order_number || selectedOrder?.id}`, '_blank')}
                          >
                            <Mail size={14} />
                            Email Customer
                          </Button>
                        )}
                        {customerInfo.phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                            onClick={() => window.open(`https://wa.me/${customerInfo.phone?.replace(/[^0-9]/g, '')}?text=Hi, regarding your order ${selectedOrder?.order_number || selectedOrder?.id}`, '_blank')}
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Customer details not available</p>
                  )}
                </div>

                {/* Payment Details for bKash/Nagad */}
                {selectedOrder.notes && (selectedOrder.payment_method === 'bkash' || selectedOrder.payment_method === 'nagad') && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                    <h4 className="font-medium mb-3 text-primary flex items-center gap-2">
                      <Package size={16} />
                      Payment Details ({selectedOrder.payment_method.toUpperCase()})
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedOrder.notes.includes('TxID:') && (
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wider">Transaction ID</p>
                          <p className="font-mono font-medium text-lg">
                            {selectedOrder.notes.match(/TxID:\s*([^,]+)/)?.[1]?.trim() || '-'}
                          </p>
                        </div>
                      )}
                      {selectedOrder.notes.includes('From:') && (
                        <div>
                          <p className="text-muted-foreground text-xs uppercase tracking-wider">Payment From</p>
                          <p className="font-mono font-medium text-lg">
                            {selectedOrder.notes.match(/From:\s*(.+)/)?.[1]?.trim() || '-'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Payment Info for Outside Dhaka */}
                {selectedOrder.notes && isOutsideDhaka(selectedOrder) && getDeliveryPaymentInfo(selectedOrder.notes) && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <h4 className="font-medium mb-3 text-amber-600 flex items-center gap-2">
                      <Package size={16} />
                      Delivery Advance Payment (Outside Dhaka)
                    </h4>
                    {(() => {
                      const info = getDeliveryPaymentInfo(selectedOrder.notes);
                      if (!info) return null;
                      return (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Amount</p>
                            <p className="font-medium text-lg">৳{info.amount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Method</p>
                            <p className="font-medium text-lg">{info.method}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Transaction ID</p>
                            <p className="font-mono font-medium text-lg">{info.txId}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs uppercase tracking-wider">Payment From</p>
                            <p className="font-mono font-medium text-lg">{info.phone}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Quick Confirm Button for Pending Orders */}
                {selectedOrder.status === 'pending' && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-emerald-600">Confirm This Order</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isOutsideDhaka(selectedOrder) 
                            ? 'Verify the delivery payment above, then confirm the order.'
                            : 'Click to confirm this order for processing.'}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                        disabled={isUpdating}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {isUpdating ? 'Confirming...' : 'Confirm Order'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delivery Location */}
                <div className="p-4 bg-secondary/30 rounded-xl">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    Delivery Location
                  </h4>
                  <div className="space-y-1">
                    <p className="font-medium">{selectedOrder.shipping_city}</p>
                    <p className="text-muted-foreground">{selectedOrder.shipping_address}</p>
                    {selectedOrder.shipping_postal_code && (
                      <p className="text-muted-foreground">Postal Code: {selectedOrder.shipping_postal_code}</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Package size={16} className="text-primary" />
                    Order Items ({selectedOrder.order_items.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                        {item.product_image && (
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.product_name}</p>
                          <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                            <span>Qty: {item.quantity}</span>
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                          </div>
                        </div>
                        <p className="font-medium text-lg">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Status */}
                <EmailStatusWidget orderId={selectedOrder.id} limit={5} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
};

export default AdminOrders;