import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Activity, Shield, Package, ShoppingCart, Tag, Bell, Mail, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';

import type { Json } from '@/integrations/supabase/types';

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  details: Json;
  created_at: string;
}

const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    admin_added: 'Added Admin',
    admin_removed: 'Removed Admin',
    admin_invite_created: 'Created Admin Invite',
    admin_invite_cancelled: 'Cancelled Admin Invite',
    product_created: 'Created Product',
    product_updated: 'Updated Product',
    product_deleted: 'Deleted Product',
    order_status_updated: 'Updated Order Status',
    discount_created: 'Created Discount',
    discount_updated: 'Updated Discount',
    discount_deleted: 'Deleted Discount',
    announcement_created: 'Created Announcement',
    announcement_updated: 'Updated Announcement',
    announcement_deleted: 'Deleted Announcement',
    campaign_created: 'Created Campaign',
    campaign_deleted: 'Deleted Campaign',
    inquiry_updated: 'Updated Inquiry',
  };
  return labels[action] || action;
};

const getActionColor = (action: string): string => {
  if (action.includes('deleted') || action.includes('removed') || action.includes('cancelled')) {
    return 'destructive';
  }
  if (action.includes('created') || action.includes('added')) {
    return 'default';
  }
  return 'secondary';
};

const getTargetIcon = (targetType: string) => {
  const icons: Record<string, React.ReactNode> = {
    user: <User className="w-4 h-4" />,
    product: <Package className="w-4 h-4" />,
    order: <ShoppingCart className="w-4 h-4" />,
    discount: <Tag className="w-4 h-4" />,
    announcement: <Bell className="w-4 h-4" />,
    campaign: <Mail className="w-4 h-4" />,
    inquiry: <MessageSquare className="w-4 h-4" />,
  };
  return icons[targetType] || <Activity className="w-4 h-4" />;
};

const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <AdminLayout title="Activity Logs">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Admin Activity Logs
            </CardTitle>
            <CardDescription>
              Track all changes made by admins in the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No activity logs yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 bg-muted rounded-full">
                      {getTargetIcon(log.target_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getActionColor(log.action) as "default" | "secondary" | "destructive"}>
                          {getActionLabel(log.action)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          by <span className="font-medium text-foreground">{log.user_email}</span>
                        </span>
                      </div>
                      {log.details && typeof log.details === 'object' && !Array.isArray(log.details) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {(log.details as Record<string, unknown>).target_email && `Target: ${(log.details as Record<string, unknown>).target_email}`}
                          {(log.details as Record<string, unknown>).target_name && `Target: ${(log.details as Record<string, unknown>).target_name}`}
                          {(log.details as Record<string, unknown>).old_status && (log.details as Record<string, unknown>).new_status && 
                            `Status: ${(log.details as Record<string, unknown>).old_status} → ${(log.details as Record<string, unknown>).new_status}`}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(log.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminActivityLogs;
