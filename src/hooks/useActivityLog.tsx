import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Json } from '@/integrations/supabase/types';

export type ActivityAction = 
  | 'admin_added'
  | 'admin_removed'
  | 'admin_invite_created'
  | 'admin_invite_cancelled'
  | 'product_created'
  | 'product_updated'
  | 'product_deleted'
  | 'order_status_updated'
  | 'discount_created'
  | 'discount_updated'
  | 'discount_deleted'
  | 'announcement_created'
  | 'announcement_updated'
  | 'announcement_deleted'
  | 'campaign_created'
  | 'campaign_deleted'
  | 'inquiry_updated';

export type TargetType = 
  | 'user'
  | 'product'
  | 'order'
  | 'discount'
  | 'announcement'
  | 'campaign'
  | 'inquiry';

export const useActivityLog = () => {
  const { user } = useAuth();

  const logActivity = async (
    action: ActivityAction,
    targetType: TargetType,
    targetId?: string,
    details?: Json
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('admin_activity_logs')
        .insert([{
          user_id: user.id,
          user_email: user.email || 'Unknown',
          action,
          target_type: targetType,
          target_id: targetId || null,
          details: details || null,
        }]);

      if (error) {
        console.error('Failed to log activity:', error);
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};
