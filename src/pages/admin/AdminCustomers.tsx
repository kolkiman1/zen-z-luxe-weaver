import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Users, 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { motion } from 'framer-motion';

interface Customer {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
  has_purchased: boolean;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch orders to calculate purchase data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('user_id, total_amount');

      if (ordersError) throw ordersError;

      // Calculate order stats per user
      const orderStats: Record<string, { count: number; total: number }> = {};
      orders?.forEach((order) => {
        if (!orderStats[order.user_id]) {
          orderStats[order.user_id] = { count: 0, total: 0 };
        }
        orderStats[order.user_id].count++;
        orderStats[order.user_id].total += Number(order.total_amount);
      });

      // Combine profiles with order stats
      const customersData: Customer[] = (profiles || []).map((profile) => ({
        user_id: profile.user_id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        city: profile.city,
        created_at: profile.created_at,
        total_orders: orderStats[profile.user_id]?.count || 0,
        total_spent: orderStats[profile.user_id]?.total || 0,
        has_purchased: (orderStats[profile.user_id]?.count || 0) > 0,
      }));

      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'purchased') return matchesSearch && customer.has_purchased;
    if (activeTab === 'not-purchased') return matchesSearch && !customer.has_purchased;
    return matchesSearch;
  });

  const purchasedCount = customers.filter((c) => c.has_purchased).length;
  const notPurchasedCount = customers.filter((c) => !c.has_purchased).length;

  return (
    <>
      <Helmet>
        <title>Customer Management | zen-z.store Admin</title>
      </Helmet>

      <AdminLayout title="Customer Management">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Customers
                    </CardTitle>
                    <Users className="w-5 h-5 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-display">{customers.length}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Customers with Purchases
                    </CardTitle>
                    <ShoppingBag className="w-5 h-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-display text-green-500">{purchasedCount}</div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Customers without Purchases
                    </CardTitle>
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-display text-orange-500">{notPurchasedCount}</div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Tabs and Search */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="all">
                    All ({customers.length})
                  </TabsTrigger>
                  <TabsTrigger value="purchased">
                    Purchased ({purchasedCount})
                  </TabsTrigger>
                  <TabsTrigger value="not-purchased">
                    Not Purchased ({notPurchasedCount})
                  </TabsTrigger>
                </TabsList>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-80"
                  />
                </div>
              </div>

              <TabsContent value={activeTab} className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Total Spent</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No customers found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <TableRow key={customer.user_id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-primary font-medium">
                                      {customer.full_name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{customer.full_name || 'No name'}</p>
                                    <Badge 
                                      variant={customer.has_purchased ? "default" : "secondary"}
                                      className={customer.has_purchased ? "bg-green-500/20 text-green-500" : ""}
                                    >
                                      {customer.has_purchased ? 'Buyer' : 'Prospect'}
                                    </Badge>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span>{customer.email || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Phone className="w-4 h-4 text-muted-foreground" />
                                    <span>{customer.phone || 'N/A'}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span>{customer.city || 'N/A'}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{customer.total_orders}</span>
                              </TableCell>
                              <TableCell>
                                <span className="font-display text-primary">
                                  {formatPrice(customer.total_spent)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(customer.created_at).toLocaleDateString()}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </AdminLayout>
    </>
  );
};

export default AdminCustomers;