import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NotificationBadges {
  orders: number;
  inquiries: number;
  products: number;
  customers: number;
  security: number;
}

export const useAdminNotificationBadges = () => {
  const [badges, setBadges] = useState<NotificationBadges>({
    orders: 0,
    inquiries: 0,
    products: 0,
    customers: 0,
    security: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchBadges = async () => {
    try {
      // Fetch pending orders count
      const { count: pendingOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch pending inquiries count
      const { count: pendingInquiries } = await supabase
        .from('inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch unresolved security events count
      const { count: securityEvents } = await supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false);

      // Fetch low stock products count (stock_quantity < 5)
      const { count: lowStockProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lt('stock_quantity', 5);

      setBadges({
        orders: pendingOrders || 0,
        inquiries: pendingInquiries || 0,
        products: lowStockProducts || 0,
        customers: 0,
        security: securityEvents || 0,
      });
    } catch (error) {
      console.error('Error fetching notification badges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();

    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel('admin-orders-badges')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => fetchBadges()
      )
      .subscribe();

    const inquiriesChannel = supabase
      .channel('admin-inquiries-badges')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inquiries' },
        () => fetchBadges()
      )
      .subscribe();

    const securityChannel = supabase
      .channel('admin-security-badges')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'security_events' },
        () => fetchBadges()
      )
      .subscribe();

    const productsChannel = supabase
      .channel('admin-products-badges')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchBadges()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(inquiriesChannel);
      supabase.removeChannel(securityChannel);
      supabase.removeChannel(productsChannel);
    };
  }, []);

  return { badges, loading, refetch: fetchBadges };
};
