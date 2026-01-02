import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Bell, 
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  Home,
  XCircle,
  RefreshCw,
  Menu,
  X,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { toast } from 'sonner';

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
  totalCustomers: number;
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
  delivered: Home,
  cancelled: XCircle,
};

const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminMobileApp = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/auth');
    }
  }, [isAdmin, adminLoading, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch customers count
      const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const totalOrders = orders?.length || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalCustomers: customersCount || 0,
      });

      setRecentOrders(orders?.slice(0, 10) || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin]);

  // Real-time subscription for new orders
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('admin-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order update:', payload);
          fetchDashboardData();
          
          if (payload.eventType === 'INSERT') {
            toast.success('New order received!', {
              icon: <Bell className="h-4 w-4" />,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${newStatus}`);
      fetchDashboardData();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary" size={40} />
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
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl">Gen-Zee Admin</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/admin/orders" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShoppingBag size={20} />
                    <span>Orders</span>
                  </Link>
                  <Link 
                    to="/admin/products" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Package size={20} />
                    <span>Products</span>
                  </Link>
                  <Link 
                    to="/admin/customers" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Users size={20} />
                    <span>Customers</span>
                  </Link>
                  <Link 
                    to="/admin/inquiries" 
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <MessageSquare size={20} />
                    <span>Inquiries</span>
                  </Link>
                  <div className="border-t border-border my-4" />
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="font-display text-lg">Gen-Zee Admin</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <ShoppingBag size={18} />
              <span className="text-xs font-medium">Total Orders</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <Clock size={18} />
              <span className="text-xs font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold">{stats.pendingOrders}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <TrendingUp size={18} />
              <span className="text-xs font-medium">Revenue</span>
            </div>
            <p className="text-xl font-bold">{formatPrice(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Users size={18} />
              <span className="text-xs font-medium">Customers</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalCustomers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary">
            View All
          </Link>
        </div>
        
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const StatusIcon = statusIcons[order.status] || Clock;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <Badge className={`text-xs ${statusColors[order.status]}`}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {order.shipping_city} • {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium text-primary mt-1">
                            {formatPrice(Number(order.total_amount))}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          {selectedOrder && (
            <div className="p-4">
              <SheetHeader>
                <SheetTitle className="font-display">
                  Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8).toUpperCase()}
                </SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {orderStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-medium text-primary">
                    {formatPrice(Number(selectedOrder.total_amount))}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium">{selectedOrder.payment_method}</span>
                </div>
                
                <div className="border-t border-border pt-4">
                  <p className="text-muted-foreground text-sm mb-1">Shipping Address</p>
                  <p className="font-medium">{selectedOrder.shipping_address}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_city}</p>
                </div>
                
                {selectedOrder.notes && (
                  <div className="border-t border-border pt-4">
                    <p className="text-muted-foreground text-sm mb-1">Notes</p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
                
                <div className="pt-4 space-y-2">
                  {selectedOrder.status === 'pending' && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusChange(selectedOrder.id, 'confirmed')}
                    >
                      <ShieldCheck size={18} className="mr-2" />
                      Confirm Order
                    </Button>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusChange(selectedOrder.id, 'processing')}
                    >
                      <Package size={18} className="mr-2" />
                      Start Processing
                    </Button>
                  )}
                  {selectedOrder.status === 'processing' && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusChange(selectedOrder.id, 'shipped')}
                    >
                      <Truck size={18} className="mr-2" />
                      Mark as Shipped
                    </Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusChange(selectedOrder.id, 'delivered')}
                    >
                      <Home size={18} className="mr-2" />
                      Mark as Delivered
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-2 flex items-center justify-around">
        <Link to="/admin" className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard size={22} />
          <span className="text-xs">Dashboard</span>
        </Link>
        <Link to="/admin/orders" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <ShoppingBag size={22} />
          <span className="text-xs">Orders</span>
          {stats.pendingOrders > 0 && (
            <span className="absolute -top-1 right-1/4 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {stats.pendingOrders}
            </span>
          )}
        </Link>
        <Link to="/admin/products" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <Package size={22} />
          <span className="text-xs">Products</span>
        </Link>
        <Link to="/admin/customers" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <Users size={22} />
          <span className="text-xs">Customers</span>
        </Link>
      </nav>
    </div>
  );
};

export default AdminMobileApp;