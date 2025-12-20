import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { formatPrice } from '@/lib/data';
import { toast } from 'sonner';
import { Bell, Package, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrderNotification {
  id: string;
  total_amount: number;
  shipping_city: string;
  created_at: string;
}

const AdminOrderNotifications = () => {
  const { isAdmin, loading } = useAdmin();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
        (payload) => {
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, loading]);

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
              className="absolute bottom-16 right-0 w-80 max-h-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-display font-medium">Recent Orders</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowPanel(false)}
                >
                  <X size={16} />
                </Button>
              </div>

              <div className="max-h-72 overflow-y-auto">
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
                        className="p-4 hover:bg-secondary/50 cursor-pointer transition-colors"
                        onClick={() => {
                          window.location.href = '/admin/orders';
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm">
                              #{order.id.slice(0, 8).toUpperCase()}
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
