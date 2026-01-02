import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  LogOut,
  Loader2,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ShieldCheck,
  Bell,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Order {
  id: string;
  order_number: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_city: string;
  shipping_address: string;
  payment_method: string;
  notes: string | null;
}

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayOrders: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  confirmed: 'bg-emerald-500/20 text-emerald-500',
  processing: 'bg-blue-500/20 text-blue-500',
  shipped: 'bg-purple-500/20 text-purple-500',
  delivered: 'bg-green-500/20 text-green-500',
  cancelled: 'bg-red-500/20 text-red-500',
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: ShieldCheck,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
};

const MobileAdminApp = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'products'>('dashboard');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalOrders: 0, pendingOrders: 0, totalRevenue: 0, todayOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!adminLoading && user && !isAdmin) {
      navigate('/');
      toast.error('You do not have admin access');
    }
  }, [user, authLoading, isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      
      // Set up realtime subscription for orders
      const channel = supabase
        .channel('admin-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders'
          },
          () => {
            fetchData();
            toast.info('Orders updated!');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (ordersData) {
        setOrders(ordersData);
        
        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const totalRevenue = ordersData
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + Number(o.total_amount), 0);
        
        const todayOrders = ordersData.filter(o => 
          new Date(o.created_at) >= today
        ).length;
        
        const pendingOrders = ordersData.filter(o => 
          o.status === 'pending'
        ).length;

        setStats({
          totalOrders: ordersData.length,
          pendingOrders,
          totalRevenue,
          todayOrders,
        });
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update order status');
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      setSelectedOrder(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)}>
              <Menu size={24} />
            </Button>
            <h1 className="font-display text-xl">Gen-Zee Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              {stats.pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                  {stats.pendingOrders}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Side Menu */}
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle className="font-display">Admin Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 space-y-2">
            <button
              onClick={() => { setActiveTab('dashboard'); setMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <LayoutDashboard size={20} />
              Dashboard
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <ShoppingCart size={20} />
              Orders
              {stats.pendingOrders > 0 && (
                <Badge variant="destructive" className="ml-auto">{stats.pendingOrders}</Badge>
              )}
            </button>
            <button
              onClick={() => navigate('/admin/products')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
            >
              <Package size={20} />
              Products
            </button>
            <button
              onClick={() => navigate('/admin/customers')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
            >
              <Users size={20} />
              Customers
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted transition-colors"
            >
              <Settings size={20} />
              Full Dashboard
            </button>
            <hr className="my-4" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Content */}
      <main className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="font-display text-2xl text-primary">{formatPrice(stats.totalRevenue)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="font-display text-2xl text-blue-500">{stats.totalOrders}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="font-display text-2xl text-yellow-500">{stats.pendingOrders}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Today</p>
                    <p className="font-display text-2xl text-green-500">{stats.todayOrders}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between">
                    Recent Orders
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => {
                      const StatusIcon = statusIcons[order.status] || Clock;
                      return (
                        <div
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[order.status]}`}>
                            <StatusIcon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                            </p>
                            <p className="text-xs text-muted-foreground">{order.shipping_city}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm">{formatPrice(Number(order.total_amount))}</p>
                            <Badge className={`text-xs ${statusColors[order.status]}`}>
                              {order.status}
                            </Badge>
                          </div>
                          <ChevronRight size={16} className="text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h2 className="font-display text-xl mb-4">All Orders</h2>
              {orders.map(order => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusColors[order.status]}`}>
                      <StatusIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{order.shipping_city}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg">{formatPrice(Number(order.total_amount))}</p>
                      <Badge className={`${statusColors[order.status]}`}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <SheetHeader>
                <SheetTitle className="font-display text-xl">
                  Order {selectedOrder.order_number || `#${selectedOrder.id.slice(0, 8).toUpperCase()}`}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={`${statusColors[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-display text-lg">{formatPrice(Number(selectedOrder.total_amount))}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span>{selectedOrder.payment_method === 'cod' ? 'Cash on Delivery' : selectedOrder.payment_method}</span>
                </div>
                
                <div>
                  <span className="text-muted-foreground text-sm">Shipping Address</span>
                  <p className="mt-1">{selectedOrder.shipping_address}, {selectedOrder.shipping_city}</p>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Notes</span>
                    <p className="mt-1 text-sm bg-muted/30 p-3 rounded-lg">{selectedOrder.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Update Status</p>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                  {selectedOrder.status === 'pending' && (
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                    >
                      Confirm Order
                    </Button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                    >
                      Start Processing
                    </Button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                    >
                      Mark Shipped
                    </Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                    >
                      Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors ${
              activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <LayoutDashboard size={22} />
            <span className="text-xs">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-colors relative ${
              activeTab === 'orders' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <ShoppingCart size={22} />
            <span className="text-xs">Orders</span>
            {stats.pendingOrders > 0 && (
              <span className="absolute -top-1 right-0 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {stats.pendingOrders}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="flex flex-col items-center gap-1 py-2 px-4 rounded-xl text-muted-foreground"
          >
            <Settings size={22} />
            <span className="text-xs">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MobileAdminApp;
