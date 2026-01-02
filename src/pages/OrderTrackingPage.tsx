import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';
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
  XCircle,
  RefreshCw,
  Bell,
  ShieldCheck
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/contexts/AuthContext';
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
  order_number: string | null;
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

const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusInfo: Record<string, { icon: React.ElementType; label: string; description: string; color: string }> = {
  pending: { 
    icon: Clock, 
    label: 'Order Placed', 
    description: 'Your order has been received and is awaiting confirmation',
    color: 'text-yellow-500'
  },
  confirmed: { 
    icon: ShieldCheck, 
    label: 'Confirmed', 
    description: 'Your order has been confirmed and is being prepared',
    color: 'text-emerald-500'
  },
  processing: { 
    icon: Package, 
    label: 'Processing', 
    description: 'Your order is being prepared for shipment',
    color: 'text-blue-500'
  },
  shipped: { 
    icon: Truck, 
    label: 'Shipped', 
    description: 'Your order is on its way to you',
    color: 'text-purple-500'
  },
  delivered: { 
    icon: Home, 
    label: 'Delivered', 
    description: 'Your order has been delivered successfully',
    color: 'text-green-500'
  },
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  confirmed: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
  processing: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-500 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/30',
};

const OrderTrackingPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Initial fetch
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
        setLastUpdated(new Date());
      }
      setLoading(false);
    };

    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  // Real-time subscription
  useEffect(() => {
    if (!user || !orderId) return;

    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          const newData = payload.new as any;
          setOrder(prev => prev ? { ...prev, ...newData } : prev);
          setLastUpdated(new Date());
          setIsLive(true);
          
          // Show toast notification for status change
          if (newData.status && order?.status !== newData.status) {
            toast.success(`Order status updated to: ${newData.status.charAt(0).toUpperCase() + newData.status.slice(1)}`, {
              icon: <Bell className="h-4 w-4" />,
            });
          }
          
          setTimeout(() => setIsLive(false), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, orderId, order?.status]);

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
      rocket: 'Rocket',
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

  const getEstimatedDelivery = () => {
    if (!order) return null;
    const orderDate = new Date(order.created_at);
    const isDhaka = order.shipping_city.toLowerCase().includes('dhaka');
    const daysToAdd = isDhaka ? 3 : 7;
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
    return estimatedDate;
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
  const estimatedDelivery = getEstimatedDelivery();
  const displayOrderId = order.order_number || order.id.slice(0, 8).toUpperCase();

  return (
    <>
      <SEOHead
        title={`Track Order #${displayOrderId}`}
        description="Track your order status and delivery progress."
        noIndex={true}
      />

      <Header />

      <main className="pt-24 pb-16 min-h-screen bg-gradient-to-b from-background to-muted/20">
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
            {/* Order Header with Live Status */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="font-display text-2xl md:text-3xl">
                    Order #{displayOrderId}
                  </h1>
                  <AnimatePresence>
                    {isLive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-1 bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full text-xs"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-muted-foreground text-sm">
                  Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <RefreshCw size={12} />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={`text-sm px-4 py-1.5 border ${statusColors[order.status]}`}>
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

            {/* Estimated Delivery Card */}
            {order.status !== 'cancelled' && order.status !== 'delivered' && estimatedDelivery && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Truck className="text-primary" size={24} />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      By {estimatedDelivery.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                {order.shipping_city.toLowerCase().includes('dhaka') && order.notes?.includes('express') && (
                  <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                    Express Delivery
                  </Badge>
                )}
              </motion.div>
            )}

            {/* Enhanced Timeline Tracker */}
            {order.status !== 'cancelled' ? (
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <h2 className="font-display text-xl mb-8">Order Progress</h2>
                
                {/* Vertical Timeline for Mobile, Horizontal for Desktop */}
                <div className="relative">
                  {/* Desktop Horizontal Timeline */}
                  <div className="hidden md:block">
                    {/* Background Line */}
                    <div className="absolute top-8 left-8 right-8 h-1 bg-muted rounded-full" />
                    {/* Progress Line */}
                    <motion.div 
                      className="absolute top-8 left-8 h-1 bg-gradient-to-r from-primary to-primary/80 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `calc(${(currentStatusIndex / (orderStatuses.length - 1)) * 100}% - 64px)` 
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    {/* Status Steps */}
                    <div className="grid grid-cols-5 gap-4">
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
                            className="flex flex-col items-center text-center"
                          >
                            <motion.div 
                              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                                isCurrent
                                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20'
                                  : isCompleted 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted text-muted-foreground'
                              }`}
                              animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                              transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                            >
                              {isCompleted && index < currentStatusIndex ? (
                                <CheckCircle2 size={28} />
                              ) : (
                                <StatusIcon size={28} />
                              )}
                            </motion.div>
                            <div className="mt-4">
                              <p className={`font-medium text-sm ${
                                isCurrent 
                                  ? statusInfo[status].color 
                                  : isCompleted 
                                    ? 'text-foreground' 
                                    : 'text-muted-foreground'
                              }`}>
                                {statusInfo[status].label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 max-w-[120px] mx-auto">
                                {statusInfo[status].description}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Vertical Timeline */}
                  <div className="md:hidden space-y-0">
                    {orderStatuses.map((status, index) => {
                      const StatusIcon = statusInfo[status].icon;
                      const isCompleted = index <= currentStatusIndex;
                      const isCurrent = index === currentStatusIndex;
                      const isLast = index === orderStatuses.length - 1;

                      return (
                        <motion.div
                          key={status}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative flex gap-4"
                        >
                          {/* Vertical Line */}
                          {!isLast && (
                            <div className="absolute left-6 top-14 w-0.5 h-16 bg-muted">
                              {isCompleted && index < currentStatusIndex && (
                                <motion.div 
                                  className="w-full bg-primary"
                                  initial={{ height: 0 }}
                                  animate={{ height: '100%' }}
                                  transition={{ delay: index * 0.2, duration: 0.5 }}
                                />
                              )}
                            </div>
                          )}

                          {/* Icon */}
                          <motion.div 
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20'
                                : isCompleted 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                            }`}
                            animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                          >
                            {isCompleted && index < currentStatusIndex ? (
                              <CheckCircle2 size={22} />
                            ) : (
                              <StatusIcon size={22} />
                            )}
                          </motion.div>

                          {/* Content */}
                          <div className="pb-8 flex-1">
                            <p className={`font-medium ${
                              isCurrent 
                                ? statusInfo[status].color 
                                : isCompleted 
                                  ? 'text-foreground' 
                                  : 'text-muted-foreground'
                            }`}>
                              {statusInfo[status].label}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {statusInfo[status].description}
                            </p>
                            {isCurrent && (
                              <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-xs text-primary mt-2"
                              >
                                Current Status
                              </motion.p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <XCircle size={48} className="mx-auto text-destructive mb-3" />
                <p className="text-destructive font-medium text-lg">This order has been cancelled</p>
                <p className="text-muted-foreground text-sm mt-2">
                  Cancelled on {new Date(order.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
                <h2 className="font-display text-xl mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.order_items.map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 py-3 border-b border-border last:border-0"
                    >
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
                    </motion.div>
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