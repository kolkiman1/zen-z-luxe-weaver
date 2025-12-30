import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { 
  Package, 
  Loader2, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Home,
  ArrowLeft,
  MapPin,
  CreditCard,
  XCircle
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useSeoSettings } from '@/hooks/useSiteSettings';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

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
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string | null;
  payment_method: string;
  notes: string | null;
  order_items: OrderItem[];
}

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];

const statusInfo: Record<string, { icon: React.ElementType; label: string; description: string }> = {
  pending: { 
    icon: Clock, 
    label: 'Order Placed', 
    description: 'Your order has been received and is awaiting confirmation' 
  },
  processing: { 
    icon: Package, 
    label: 'Processing', 
    description: 'Your order is being prepared for shipment' 
  },
  shipped: { 
    icon: Truck, 
    label: 'Shipped', 
    description: 'Your order is on its way to you' 
  },
  delivered: { 
    icon: Home, 
    label: 'Delivered', 
    description: 'Your order has been delivered successfully' 
  },
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  processing: 'bg-blue-500/20 text-blue-500',
  shipped: 'bg-purple-500/20 text-purple-500',
  delivered: 'bg-green-500/20 text-green-500',
  cancelled: 'bg-red-500/20 text-red-500',
};

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: seoSettings } = useSeoSettings();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  
  const siteName = seoSettings?.siteTitle?.split('|')[0]?.trim() || 'zen-z.store';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return;

      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        setError('Failed to fetch order details');
      } else if (!data) {
        setError('Order not found');
      } else {
        setOrder(data);
      }
      setLoading(false);
    };

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  const getCurrentStatusIndex = () => {
    if (!order) return 0;
    if (order.status === 'cancelled') return -1;
    return orderStatuses.indexOf(order.status);
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cod: 'Cash on Delivery',
      card: 'Card Payment',
      bkash: 'bKash',
      nagad: 'Nagad',
    };
    return labels[method] || method;
  };

  const handleCancelOrder = async () => {
    if (!order || !user) return;
    
    setCancelling(true);
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', order.id)
      .eq('user_id', user.id);

    if (updateError) {
      toast.error('Failed to cancel order. Please try again.');
    } else {
      setOrder({ ...order, status: 'cancelled' });
      toast.success('Order cancelled successfully');
    }
    setCancelling(false);
  };

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 min-h-screen">
          <div className="container-luxury text-center py-16">
            <Package size={64} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="font-display text-2xl mb-2">{error || 'Order not found'}</h2>
            <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for</p>
            <Link to="/orders">
              <button className="btn-primary px-8 py-3">View All Orders</button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <>
      <Helmet>
        <title>Track Order #{order.id.slice(0, 8).toUpperCase()} | {siteName}</title>
        <meta name="description" content="Track your order status and delivery progress." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Header />

      <main className="pt-24 pb-16 min-h-screen">
        <div className="container-luxury">
          {/* Back Button */}
          <Link to="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft size={18} />
            <span>Back to Orders</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Order Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl mb-1">
                  Order #{order.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="text-muted-foreground">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-sm px-4 py-1.5 ${statusColors[order.status]}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                {order.status === 'pending' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={cancelling}>
                        <XCircle size={16} className="mr-1" />
                        Cancel Order
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Your order will be cancelled and you will not receive the items.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelOrder} disabled={cancelling}>
                          {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>

            {/* Status Tracker */}
            {order.status !== 'cancelled' ? (
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-display text-xl mb-6">Order Progress</h2>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-border hidden md:block" />
                  <div 
                    className="absolute top-6 left-6 h-0.5 bg-primary hidden md:block transition-all duration-500"
                    style={{ width: `calc(${(currentStatusIndex / (orderStatuses.length - 1)) * 100}% - 48px)` }}
                  />

                  {/* Status Steps */}
                  <div className="grid md:grid-cols-4 gap-6">
                    {orderStatuses.map((status, index) => {
                      const StatusIcon = statusInfo[status].icon;
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;

                      return (
                        <motion.div
                          key={status}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-2"
                        >
                          <div 
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                              isCompleted 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isCompleted && index < currentStatusIndex ? (
                              <CheckCircle2 size={24} />
                            ) : (
                              <StatusIcon size={24} />
                            )}
                          </div>
                          <div className="flex-1 md:text-center">
                            <p className={`font-medium ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {statusInfo[status].label}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 hidden md:block">
                              {statusInfo[status].description}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive font-medium">This order has been cancelled</p>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-20 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Qty: {item.quantity}
                          {item.size && ` • Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                        <p className="text-sm text-primary mt-1">
                          {formatPrice(Number(item.price))} each
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="font-display text-xl text-primary">
                    {formatPrice(Number(order.total_amount))}
                  </span>
                </div>
              </div>

              {/* Order Details Sidebar */}
              <div className="space-y-6">
                {/* Shipping Info */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin size={20} className="text-primary" />
                    <h3 className="font-display text-lg">Shipping Address</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {order.shipping_address}<br />
                    {order.shipping_city}
                    {order.shipping_postal_code && `, ${order.shipping_postal_code}`}
                  </p>
                </div>

                {/* Payment Info */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={20} className="text-primary" />
                    <h3 className="font-display text-lg">Payment Method</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {getPaymentMethodLabel(order.payment_method)}
                  </p>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-display text-lg mb-2">Order Notes</h3>
                    <p className="text-muted-foreground text-sm">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default OrderTrackingPage;
