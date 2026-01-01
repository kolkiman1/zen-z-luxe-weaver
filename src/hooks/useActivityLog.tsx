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
  | 'inquiry_updated'
  | 'inquiry_replied'
  | 'email_template_updated';

export type TargetType = 
  | 'user'
  | 'product'
  | 'order'
  | 'discount'
  | 'announcement'
  | 'campaign'
  | 'inquiry'
  | 'site_settings';

// Actions that trigger email notifications
const NOTIFY_ACTIONS: ActivityAction[] = [
  'admin_added',
  'admin_removed',
  'admin_invite_created',
  'product_deleted',
  'order_status_updated',
  'discount_deleted',
];

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
      // Insert activity log
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
        return;
      }

      // Send notification for important actions
      if (NOTIFY_ACTIONS.includes(action)) {
        try {
          await supabase.functions.invoke('admin-notify', {
            body: {
              type: 'admin_action',
              action,
              actorEmail: user.email,
              targetType,
              targetId,
              details: details as Record<string, unknown>,
            },
          });
        } catch (notifyError) {
          // Don't fail the main action if notification fails
          console.error('Failed to send notification:', notifyError);
        }
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};
