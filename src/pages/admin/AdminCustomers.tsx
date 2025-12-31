import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  Eye,
  Package,
  CreditCard,
  Home
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Customer {
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  avatar_url: string | null;
  created_at: string;
  total_orders: number;
  total_spent: number;
  has_purchased: boolean;
}

interface CustomerOrder {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_address: string;
  shipping_city: string;
}

interface CustomerAddress {
  id: string;
  label: string;
  full_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string | null;
  phone: string | null;
  is_default: boolean;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [customerAddresses, setCustomerAddresses] = useState<CustomerAddress[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
        address: profile.address,
        postal_code: profile.postal_code,
        avatar_url: profile.avatar_url,
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

  const fetchCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setLoadingDetails(true);

    try {
      const [ordersRes, addressesRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, status, total_amount, created_at, shipping_address, shipping_city')
          .eq('user_id', customer.user_id)
          .order('created_at', { ascending: false }),
        supabase
          .from('customer_addresses')
          .select('*')
          .eq('user_id', customer.user_id)
          .order('is_default', { ascending: false }),
      ]);

      if (ordersRes.data) setCustomerOrders(ordersRes.data);
      if (addressesRes.data) setCustomerAddresses(addressesRes.data);
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoadingDetails(false);
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

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'City', 'Total Orders', 'Total Spent', 'Status', 'Joined Date'];
    const csvData = filteredCustomers.map((customer) => [
      customer.full_name || 'N/A',
      customer.email || 'N/A',
      customer.phone || 'N/A',
      customer.city || 'N/A',
      customer.total_orders.toString(),
      customer.total_spent.toString(),
      customer.has_purchased ? 'Buyer' : 'Prospect',
      new Date(customer.created_at).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredCustomers.length} customers to CSV`);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    processing: 'bg-blue-500/20 text-blue-500',
    shipped: 'bg-purple-500/20 text-purple-500',
    delivered: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
  };

  return (
    <>
      <Helmet>
        <title>Customer Management | Gen-zee.store Admin</title>
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

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or phone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-80"
                    />
                  </div>
                  <Button variant="outline" onClick={exportToCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
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
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCustomers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No customers found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredCustomers.map((customer) => (
                            <TableRow key={customer.user_id} className="cursor-pointer hover:bg-muted/50" onClick={() => fetchCustomerDetails(customer)}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={customer.avatar_url || ''} alt={customer.full_name || 'Customer'} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                      {customer.full_name?.charAt(0)?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
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
                              <TableCell>
                                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); fetchCustomerDetails(customer); }}>
                                  <Eye className="w-4 h-4" />
                                </Button>
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

      {/* Customer Detail Modal */}
      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          
          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : selectedCustomer && (
            <ScrollArea className="max-h-[70vh] pr-4">
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedCustomer.avatar_url || ''} alt={selectedCustomer.full_name || 'Customer'} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {selectedCustomer.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-display">{selectedCustomer.full_name || 'No name'}</h3>
                    <p className="text-muted-foreground">{selectedCustomer.email}</p>
                    <Badge 
                      variant={selectedCustomer.has_purchased ? "default" : "secondary"}
                      className={selectedCustomer.has_purchased ? "bg-green-500/20 text-green-500 mt-1" : "mt-1"}
                    >
                      {selectedCustomer.has_purchased ? 'Buyer' : 'Prospect'}
                    </Badge>
                  </div>
                </div>

                {/* Contact & Profile Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedCustomer.phone || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">City</p>
                      <p className="font-medium">{selectedCustomer.city || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                      <p className="font-medium">{selectedCustomer.total_orders}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="font-medium text-primary">{formatPrice(selectedCustomer.total_spent)}</p>
                    </div>
                  </div>
                </div>

                {selectedCustomer.address && (
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Primary Address</p>
                    </div>
                    <p className="font-medium">
                      {selectedCustomer.address}
                      {selectedCustomer.city && `, ${selectedCustomer.city}`}
                      {selectedCustomer.postal_code && ` - ${selectedCustomer.postal_code}`}
                    </p>
                  </div>
                )}

                {/* Saved Addresses */}
                {customerAddresses.length > 0 && (
                  <div>
                    <h4 className="font-display text-lg mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Saved Addresses ({customerAddresses.length})
                    </h4>
                    <div className="space-y-2">
                      {customerAddresses.map((address) => (
                        <div key={address.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">{address.label}</Badge>
                            {address.is_default && <Badge className="text-xs bg-primary/20 text-primary">Default</Badge>}
                          </div>
                          <p className="font-medium">{address.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}
                            {address.postal_code && ` - ${address.postal_code}`}
                          </p>
                          {address.phone && (
                            <p className="text-sm text-muted-foreground">{address.phone}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Orders */}
                {customerOrders.length > 0 && (
                  <div>
                    <h4 className="font-display text-lg mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Orders ({customerOrders.length})
                    </h4>
                    <div className="space-y-2">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()} • {order.shipping_city}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-primary">{formatPrice(Number(order.total_amount))}</p>
                            <Badge className={statusColors[order.status] || ''}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {customerOrders.length === 0 && customerAddresses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No orders or saved addresses yet</p>
                  </div>
                )}

                {/* Member Since */}
                <div className="pt-4 border-t border-border text-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  Member since {new Date(selectedCustomer.created_at).toLocaleDateString()}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminCustomers;