import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingInquiries: number;
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  recentOrders: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingInquiries: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch orders with different statuses
      const { data: orders, count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(8);

      // Fetch pending orders
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch confirmed orders
      const { count: confirmedOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');

      // Fetch delivered orders
      const { count: deliveredOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered');

      // Calculate total revenue from delivered orders only
      const { data: deliveredOrdersData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'delivered');

      const totalRevenue = deliveredOrdersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Fetch pending inquiries count
      const { count: inquiriesCount } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalRevenue,
        pendingInquiries: inquiriesCount || 0,
        pendingOrders: pendingOrders || 0,
        confirmedOrders: confirmedOrders || 0,
        deliveredOrders: deliveredOrders || 0,
        recentOrders: orders || [],
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: formatPrice(stats.totalRevenue), 
      icon: DollarSign, 
      color: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingCart, 
      color: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-500',
      trend: '+8.2%',
      trendUp: true
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: Package, 
      color: 'from-blue-500/20 to-blue-500/5',
      iconColor: 'text-blue-500',
      trend: '+3',
      trendUp: true
    },
    { 
      title: 'Pending Inquiries', 
      value: stats.pendingInquiries, 
      icon: MessageSquare, 
      color: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-500',
      trend: stats.pendingInquiries > 0 ? 'Needs attention' : 'All clear',
      trendUp: stats.pendingInquiries === 0
    },
  ];

  const orderStatusCards = [
    { 
      title: 'Pending', 
      value: stats.pendingOrders, 
      icon: Clock, 
      color: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-500',
      href: '/admin/orders?status=pending'
    },
    { 
      title: 'Confirmed', 
      value: stats.confirmedOrders, 
      icon: CheckCircle, 
      color: 'bg-blue-500/10 border-blue-500/20',
      iconColor: 'text-blue-500',
      href: '/admin/orders?status=confirmed'
    },
    { 
      title: 'Delivered', 
      value: stats.deliveredOrders, 
      icon: TrendingUp, 
      color: 'bg-emerald-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-500',
      href: '/admin/orders?status=delivered'
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      pending: { bg: 'bg-amber-500/20', text: 'text-amber-500', icon: Clock },
      confirmed: { bg: 'bg-blue-500/20', text: 'text-blue-500', icon: CheckCircle },
      processing: { bg: 'bg-purple-500/20', text: 'text-purple-500', icon: Package },
      shipped: { bg: 'bg-cyan-500/20', text: 'text-cyan-500', icon: TrendingUp },
      delivered: { bg: 'bg-emerald-500/20', text: 'text-emerald-500', icon: CheckCircle },
      cancelled: { bg: 'bg-red-500/20', text: 'text-red-500', icon: AlertTriangle },
    };
    return configs[status] || configs.pending;
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Gen-zee.store</title>
      </Helmet>

      <AdminLayout title="Dashboard">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-muted-foreground text-sm">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 p-6 md:p-8"
            >
              <div className="relative z-10">
                <h2 className="font-display text-2xl md:text-3xl mb-2">Welcome back, Admin!</h2>
                <p className="text-muted-foreground max-w-lg">
                  Here's what's happening with your store today. You have {stats.pendingOrders} pending orders to review.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link to="/admin/orders">
                    <Button className="btn-primary gap-2">
                      View Orders <ArrowUpRight size={16} />
                    </Button>
                  </Link>
                  <Link to="/admin/products">
                    <Button variant="outline" className="gap-2">
                      Manage Products
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-gold/10 rounded-full blur-3xl" />
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden border-border/50 hover:border-border transition-colors">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color}`} />
                    <CardHeader className="relative flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className={`p-2 rounded-lg bg-background/50 ${stat.iconColor}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="text-2xl md:text-3xl font-display font-semibold">{stat.value}</div>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.trendUp ? (
                          <ArrowUpRight size={14} className="text-emerald-500" />
                        ) : (
                          <ArrowDownRight size={14} className="text-amber-500" />
                        )}
                        <span className={`text-xs ${stat.trendUp ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {stat.trend}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Status Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {orderStatusCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <Link to={card.href}>
                    <Card className={`${card.color} border cursor-pointer hover:scale-[1.02] transition-transform`}>
                      <CardContent className="flex items-center justify-between p-6">
                        <div>
                          <p className="text-sm text-muted-foreground">{card.title} Orders</p>
                          <p className="text-3xl font-display font-semibold mt-1">{card.value}</p>
                        </div>
                        <div className={`p-3 rounded-xl ${card.color} ${card.iconColor}`}>
                          <card.icon size={28} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Recent Orders
                  </CardTitle>
                  <Link to="/admin/orders">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All <ArrowUpRight size={14} />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {stats.recentOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground/30" />
                      <p className="text-muted-foreground mt-4">No orders yet</p>
                      <p className="text-sm text-muted-foreground/70">Orders will appear here once customers start purchasing</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentOrders.map((order, index) => {
                        const statusConfig = getStatusConfig(order.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                                <StatusIcon size={18} className={statusConfig.text} />
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                                {order.status}
                              </Badge>
                              <p className="font-display text-primary font-semibold">
                                {formatPrice(Number(order.total_amount))}
                              </p>
                              <ArrowUpRight size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: 'Add Product', href: '/admin/products', icon: Package },
                { label: 'View Inquiries', href: '/admin/inquiries', icon: MessageSquare },
                { label: 'Manage Users', href: '/admin/users', icon: Users },
                { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
              ].map((action, index) => (
                <Link key={action.label} to={action.href}>
                  <Card className="border-border/50 hover:border-primary/50 hover:bg-secondary/30 transition-all cursor-pointer group">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <action.icon size={24} />
                      </div>
                      <p className="text-sm font-medium">{action.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </motion.div>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminDashboard;
