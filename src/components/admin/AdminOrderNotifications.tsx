import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { Bell, Package, X, MessageCircle, Settings, Phone, Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface OrderNotification {
  id: string;
  order_number: string | null;
  total_amount: number;
  shipping_city: string;
  shipping_address: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  user_id: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
}

interface CustomerInfo {
  full_name: string | null;
  phone: string | null;
  email: string | null;
}

const WHATSAPP_SETTINGS_KEY = 'admin_whatsapp_settings';

interface WhatsAppSettings {
  enabled: boolean;
  phoneNumber: string;
  autoSend: boolean;
}

const getWhatsAppSettings = (): WhatsAppSettings => {
  try {
    const saved = localStorage.getItem(WHATSAPP_SETTINGS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading WhatsApp settings:', e);
  }
  return { enabled: false, phoneNumber: '', autoSend: false };
};

const saveWhatsAppSettings = (settings: WhatsAppSettings) => {
  localStorage.setItem(WHATSAPP_SETTINGS_KEY, JSON.stringify(settings));
};

const formatOrderMessage = (
  order: OrderNotification,
  items: OrderItem[],
  customer: CustomerInfo | null
): string => {
  const orderDate = new Date(order.created_at).toLocaleString('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  let message = `🛒 *NEW ORDER ALERT!*\n\n`;
  message += `📦 *Order Number:* ${order.order_number || order.id.slice(0, 8).toUpperCase()}\n`;
  message += `📅 *Date:* ${orderDate}\n\n`;

  message += `👤 *Customer Details:*\n`;
  message += `• Name: ${customer?.full_name || 'N/A'}\n`;
  message += `• Phone: ${customer?.phone || 'N/A'}\n`;
  message += `• Email: ${customer?.email || 'N/A'}\n\n`;

  message += `📍 *Delivery Address:*\n`;
  message += `• ${order.shipping_address}\n`;
  message += `• City: ${order.shipping_city}\n\n`;

  message += `🛍️ *Order Items:*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.product_name}\n`;
    message += `   • Qty: ${item.quantity} × ${formatPrice(Number(item.price))}\n`;
    if (item.size) message += `   • Size: ${item.size}\n`;
    if (item.color) message += `   • Color: ${item.color}\n`;
  });

  message += `\n💰 *Payment:*\n`;
  message += `• Method: ${order.payment_method.toUpperCase()}\n`;
  message += `• Total: *${formatPrice(Number(order.total_amount))}*\n`;

  if (order.notes) {
    message += `\n📝 *Customer Notes:*\n${order.notes}\n`;
  }

  message += `\n---\nView order: ${window.location.origin}/admin/orders`;

  return message;
};

const sendWhatsAppMessage = async (
  order: OrderNotification,
  phoneNumber: string,
  fetchOrderDetails: boolean = true
): Promise<boolean> => {
  try {
    let items: OrderItem[] = [];
    let customer: CustomerInfo | null = null;

    if (fetchOrderDetails) {
      // Fetch order items
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('id, product_name, quantity, price, size, color')
        .eq('order_id', order.id);

      items = orderItems || [];

      // Fetch customer info
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone, email')
        .eq('user_id', order.user_id)
        .single();

      customer = profile;
    }

    const message = formatOrderMessage(order, items, customer);
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
};

const AdminOrderNotifications = () => {
  const { isAdmin, loading } = useAdmin();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>(getWhatsAppSettings);
  const [sendingOrderId, setSendingOrderId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateSettings = (updates: Partial<WhatsAppSettings>) => {
    const newSettings = { ...whatsappSettings, ...updates };
    setWhatsappSettings(newSettings);
    saveWhatsAppSettings(newSettings);
  };

  useEffect(() => {
    if (loading || !isAdmin) return;

    // Subscribe to new orders
    const channel = supabase
      .channel('admin-order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        async (payload) => {
          const newOrder = payload.new as OrderNotification;
          setNotifications((prev) => [newOrder, ...prev].slice(0, 10));

          // Show toast notification
          toast.success('New Order Received!', {
            description: `Order from ${newOrder.shipping_city} - ${formatPrice(Number(newOrder.total_amount))}`,
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = '/admin/orders';
              },
            },
          });

          // Play notification sound
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }

          // Auto-send WhatsApp if enabled
          const settings = getWhatsAppSettings();
          if (settings.enabled && settings.autoSend && settings.phoneNumber) {
            setTimeout(() => {
              sendWhatsAppMessage(newOrder, settings.phoneNumber, true);
              toast.info('WhatsApp notification sent!', {
                description: 'Order details sent to your WhatsApp',
              });
            }, 1500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, loading]);

  const handleSendWhatsApp = async (order: OrderNotification) => {
    if (!whatsappSettings.phoneNumber) {
      toast.error('Please configure your WhatsApp number first');
      setShowSettings(true);
      return;
    }

    setSendingOrderId(order.id);
    const success = await sendWhatsAppMessage(order, whatsappSettings.phoneNumber, true);
    setSendingOrderId(null);

    if (success) {
      toast.success('WhatsApp opened with order details');
    } else {
      toast.error('Failed to open WhatsApp');
    }
  };

  if (!isAdmin || loading) return null;

  return (
    <>
      {/* Notification Sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleT0EF5bX0otgMQFRqto5PXtFEGC02bKWRDAFKbTp7a+Afj8HLn/EyYlkNhJIotm6gVQnBDqOyaNqOgkMjvD3pEsEAJDnsoddMgEXh+/9kTgADpby/5VDAA+V7/iJPAApmPH7hjkAD4b196E4AA2I9fuYPQAXjfT1mT4ADYX0/Y89ABCE8P6YPQAOgPD/nT4ACYDv/5k+AAmB8P6ZPwALgfD9mT8AD4Hw/Zg/AA2A8P6ZPwALgPD+mT8ACYH1/Zk/AAmB8P6YPwALgfD9mT8ADYHw/pk/AA2B8P2YQAALgPD+mEAAC4Hw/ZlAAA2B8P6YQAANgfD9mEAAC4Dw/phBAA6B8P2YQQAOgfD9l0EAC4Hw/phBAA6A8P2YQQAOQPD9mEEADoHw/ZdCAAuA8P6YQgANgfH9mEIADIHw/phCAAuB8P6YQgANgPH9mEIADIHx/ZhDAA2A8f6XQwANgPH9mEMACoDx/phDAA2A8f6XRAARgPH9mEMADYDx/pdEAAyA8f6YRAAMQPH+l0QADIDx/phEAAyA8f6XRQANQPH9mEUADYDx/pdFAAyA8f6YRQAMgfH+l0UADYHx/ZhGAA2A8f6XRgAMgPH+mEYADIDx/pdGAA2A8f6YRgAMgPH+l0YADIDZ/ZJGACyA8f6XRg==" type="audio/wav" />
      </audio>

      {/* Floating Notification Bell */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPanel(!showPanel)}
          className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center"
        >
          <Bell size={24} />
          {notifications.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center font-medium"
            >
              {notifications.length}
            </motion.span>
          )}
        </motion.button>

        {/* Notification Panel */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-16 right-0 w-96 max-h-[32rem] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-medium">Recent Orders</h3>
                <div className="flex items-center gap-2">
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MessageCircle className="text-green-500" size={20} />
                          WhatsApp Notification Settings
                        </DialogTitle>
                        <DialogDescription>
                          Configure WhatsApp alerts for new orders
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Enable WhatsApp Alerts</Label>
                            <p className="text-xs text-muted-foreground">
                              Send order details to WhatsApp
                            </p>
                          </div>
                          <Switch
                            checked={whatsappSettings.enabled}
                            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="whatsapp-phone">WhatsApp Phone Number</Label>
                          <div className="flex gap-2">
                            <Phone className="h-10 w-10 p-2 bg-secondary rounded-lg text-muted-foreground" />
                            <Input
                              id="whatsapp-phone"
                              placeholder="+8801XXXXXXXXX"
                              value={whatsappSettings.phoneNumber}
                              onChange={(e) => updateSettings({ phoneNumber: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Include country code (e.g., +880 for Bangladesh)
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Auto-send on New Order</Label>
                            <p className="text-xs text-muted-foreground">
                              Automatically open WhatsApp when a new order comes in
                            </p>
                          </div>
                          <Switch
                            checked={whatsappSettings.autoSend}
                            onCheckedChange={(checked) => updateSettings({ autoSend: checked })}
                            disabled={!whatsappSettings.enabled}
                          />
                        </div>

                        {whatsappSettings.enabled && whatsappSettings.phoneNumber && (
                          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <CheckCircle className="text-green-500" size={16} />
                            <span className="text-sm text-green-600 dark:text-green-400">
                              WhatsApp notifications are active
                            </span>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowPanel(false)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>

              {/* WhatsApp Status Banner */}
              {whatsappSettings.enabled && whatsappSettings.phoneNumber && (
                <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20 flex items-center gap-2">
                  <MessageCircle className="text-green-500" size={14} />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    WhatsApp alerts {whatsappSettings.autoSend ? 'auto-sending' : 'enabled'}
                  </span>
                </div>
              )}

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No new orders yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.map((order) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              window.location.href = '/admin/orders';
                            }}
                          >
                            <p className="font-medium text-sm">
                              {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.shipping_city}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-primary/20 text-primary text-xs">
                              {formatPrice(Number(order.total_amount))}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        {/* WhatsApp Send Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-2 text-green-600 border-green-500/30 hover:bg-green-500/10 hover:text-green-700"
                          onClick={() => handleSendWhatsApp(order)}
                          disabled={sendingOrderId === order.id}
                        >
                          {sendingOrderId === order.id ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                <Send size={14} className="mr-2" />
                              </motion.div>
                              Preparing...
                            </>
                          ) : (
                            <>
                              <MessageCircle size={14} className="mr-2" />
                              Send to WhatsApp
                            </>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border bg-secondary/30">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    window.location.href = '/admin/orders';
                  }}
                >
                  View All Orders
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminOrderNotifications;
