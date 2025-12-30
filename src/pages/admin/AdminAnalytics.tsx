import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
} from 'recharts';
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Repeat,
  Heart,
  Eye,
  MousePointer,
  ShoppingCart,
  CreditCard,
  Percent,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Zap,
  Star,
  TrendingDown,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';

interface OrderData {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_city: string;
  payment_method: string;
}

interface ProductData {
  id: string;
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  is_featured: boolean;
}

interface OrderItemData {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

const AdminAnalytics = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [previousOrders, setPreviousOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    const days = parseInt(dateRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - (days * 2));
    const previousEndDate = new Date();
    previousEndDate.setDate(previousEndDate.getDate() - days);

    const [ordersRes, productsRes, orderItemsRes, prevOrdersRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, user_id, total_amount, status, created_at, shipping_city, payment_method')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      supabase.from('products').select('id, name, category, price, stock_quantity, is_featured'),
      supabase.from('order_items').select('product_id, product_name, quantity, price'),
      supabase
        .from('orders')
        .select('id, user_id, total_amount, status, created_at, shipping_city, payment_method')
        .gte('created_at', previousStartDate.toISOString())
        .lt('created_at', previousEndDate.toISOString()),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    if (orderItemsRes.data) setOrderItems(orderItemsRes.data);
    if (prevOrdersRes.data) setPreviousOrders(prevOrdersRes.data);
    setLoading(false);
  };

  // Calculate metrics with comparison
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const prevRevenue = previousOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const totalOrders = orders.length;
    const prevTotalOrders = previousOrders.length;
    const ordersChange = prevTotalOrders > 0 ? ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100 : 0;

    const uniqueCustomers = new Set(orders.map(o => o.user_id)).size;
    const prevUniqueCustomers = new Set(previousOrders.map(o => o.user_id)).size;
    const customersChange = prevUniqueCustomers > 0 ? ((uniqueCustomers - prevUniqueCustomers) / prevUniqueCustomers) * 100 : 0;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAov = prevTotalOrders > 0 ? prevRevenue / prevTotalOrders : 0;
    const aovChange = prevAov > 0 ? ((averageOrderValue - prevAov) / prevAov) * 100 : 0;

    const customerOrderMap: Record<string, { count: number; total: number }> = {};
    orders.forEach(o => {
      if (!customerOrderMap[o.user_id]) {
        customerOrderMap[o.user_id] = { count: 0, total: 0 };
      }
      customerOrderMap[o.user_id].count++;
      customerOrderMap[o.user_id].total += Number(o.total_amount);
    });

    const customerValues = Object.values(customerOrderMap);
    const repeatCustomers = customerValues.filter(c => c.count > 1).length;
    const repeatRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;
    const clv = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;
    const purchaseFrequency = uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;

    // Conversion funnel (simulated based on orders)
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const shippedOrders = orders.filter(o => o.status === 'shipped').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

    return {
      totalRevenue,
      revenueChange,
      totalOrders,
      ordersChange,
      uniqueCustomers,
      customersChange,
      averageOrderValue,
      aovChange,
      repeatRate,
      clv,
      purchaseFrequency,
      repeatCustomers,
      completedOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      cancelledOrders,
    };
  }, [orders, previousOrders]);

  // Revenue over time with trend
  const revenueData = useMemo(() => {
    const grouped: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) grouped[date] = { revenue: 0, orders: 0 };
      grouped[date].revenue += Number(o.total_amount);
      grouped[date].orders += 1;
    });
    return Object.entries(grouped).map(([date, data]) => ({ date, ...data }));
  }, [orders]);

  // Orders by status
  const statusData = useMemo(() => {
    const grouped: Record<string, number> = {};
    orders.forEach(o => {
      grouped[o.status] = (grouped[o.status] || 0) + 1;
    });
    return Object.entries(grouped).map(([status, count]) => ({ status, count }));
  }, [orders]);

  // Orders by day of week
  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const grouped: Record<number, number> = {};
    orders.forEach(o => {
      const day = new Date(o.created_at).getDay();
      grouped[day] = (grouped[day] || 0) + 1;
    });
    return days.map((name, i) => ({ name, orders: grouped[i] || 0 }));
  }, [orders]);

  // Hourly distribution
  const hourlyData = useMemo(() => {
    const grouped: Record<number, number> = {};
    orders.forEach(o => {
      const hour = new Date(o.created_at).getHours();
      grouped[hour] = (grouped[hour] || 0) + 1;
    });
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i.toString().padStart(2, '0') + ':00',
      orders: grouped[i] || 0,
    }));
  }, [orders]);

  // Top customers by CLV
  const topCustomers = useMemo(() => {
    const customerMap: Record<string, { orders: number; total: number }> = {};
    orders.forEach(o => {
      if (!customerMap[o.user_id]) {
        customerMap[o.user_id] = { orders: 0, total: 0 };
      }
      customerMap[o.user_id].orders++;
      customerMap[o.user_id].total += Number(o.total_amount);
    });
    return Object.entries(customerMap)
      .map(([id, data]) => ({ id: id.slice(0, 8), ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [orders]);

  // Average order value over time
  const aovData = useMemo(() => {
    const grouped: Record<string, { total: number; count: number }> = {};
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) grouped[date] = { total: 0, count: 0 };
      grouped[date].total += Number(o.total_amount);
      grouped[date].count++;
    });
    return Object.entries(grouped).map(([date, data]) => ({
      date,
      aov: data.total / data.count,
    }));
  }, [orders]);

  // Category performance
  const categoryData = useMemo(() => {
    const categoryMap: Record<string, { revenue: number; orders: number }> = {};
    orderItems.forEach(item => {
      const product = products.find(p => p.id === item.product_id);
      const category = product?.category || 'Other';
      if (!categoryMap[category]) categoryMap[category] = { revenue: 0, orders: 0 };
      categoryMap[category].revenue += Number(item.price) * item.quantity;
      categoryMap[category].orders += item.quantity;
    });
    return Object.entries(categoryMap).map(([name, data]) => ({
      name,
      value: data.revenue,
      orders: data.orders,
    }));
  }, [orderItems, products]);

  // Top products
  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; revenue: number; quantity: number }> = {};
    orderItems.forEach(item => {
      if (!productMap[item.product_id]) {
        productMap[item.product_id] = { name: item.product_name, revenue: 0, quantity: 0 };
      }
      productMap[item.product_id].revenue += Number(item.price) * item.quantity;
      productMap[item.product_id].quantity += item.quantity;
    });
    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [orderItems]);

  // City distribution
  const cityData = useMemo(() => {
    const grouped: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach(o => {
      const city = o.shipping_city || 'Unknown';
      if (!grouped[city]) grouped[city] = { orders: 0, revenue: 0 };
      grouped[city].orders++;
      grouped[city].revenue += Number(o.total_amount);
    });
    return Object.entries(grouped)
      .map(([city, data]) => ({ city, ...data }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 8);
  }, [orders]);

  // Payment method distribution
  const paymentData = useMemo(() => {
    const grouped: Record<string, number> = {};
    orders.forEach(o => {
      const method = o.payment_method || 'Unknown';
      grouped[method] = (grouped[method] || 0) + 1;
    });
    return Object.entries(grouped).map(([method, count]) => ({ method, count }));
  }, [orders]);

  // Conversion funnel data
  const funnelData = useMemo(() => [
    { stage: 'Placed', value: metrics.totalOrders, fill: '#6366f1' },
    { stage: 'Processing', value: metrics.processingOrders + metrics.shippedOrders + metrics.completedOrders, fill: '#8b5cf6' },
    { stage: 'Shipped', value: metrics.shippedOrders + metrics.completedOrders, fill: '#a855f7' },
    { stage: 'Delivered', value: metrics.completedOrders, fill: '#10b981' },
  ], [metrics]);

  // Stock alerts
  const stockAlerts = useMemo(() => {
    return products
      .filter(p => (p.stock_quantity || 0) < 10)
      .sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0))
      .slice(0, 5);
  }, [products]);

  const MetricChange = ({ value }: { value: number }) => {
    if (value === 0) return <span className="text-xs text-muted-foreground">No change</span>;
    const isPositive = value > 0;
    return (
      <span className={`text-xs flex items-center gap-0.5 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics Dashboard | Admin - zen-z.store</title>
        <meta name="description" content="Comprehensive analytics dashboard with revenue, customers, products, and performance metrics" />
      </Helmet>

      <AdminLayout title="Analytics Dashboard">
        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground" size={20} />
              <span className="text-muted-foreground">Comparing to previous period</span>
            </div>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="w-5 h-5 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-primary">
                    {formatPrice(metrics.totalRevenue)}
                  </div>
                  <MetricChange value={metrics.revenueChange} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{metrics.totalOrders}</div>
                  <MetricChange value={metrics.ordersChange} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <CreditCard className="w-5 h-5 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{formatPrice(metrics.averageOrderValue)}</div>
                  <MetricChange value={metrics.aovChange} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Customers</CardTitle>
                  <Users className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">{metrics.uniqueCustomers}</div>
                  <MetricChange value={metrics.customersChange} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Customer LTV</CardTitle>
                <Heart className="w-4 h-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-pink-500">{formatPrice(metrics.clv)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Repeat Rate</CardTitle>
                <Repeat className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-500">{metrics.repeatRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Frequency</CardTitle>
                <Target className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{metrics.purchaseFrequency.toFixed(2)}x</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Delivered</CardTitle>
                <Package className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-500">{metrics.completedOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Cancelled</CardTitle>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-red-500">{metrics.cancelledOrders}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="geography">Geography</TabsTrigger>
              <TabsTrigger value="funnel">Funnel</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue & Orders Trend</CardTitle>
                    <CardDescription>Daily performance over selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" />
                          <YAxis yAxisId="left" className="text-xs" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                          <YAxis yAxisId="right" orientation="right" className="text-xs" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="text-sm font-medium">{payload[0].payload.date}</p>
                                    <p className="text-primary font-bold">{formatPrice(payload[0].value as number)}</p>
                                    <p className="text-xs text-muted-foreground">{payload[1]?.value} orders</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorRevenue)" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Status Distribution</CardTitle>
                    <CardDescription>Current breakdown of order statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="status"
                          >
                            {statusData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {statusData.map((item, index) => (
                        <div key={item.status} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs capitalize">{item.status}: {item.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Peak Hours</CardTitle>
                    <CardDescription>Orders by hour of day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="hour" className="text-xs" interval={2} />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Pattern</CardTitle>
                    <CardDescription>Orders by day of week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayOfWeekData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>Daily revenue for the selected period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorRev2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" />
                          <YAxis className="text-xs" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="text-sm font-medium">{payload[0].payload.date}</p>
                                    <p className="text-primary font-bold">{formatPrice(payload[0].value as number)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorRev2)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Order Value Trend</CardTitle>
                    <CardDescription>Track how AOV changes over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={aovData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="date" className="text-xs" />
                          <YAxis className="text-xs" tickFormatter={(v) => `৳${v.toFixed(0)}`} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="text-sm font-medium">{payload[0].payload.date}</p>
                                    <p className="text-blue-500 font-bold">AOV: {formatPrice(payload[0].value as number)}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line type="monotone" dataKey="aov" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Distribution of payment types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={paymentData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            nameKey="method"
                            label={({ method, count }) => `${method}: ${count}`}
                          >
                            {paymentData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Top Selling Products</CardTitle>
                    <CardDescription>Best performers by revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topProducts} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                          <YAxis dataKey="name" type="category" width={120} className="text-xs" tick={{ fontSize: 11 }} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="text-sm font-medium">{data.name}</p>
                                    <p className="text-primary font-bold">{formatPrice(data.revenue)}</p>
                                    <p className="text-xs text-muted-foreground">{data.quantity} units sold</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Category Performance</CardTitle>
                    <CardDescription>Revenue by product category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            dataKey="value"
                            nameKey="name"
                          >
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatPrice(value as number)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {categoryData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="text-xs capitalize">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Low Stock Alerts</span>
                      <Badge variant="destructive">{stockAlerts.length}</Badge>
                    </CardTitle>
                    <CardDescription>Products needing restock</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stockAlerts.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">All products are well stocked</p>
                      ) : (
                        stockAlerts.map(product => (
                          <div key={product.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                            <div>
                              <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.category}</p>
                            </div>
                            <Badge variant={product.stock_quantity === 0 ? 'destructive' : 'secondary'}>
                              {product.stock_quantity} left
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="customers">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Customers by Lifetime Value</CardTitle>
                    <CardDescription>Your highest-value customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topCustomers} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis type="number" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                          <YAxis dataKey="id" type="category" width={80} className="text-xs" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="text-sm font-medium">Customer #{data.id}</p>
                                    <p className="text-primary font-bold">{formatPrice(data.total)}</p>
                                    <p className="text-xs text-muted-foreground">{data.orders} orders</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Customer Insights</CardTitle>
                    <CardDescription>Key customer metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">{metrics.uniqueCustomers}</p>
                        <p className="text-xs text-muted-foreground">Total Customers</p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-500">{metrics.repeatCustomers}</p>
                        <p className="text-xs text-muted-foreground">Repeat Customers</p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{formatPrice(metrics.clv)}</p>
                        <p className="text-xs text-muted-foreground">Avg LTV</p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg text-center">
                        <p className="text-2xl font-bold">{metrics.purchaseFrequency.toFixed(2)}x</p>
                        <p className="text-xs text-muted-foreground">Avg Purchases</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Repeat Rate</span>
                        <span className="font-bold">{metrics.repeatRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={metrics.repeatRate} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="geography">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Orders by City</CardTitle>
                    <CardDescription>Geographic distribution of orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cityData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="city" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                      <MapPin size={14} /> {data.city}
                                    </p>
                                    <p className="text-primary font-bold">{formatPrice(data.revenue)}</p>
                                    <p className="text-xs text-muted-foreground">{data.orders} orders</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Cities by Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cityData.map((city, index) => (
                        <div key={city.city} className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">{city.city}</span>
                              <span className="text-sm text-primary font-bold">{formatPrice(city.revenue)}</span>
                            </div>
                            <Progress value={(city.revenue / (cityData[0]?.revenue || 1)) * 100} className="h-1.5" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary/50 rounded-lg text-center">
                        <MapPin className="w-8 h-8 mx-auto text-primary mb-2" />
                        <p className="text-2xl font-bold">{cityData.length}</p>
                        <p className="text-xs text-muted-foreground">Cities Served</p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg text-center">
                        <Globe className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                        <p className="text-2xl font-bold">{cityData[0]?.city || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Top City</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="funnel">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Order Fulfillment Funnel</CardTitle>
                    <CardDescription>Track orders through each stage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {funnelData.map((stage, index) => {
                        const percentage = metrics.totalOrders > 0 ? (stage.value / metrics.totalOrders) * 100 : 0;
                        const prevPercentage = index > 0 && funnelData[index - 1].value > 0 
                          ? (stage.value / funnelData[index - 1].value) * 100 
                          : 100;
                        return (
                          <div key={stage.stage}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: stage.fill }} />
                                <span className="font-medium">{stage.stage}</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-bold">{stage.value}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({percentage.toFixed(1)}%)
                                </span>
                                {index > 0 && (
                                  <Badge variant={prevPercentage >= 80 ? 'default' : prevPercentage >= 50 ? 'secondary' : 'destructive'}>
                                    {prevPercentage.toFixed(0)}% conversion
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="h-8 bg-secondary/50 rounded-lg overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="h-full rounded-lg"
                                style={{ backgroundColor: stage.fill }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Funnel Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-green-500/10 rounded-lg text-center">
                        <Zap className="w-8 h-8 mx-auto text-green-500 mb-2" />
                        <p className="text-2xl font-bold text-green-500">
                          {metrics.totalOrders > 0 ? ((metrics.completedOrders / metrics.totalOrders) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                      </div>
                      <div className="p-4 bg-red-500/10 rounded-lg text-center">
                        <TrendingDown className="w-8 h-8 mx-auto text-red-500 mb-2" />
                        <p className="text-2xl font-bold text-red-500">
                          {metrics.totalOrders > 0 ? ((metrics.cancelledOrders / metrics.totalOrders) * 100).toFixed(1) : 0}%
                        </p>
                        <p className="text-xs text-muted-foreground">Cancellation Rate</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processing Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Pending</span>
                        </div>
                        <Badge>{metrics.pendingOrders}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">Processing</span>
                        </div>
                        <Badge variant="secondary">{metrics.processingOrders}</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">Shipped</span>
                        </div>
                        <Badge variant="outline">{metrics.shippedOrders}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnalytics;
