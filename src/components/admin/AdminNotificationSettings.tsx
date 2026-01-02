import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';
import { Bell, Mail, Shield, Smartphone, TestTube, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationSettings {
  id?: string;
  email_notifications: boolean;
  notify_on_admin_actions: boolean;
  notify_on_security_events: boolean;
  notify_on_critical_only: boolean;
}

interface AdminNotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminNotificationSettings = ({ open, onOpenChange }: AdminNotificationSettingsProps) => {
  const { user } = useAuth();
  const { 
    isSupported, 
    isEnabled, 
    permission, 
    loading: pushLoading, 
    requestPermission, 
    testNotification 
  } = usePushNotifications();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    notify_on_admin_actions: true,
    notify_on_security_events: true,
    notify_on_critical_only: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && open) {
      fetchSettings();
    }
  }, [user, open]);

  const fetchSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          email_notifications: data.email_notifications ?? true,
          notify_on_admin_actions: data.notify_on_admin_actions ?? true,
          notify_on_security_events: data.notify_on_security_events ?? true,
          notify_on_critical_only: data.notify_on_critical_only ?? false,
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      if (settings.id) {
        const { error } = await supabase
          .from('admin_notification_settings')
          .update({
            email_notifications: updatedSettings.email_notifications,
            notify_on_admin_actions: updatedSettings.notify_on_admin_actions,
            notify_on_security_events: updatedSettings.notify_on_security_events,
            notify_on_critical_only: updatedSettings.notify_on_critical_only,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('admin_notification_settings')
          .insert({
            user_id: user.id,
            email_notifications: updatedSettings.email_notifications,
            notify_on_admin_actions: updatedSettings.notify_on_admin_actions,
            notify_on_security_events: updatedSettings.notify_on_security_events,
            notify_on_critical_only: updatedSettings.notify_on_critical_only,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSettings(prev => ({ ...prev, id: data.id }));
        }
      }

      toast.success('Settings saved');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handlePushPermission = async () => {
    await requestPermission();
  };

  const handleTestNotification = async () => {
    await testNotification();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="text-primary" size={20} />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure how you receive admin alerts and notifications
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Browser Push Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-primary" />
                <h3 className="font-medium">Browser Notifications</h3>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Get instant alerts in your browser
                    </p>
                  </div>
                  
                  {!isSupported ? (
                    <span className="text-xs text-muted-foreground">Not supported</span>
                  ) : isEnabled ? (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle size={16} />
                      <span className="text-sm">Enabled</span>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={handlePushPermission}
                      disabled={pushLoading}
                    >
                      {pushLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Enable
                    </Button>
                  )}
                </div>

                {isEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 border-t border-border"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestNotification}
                      className="w-full"
                    >
                      <TestTube size={14} className="mr-2" />
                      Send Test Notification
                    </Button>
                  </motion.div>
                )}

                {permission === 'denied' && (
                  <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded text-destructive text-xs">
                    <XCircle size={14} />
                    <span>Blocked - Enable in browser settings</span>
                  </div>
                )}
              </div>
            </div>

            {/* Email Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                <h3 className="font-medium">Email Notifications</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Order Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive emails for new orders
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => saveSettings({ email_notifications: checked })}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-actions">Admin Actions</Label>
                    <p className="text-xs text-muted-foreground">
                      Alerts for important admin activities
                    </p>
                  </div>
                  <Switch
                    id="admin-actions"
                    checked={settings.notify_on_admin_actions}
                    onCheckedChange={(checked) => saveSettings({ notify_on_admin_actions: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {/* Security Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <h3 className="font-medium">Security Alerts</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="security-events">Security Events</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified about security issues
                    </p>
                  </div>
                  <Switch
                    id="security-events"
                    checked={settings.notify_on_security_events}
                    onCheckedChange={(checked) => saveSettings({ notify_on_security_events: checked })}
                    disabled={saving}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="critical-only">Critical Only</Label>
                    <p className="text-xs text-muted-foreground">
                      Only receive high-severity alerts
                    </p>
                  </div>
                  <Switch
                    id="critical-only"
                    checked={settings.notify_on_critical_only}
                    onCheckedChange={(checked) => saveSettings({ notify_on_critical_only: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            {saving && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminNotificationSettings;
