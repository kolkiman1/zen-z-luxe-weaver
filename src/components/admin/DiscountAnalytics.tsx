import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  Tag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  ShoppingBag,
  Calendar,
  Award,
  Target,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';

interface DiscountCodeStats {
  id: string;
  code: string;
  type: string;
  value: number;
  usageLimit: number;
  usedCount: number;
  ordersWithCode: number;
  totalDiscountGiven: number;
  revenueGenerated: number;
  avgOrderValue: number;
}

interface OrderWithDiscount {
  id: string;
  total_amount: number;
  discount_amount: number;
  discount_code_id: string | null;
  created_at: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#10b981', '#f59e0b'];

const DiscountAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [orders, setOrders] = useState<OrderWithDiscount[]>([]);
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(dateRange));

    const [ordersRes, codesRes] = await Promise.all([
      supabase
        .from('orders')
        .select('id, total_amount, discount_amount, discount_code_id, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      supabase
        .from('discount_codes')
        .select('*')
        .order('used_count', { ascending: false }),
    ]);

    if (ordersRes.data) setOrders(ordersRes.data);
    if (codesRes.data) setDiscountCodes(codesRes.data);
    setLoading(false);
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const ordersWithDiscount = orders.filter(o => o.discount_code_id);
    const ordersWithoutDiscount = orders.filter(o => !o.discount_code_id);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const revenueWithDiscount = ordersWithDiscount.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const revenueWithoutDiscount = ordersWithoutDiscount.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalDiscountGiven = orders.reduce((sum, o) => sum + Number(o.discount_amount || 0), 0);

    const discountUsageRate = orders.length > 0 
      ? (ordersWithDiscount.length / orders.length) * 100 
      : 0;

    const avgOrderWithDiscount = ordersWithDiscount.length > 0 
      ? revenueWithDiscount / ordersWithDiscount.length 
      : 0;
    const avgOrderWithoutDiscount = ordersWithoutDiscount.length > 0 
      ? revenueWithoutDiscount / ordersWithoutDiscount.length 
      : 0;

    // ROI: Revenue generated from discounted orders vs discount given
    const discountROI = totalDiscountGiven > 0 
      ? ((revenueWithDiscount - totalDiscountGiven) / totalDiscountGiven) * 100 
      : 0;

    return {
      totalOrders: orders.length,
      ordersWithDiscount: ordersWithDiscount.length,
      ordersWithoutDiscount: ordersWithoutDiscount.length,
      totalRevenue,
      revenueWithDiscount,
      revenueWithoutDiscount,
      totalDiscountGiven,
      discountUsageRate,
      avgOrderWithDiscount,
      avgOrderWithoutDiscount,
      discountROI,
    };
  }, [orders]);

  // Code performance data
  const codePerformance = useMemo(() => {
    const codeMap: Record<string, { 
      code: string; 
      orders: number; 
      revenue: number; 
      discountGiven: number;
      type: string;
      value: number;
    }> = {};

    discountCodes.forEach(dc => {
      codeMap[dc.id] = {
        code: dc.code,
        orders: 0,
        revenue: 0,
        discountGiven: 0,
        type: dc.type,
        value: Number(dc.value),
      };
    });

    orders.forEach(o => {
      if (o.discount_code_id && codeMap[o.discount_code_id]) {
        codeMap[o.discount_code_id].orders++;
        codeMap[o.discount_code_id].revenue += Number(o.total_amount);
        codeMap[o.discount_code_id].discountGiven += Number(o.discount_amount || 0);
      }
    });

    return Object.entries(codeMap)
      .map(([id, data]) => ({
        id,
        ...data,
        avgOrder: data.orders > 0 ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders, discountCodes]);

  // Daily discount usage trend
  const dailyTrend = useMemo(() => {
    const grouped: Record<string, { date: string; withDiscount: number; withoutDiscount: number; discountAmount: number }> = {};
    
    orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!grouped[date]) {
        grouped[date] = { date, withDiscount: 0, withoutDiscount: 0, discountAmount: 0 };
      }
      if (o.discount_code_id) {
        grouped[date].withDiscount++;
        grouped[date].discountAmount += Number(o.discount_amount || 0);
      } else {
        grouped[date].withoutDiscount++;
      }
    });

    return Object.values(grouped);
  }, [orders]);

  // Discount type distribution
  const typeDistribution = useMemo(() => {
    const percentageCodes = discountCodes.filter(c => c.type === 'percentage');
    const fixedCodes = discountCodes.filter(c => c.type === 'fixed');
    
    const percentageUsage = percentageCodes.reduce((sum, c) => sum + c.used_count, 0);
    const fixedUsage = fixedCodes.reduce((sum, c) => sum + c.used_count, 0);

    return [
      { name: 'Percentage', value: percentageUsage, count: percentageCodes.length },
      { name: 'Fixed Amount', value: fixedUsage, count: fixedCodes.length },
    ];
  }, [discountCodes]);

  // Top performing codes
  const topCodes = useMemo(() => {
    return codePerformance.slice(0, 5);
  }, [codePerformance]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Tag className="text-primary" size={20} />
          Discount Code Analytics
        </h3>
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
              <CardTitle className="text-sm font-medium">Discount Usage Rate</CardTitle>
              <Percent className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-primary">
                {metrics.discountUsageRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.ordersWithDiscount} of {metrics.totalOrders} orders
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Discounts Given</CardTitle>
              <DollarSign className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-red-500">
                {formatPrice(metrics.totalDiscountGiven)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Savings for customers
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue from Discounts</CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-display font-bold text-green-500">
                {formatPrice(metrics.revenueWithDiscount)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalRevenue > 0 ? ((metrics.revenueWithDiscount / metrics.totalRevenue) * 100).toFixed(1) : 0}% of total
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Discount ROI</CardTitle>
              <Target className="w-5 h-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-display font-bold ${metrics.discountROI >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.discountROI.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Return on discount investment
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AOV Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Order Value Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{formatPrice(metrics.avgOrderWithDiscount)}</p>
                <p className="text-xs text-muted-foreground">With Discount</p>
              </div>
              <div className="p-4 bg-secondary/50 rounded-lg text-center">
                <p className="text-2xl font-bold">{formatPrice(metrics.avgOrderWithoutDiscount)}</p>
                <p className="text-xs text-muted-foreground">Without Discount</p>
              </div>
            </div>
            {metrics.avgOrderWithDiscount > metrics.avgOrderWithoutDiscount ? (
              <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
                <TrendingUp size={12} />
                Discounts increase AOV by {formatPrice(metrics.avgOrderWithDiscount - metrics.avgOrderWithoutDiscount)}
              </p>
            ) : metrics.avgOrderWithDiscount < metrics.avgOrderWithoutDiscount ? (
              <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                <TrendingDown size={12} />
                Discounted orders have lower AOV by {formatPrice(metrics.avgOrderWithoutDiscount - metrics.avgOrderWithDiscount)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Discount Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              {typeDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-xs">{item.name}: {item.value} uses ({item.count} codes)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend */}
      {dailyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Discount Usage Over Time</CardTitle>
            <CardDescription>Orders with and without discount codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrend}>
                  <defs>
                    <linearGradient id="colorWithDiscount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWithoutDiscount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="text-sm font-medium">{data.date}</p>
                            <p className="text-green-500">With Discount: {data.withDiscount}</p>
                            <p className="text-primary">Without Discount: {data.withoutDiscount}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="monotone" dataKey="withDiscount" stroke="#10b981" fill="url(#colorWithDiscount)" strokeWidth={2} name="With Discount" />
                  <Area type="monotone" dataKey="withoutDiscount" stroke="#6366f1" fill="url(#colorWithoutDiscount)" strokeWidth={2} name="Without Discount" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="text-yellow-500" size={20} />
            Top Performing Codes
          </CardTitle>
          <CardDescription>Codes generating the most revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {topCodes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Tag size={40} className="mx-auto mb-2 opacity-50" />
              <p>No discount code usage data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCodes.map((code, index) => (
                <div key={code.id} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                    index === 1 ? 'bg-gray-300/20 text-gray-600' :
                    index === 2 ? 'bg-amber-600/20 text-amber-700' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{code.code}</span>
                        <Badge variant="outline" className="text-xs">
                          {code.type === 'percentage' ? `${code.value}%` : `৳${code.value}`}
                        </Badge>
                      </div>
                      <span className="text-sm font-bold text-primary">{formatPrice(code.revenue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{code.orders} orders • AOV: {formatPrice(code.avgOrder)}</span>
                      <span className="text-red-500">-{formatPrice(code.discountGiven)} given</span>
                    </div>
                    <Progress 
                      value={topCodes[0]?.revenue ? (code.revenue / topCodes[0].revenue) * 100 : 0} 
                      className="h-1 mt-2" 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Code Usage Stats Table */}
      {codePerformance.length > 5 && (
        <Card>
          <CardHeader>
            <CardTitle>All Discount Codes Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">Code</th>
                    <th className="text-left py-2 px-3">Type</th>
                    <th className="text-right py-2 px-3">Orders</th>
                    <th className="text-right py-2 px-3">Revenue</th>
                    <th className="text-right py-2 px-3">Discount Given</th>
                    <th className="text-right py-2 px-3">Avg Order</th>
                  </tr>
                </thead>
                <tbody>
                  {codePerformance.map(code => (
                    <tr key={code.id} className="border-b hover:bg-secondary/30">
                      <td className="py-2 px-3 font-mono font-medium">{code.code}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-xs">
                          {code.type === 'percentage' ? `${code.value}%` : `৳${code.value}`}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right">{code.orders}</td>
                      <td className="py-2 px-3 text-right text-green-600">{formatPrice(code.revenue)}</td>
                      <td className="py-2 px-3 text-right text-red-500">-{formatPrice(code.discountGiven)}</td>
                      <td className="py-2 px-3 text-right">{formatPrice(code.avgOrder)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DiscountAnalytics;
