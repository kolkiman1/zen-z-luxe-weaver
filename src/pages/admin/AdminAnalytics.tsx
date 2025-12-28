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
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';

interface OrderData {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface CustomerData {
  user_id: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
  first_order_date: string | null;
  last_order_date: string | null;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

const AdminAnalytics = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const { data: ordersData } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, status, created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (ordersData) setOrders(ordersData);
    setLoading(false);
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(o => o.user_id)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate customer metrics
    const customerOrderMap: Record<string, { count: number; total: number; dates: string[] }> = {};
    orders.forEach(o => {
      if (!customerOrderMap[o.user_id]) {
        customerOrderMap[o.user_id] = { count: 0, total: 0, dates: [] };
      }
      customerOrderMap[o.user_id].count++;
      customerOrderMap[o.user_id].total += Number(o.total_amount);
      customerOrderMap[o.user_id].dates.push(o.created_at);
    });

    const customerValues = Object.values(customerOrderMap);
    const repeatCustomers = customerValues.filter(c => c.count > 1).length;
    const repeatRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

    // Customer lifetime value (average total spent per customer)
    const clv = uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0;

    // Purchase frequency
    const purchaseFrequency = uniqueCustomers > 0 ? totalOrders / uniqueCustomers : 0;

    return {
      totalRevenue,
      totalOrders,
      uniqueCustomers,
      averageOrderValue,
      repeatRate,
      clv,
      purchaseFrequency,
      repeatCustomers,
    };
  }, [orders]);

  // Revenue over time
  const revenueData = useMemo(() => {
    const grouped: Record<string, number> = {};
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      grouped[date] = (grouped[date] || 0) + Number(o.total_amount);
    });
    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
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

  if (loading) {
    return (
      <AdminLayout title="Customer Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Customer Analytics | Admin - zen-z.store</title>
        <meta name="description" content="Customer analytics dashboard with purchase patterns, AOV, and CLV metrics" />
      </Helmet>

      <AdminLayout title="Customer Analytics">
        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground" size={20} />
              <span className="text-muted-foreground">Date Range:</span>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <ArrowUpRight size={12} className="text-green-500" />
                    {metrics.totalOrders} orders
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold">
                    {formatPrice(metrics.averageOrderValue)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Customer LTV</CardTitle>
                  <Heart className="w-5 h-5 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-pink-500">
                    {formatPrice(metrics.clv)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Lifetime value</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Repeat Rate</CardTitle>
                  <Repeat className="w-5 h-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-display font-bold text-green-500">
                    {metrics.repeatRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.repeatCustomers} repeat customers
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-display font-bold">{metrics.uniqueCustomers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Purchase Frequency</CardTitle>
                <Target className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-display font-bold">
                  {metrics.purchaseFrequency.toFixed(2)}x
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-display font-bold">{metrics.totalOrders}</div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="revenue" className="space-y-6">
            <TabsList>
              <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
              <TabsTrigger value="aov">AOV Trend</TabsTrigger>
              <TabsTrigger value="patterns">Purchase Patterns</TabsTrigger>
              <TabsTrigger value="customers">Top Customers</TabsTrigger>
            </TabsList>

            <TabsContent value="revenue">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>Daily revenue for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
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
                                  <p className="text-primary font-bold">
                                    {formatPrice(payload[0].value as number)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(var(--primary))"
                          fill="url(#colorRevenue)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aov">
              <Card>
                <CardHeader>
                  <CardTitle>Average Order Value Trend</CardTitle>
                  <CardDescription>Track how AOV changes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
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
                                  <p className="text-blue-500 font-bold">
                                    AOV: {formatPrice(payload[0].value as number)}
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="aov"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders by Day of Week</CardTitle>
                    <CardDescription>When do customers order most?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dayOfWeekData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="name" className="text-xs" />
                          <YAxis className="text-xs" />
                          <Tooltip />
                          <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Order Status Distribution</CardTitle>
                    <CardDescription>Current order status breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="status"
                            label={({ status, count }) => `${status}: ${count}`}
                          >
                            {statusData.map((_, index) => (
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

            <TabsContent value="customers">
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
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminAnalytics;
