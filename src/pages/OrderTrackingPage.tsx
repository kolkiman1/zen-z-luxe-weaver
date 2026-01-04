import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
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
  XCircle,
  PackageCheck,
  ShieldCheck
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GuestOrderLookup from '@/components/orders/GuestOrderLookup';
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
  user_id: string | null;
  order_items: OrderItem[];
}

interface TimelineEvent {
  status: string;
  label: string;
  description: string;
  icon: React.ElementType;
  timestamp: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
}

const orderStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusInfo: Record<string, { icon: React.ElementType; label: string; description: string }> = {
  pending: { 
    icon: Clock, 
    label: 'Order Placed', 
    description: 'Your order has been received and is awaiting confirmation' 
  },
  confirmed: { 
    icon: ShieldCheck, 
    label: 'Order Confirmed', 
    description: 'Your order has been confirmed by our team' 
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
    icon: PackageCheck, 
    label: 'Delivered', 
    description: 'Your order has been delivered successfully' 
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
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [isGuestLookup, setIsGuestLookup] = useState(false);

  // Get prefill values from navigation state (from checkout redirect)
  const prefillState = location.state as { 
    orderNumber?: string; 
    email?: string; 
    phone?: string 
  } | null;

  // Determine if this is a guest lookup (no orderId in URL and no user)
  useEffect(() => {
    if (!authLoading) {
      if (!orderId && !user) {
        setIsGuestLookup(true);
        setLoading(false);
      } else if (!orderId && user) {
        // Logged in user without orderId - redirect to orders page
        navigate('/orders');
      }
    }
  }, [user, authLoading, orderId, navigate]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      // If user is logged in, fetch their order
      if (user) {
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
      } else {
        // For non-logged in users with orderId, show guest lookup
        setIsGuestLookup(true);
      }
      setLoading(false);
    };

    if (!authLoading && orderId) {
      fetchOrder();
    }

    // Set up realtime subscription for order updates
    if (user && orderId) {
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
            setOrder(prev => prev ? { ...prev, ...payload.new } : null);
            toast.success('Order status updated!');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, orderId, authLoading]);

  // Set up realtime subscription when order is loaded via guest lookup
  useEffect(() => {
    if (order && !orderId) {
      const channel = supabase
        .channel(`guest-order-${order.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `id=eq.${order.id}`
          },
          (payload) => {
            setOrder(prev => prev ? { ...prev, ...payload.new } : null);
            toast.success('Order status updated!');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [order, orderId]);

  const handleGuestOrderFound = (foundOrder: Order) => {
    setOrder(foundOrder);
    setIsGuestLookup(false);
  };

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
    if (!order) return;
    
    setCancelling(true);
    
    // For guest orders, we can't verify user_id
    const query = user 
      ? supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id).eq('user_id', user.id)
      : supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);

    const { error: updateError } = await query;

    if (updateError) {
      toast.error('Failed to cancel order. Please try again.');
    } else {
      setOrder({ ...order, status: 'cancelled' });
      toast.success('Order cancelled successfully');
    }
    setCancelling(false);
  };

  const getTimelineEvents = (): TimelineEvent[] => {
    if (!order) return [];
    const currentIndex = getCurrentStatusIndex();
    
    return orderStatuses.map((status, index) => ({
      status,
      label: statusInfo[status].label,
      description: statusInfo[status].description,
      icon: statusInfo[status].icon,
      timestamp: index <= currentIndex ? order.updated_at : null,
      isCompleted: index < currentIndex,
      isCurrent: index === currentIndex,
    }));
  };

  const getEstimatedDelivery = () => {
    if (!order) return null;
    const orderDate = new Date(order.created_at);
    const isDhaka = order.shipping_city.toLowerCase().includes('dhaka');
    const daysToAdd = isDhaka ? 3 : 5;
    orderDate.setDate(orderDate.getDate() + daysToAdd);
    return orderDate;
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

  // Show guest order lookup form
  if (isGuestLookup && !order) {
    return (
      <>
        <SEOHead
          title="Track Your Order"
          description="Track your order status using your order number and verification details."
        />
        <Header />
        <main className="pt-24 pb-16 min-h-screen bg-background">
          <div className="container-luxury py-12">
            <GuestOrderLookup 
              onOrderFound={handleGuestOrderFound}
              prefillOrderNumber={prefillState?.orderNumber}
              prefillEmail={prefillState?.email}
              prefillPhone={prefillState?.phone}
            />
            
            {user === null && (
              <div className="text-center mt-8">
                <p className="text-muted-foreground text-sm">
                  Have an account?{' '}
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign in
                  </Link>{' '}
                  to view all your orders
                </p>
              </div>
            )}
          </div>
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
            <div className="flex gap-4 justify-center">
              {user ? (
                <Link to="/orders">
                  <button className="btn-primary px-8 py-3">View All Orders</button>
                </Link>
              ) : (
                <Button onClick={() => { setIsGuestLookup(true); setError(null); }}>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();
  const timelineEvents = getTimelineEvents();
  const estimatedDelivery = getEstimatedDelivery();
  const canCancel = order.status === 'pending' && (user?.id === order.user_id || !order.user_id);

  return (
    <>
      <SEOHead
        title={`Track Order ${order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}`}
        description="Track your order status and delivery progress."
        noIndex={true}
      />

      <Header />

      <main className="pt-24 pb-16 min-h-screen bg-background">
        <div className="container-luxury">
          {/* Back Button */}
          {user ? (
            <Link to="/orders" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft size={18} />
              <span>Back to Orders</span>
            </Link>
          ) : (
            <button 
              onClick={() => { setOrder(null); setIsGuestLookup(true); }}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Track Another Order</span>
            </button>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Order Header with Status Card */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl mb-1">
                    Order {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
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
                  <Badge className={`text-sm px-4 py-2 border ${statusColors[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={cancelling}>
                          <XCircle size={16} className="mr-1" />
                          Cancel
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

              {/* Estimated Delivery */}
              {order.status !== 'cancelled' && order.status !== 'delivered' && estimatedDelivery && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                    <p className="font-display text-lg text-foreground">
                      {estimatedDelivery.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline Tracker */}
            {order.status !== 'cancelled' ? (
              <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                <h2 className="font-display text-xl mb-8">Order Timeline</h2>
                
                {/* Vertical Timeline for Mobile, Horizontal for Desktop */}
                <div className="relative">
                  {/* Desktop Horizontal Timeline */}
                  <div className="hidden md:block">
                    {/* Progress Line Background */}
                    <div className="absolute top-8 left-8 right-8 h-1 bg-muted rounded-full" />
                    {/* Progress Line Active */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `calc(${(currentStatusIndex / (orderStatuses.length - 1)) * 100}% - 64px)` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="absolute top-8 left-8 h-1 bg-primary rounded-full"
                    />

                    <div className="grid grid-cols-5 gap-4">
                      {timelineEvents.map((event, index) => {
                        const StatusIcon = event.icon;
                        return (
                          <motion.div
                            key={event.status}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col items-center text-center"
                          >
                            <motion.div 
                              initial={{ scale: 0.8 }}
                              animate={{ scale: event.isCurrent ? 1.1 : 1 }}
                              className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                event.isCompleted || event.isCurrent
                                  ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30' 
                                  : 'bg-card border-muted text-muted-foreground'
                              }`}
                            >
                              {event.isCompleted ? (
                                <CheckCircle2 size={28} />
                              ) : (
                                <StatusIcon size={28} />
                              )}
                              {event.isCurrent && (
                                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card animate-pulse" />
                              )}
                            </motion.div>
                            <div className="mt-4">
                              <p className={`font-medium text-sm ${
                                event.isCurrent ? 'text-primary' : event.isCompleted ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {event.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 max-w-[120px]">
                                {event.description}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Vertical Timeline */}
                  <div className="md:hidden">
                    <div className="relative pl-8">
                      {/* Vertical Line */}
                      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-muted" />
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="absolute left-3 top-0 w-0.5 bg-primary"
                      />

                      <div className="space-y-8">
                        {timelineEvents.map((event, index) => {
                          const StatusIcon = event.icon;
                          return (
                            <motion.div
                              key={event.status}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="relative flex gap-4"
                            >
                              <div 
                                className={`absolute -left-5 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                                  event.isCompleted || event.isCurrent
                                    ? 'bg-primary border-primary text-primary-foreground' 
                                    : 'bg-card border-muted text-muted-foreground'
                                }`}
                              >
                                {event.isCompleted ? (
                                  <CheckCircle2 size={20} />
                                ) : (
                                  <StatusIcon size={20} />
                                )}
                              </div>
                              <div className="flex-1 pb-2">
                                <p className={`font-medium ${
                                  event.isCurrent ? 'text-primary' : event.isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {event.label}
                                </p>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {event.description}
                                </p>
                                {event.isCurrent && (
                                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    Current Status
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center">
                <XCircle size={48} className="mx-auto text-destructive mb-4" />
                <p className="text-destructive font-display text-xl">This order has been cancelled</p>
                <p className="text-muted-foreground mt-2">If you have any questions, please contact our support team.</p>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="font-display text-xl mb-6">Order Items ({order.order_items.length})</h2>
                <div className="space-y-4">
                  {order.order_items.map((item, index) => (
                    <motion.div 
                      key={item.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      {item.product_image && (
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          className="w-20 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Qty: {item.quantity}
                          {item.size && ` • Size: ${item.size}`}
                          {item.color && ` • Color: ${item.color}`}
                        </p>
                        <p className="text-sm text-primary mt-1">
                          {formatPrice(Number(item.price))} each
                        </p>
                      </div>
                      <p className="font-display text-lg">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Amount</span>
                    <span className="font-display text-2xl text-primary">
                      {formatPrice(Number(order.total_amount))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Details Sidebar */}
              <div className="space-y-6">
                {/* Shipping Info */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin size={20} className="text-primary" />
                    </div>
                    <h3 className="font-display text-lg">Shipping Address</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {order.shipping_address}<br />
                    {order.shipping_city}
                    {order.shipping_postal_code && `, ${order.shipping_postal_code}`}
                  </p>
                </div>

                {/* Payment Info */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard size={20} className="text-primary" />
                    </div>
                    <h3 className="font-display text-lg">Payment Method</h3>
                  </div>
                  <p className="text-muted-foreground">
                    {getPaymentMethodLabel(order.payment_method)}
                  </p>
                </div>

                {/* Need Help */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
                  <h3 className="font-display text-lg mb-2">Need Help?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have any questions about your order, our team is here to help.
                  </p>
                  <Link to="/contact">
                    <Button variant="outline" size="sm" className="w-full">
                      Contact Support
                    </Button>
                  </Link>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
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
