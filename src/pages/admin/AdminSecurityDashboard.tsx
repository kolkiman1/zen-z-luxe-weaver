import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, Shield, AlertTriangle, XCircle, CheckCircle, 
  Eye, RefreshCw, Bell, Lock, User, Clock, Activity
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityEvent {
  id: string;
  event_type: string;
  user_id: string | null;
  user_email: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: Record<string, unknown>;
  severity: string;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

interface NotificationSettings {
  id?: string;
  email_notifications: boolean;
  notify_on_admin_actions: boolean;
  notify_on_security_events: boolean;
  notify_on_critical_only: boolean;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
    default:
      return 'outline';
  }
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <XCircle className="w-4 h-4" />;
    case 'high':
      return <AlertTriangle className="w-4 h-4" />;
    case 'medium':
      return <Eye className="w-4 h-4" />;
    case 'low':
    default:
      return <Shield className="w-4 h-4" />;
  }
};

const getEventTypeLabel = (eventType: string) => {
  const labels: Record<string, string> = {
    failed_login: 'Failed Login',
    rate_limit_hit: 'Rate Limit Exceeded',
    suspicious_activity: 'Suspicious Activity',
    unauthorized_access: 'Unauthorized Access',
  };
  return labels[eventType] || eventType;
};

const AdminSecurityDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    notify_on_admin_actions: true,
    notify_on_security_events: true,
    notify_on_critical_only: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    unresolved: 0,
    last24h: 0,
  });

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const typedData = (data || []) as SecurityEvent[];
      setEvents(typedData);

      // Calculate stats
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      setStats({
        total: typedData.length,
        critical: typedData.filter(e => e.severity === 'critical').length,
        unresolved: typedData.filter(e => !e.resolved).length,
        last24h: typedData.filter(e => new Date(e.created_at) > last24h).length,
      });
    } catch (error) {
      console.error('Error fetching security events:', error);
      toast.error('Failed to fetch security events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;
    
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
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setSavingSettings(true);
    try {
      if (settings.id) {
        const { error } = await supabase
          .from('admin_notification_settings')
          .update({
            email_notifications: settings.email_notifications,
            notify_on_admin_actions: settings.notify_on_admin_actions,
            notify_on_security_events: settings.notify_on_security_events,
            notify_on_critical_only: settings.notify_on_critical_only,
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('admin_notification_settings')
          .insert({
            user_id: user.id,
            email_notifications: settings.email_notifications,
            notify_on_admin_actions: settings.notify_on_admin_actions,
            notify_on_security_events: settings.notify_on_security_events,
            notify_on_critical_only: settings.notify_on_critical_only,
          })
          .select()
          .single();

        if (error) throw error;
        setSettings(prev => ({ ...prev, id: data.id }));
      }

      toast.success('Notification settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const resolveEvent = async (eventId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('security_events')
        .update({
          resolved: true,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success('Event marked as resolved');
      fetchEvents();
    } catch (error) {
      console.error('Error resolving event:', error);
      toast.error('Failed to resolve event');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
    fetchSettings();
  }, [user]);

  return (
    <AdminLayout title="Security Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={stats.critical > 0 ? 'border-destructive' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-3xl font-bold text-destructive">{stats.critical}</p>
                </div>
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={stats.unresolved > 0 ? 'border-amber-500' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unresolved</p>
                  <p className="text-3xl font-bold text-amber-500">{stats.unresolved}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Last 24h</p>
                  <p className="text-3xl font-bold">{stats.last24h}</p>
                </div>
                <Clock className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="events" className="w-full">
          <TabsList>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Events
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notification Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security Events
                    </CardTitle>
                    <CardDescription>
                      Monitor failed logins, rate limit hits, and suspicious activity
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={refreshing}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                    <p className="text-muted-foreground">No security events recorded</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your application is running smoothly
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                          event.resolved 
                            ? 'bg-muted/30 opacity-70' 
                            : event.severity === 'critical' 
                              ? 'border-destructive bg-destructive/5' 
                              : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className={`p-2 rounded-full ${
                          event.severity === 'critical' ? 'bg-destructive/10' :
                          event.severity === 'high' ? 'bg-amber-500/10' :
                          'bg-muted'
                        }`}>
                          {getSeverityIcon(event.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getSeverityColor(event.severity) as "default" | "secondary" | "destructive" | "outline"}>
                              {event.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium">
                              {getEventTypeLabel(event.event_type)}
                            </span>
                            {event.resolved && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                          
                          <div className="mt-2 text-sm text-muted-foreground space-y-1">
                            {event.user_email && (
                              <p className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                User: {event.user_email}
                              </p>
                            )}
                            {event.ip_address && (
                              <p className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                IP: {event.ip_address}
                              </p>
                            )}
                            {event.details && Object.keys(event.details).length > 0 && (
                              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                                {Object.entries(event.details).map(([key, value]) => (
                                  <p key={key}>
                                    <strong>{key}:</strong> {String(value)}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })} • {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        
                        {!event.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resolveEvent(event.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how you receive admin and security notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="text-base font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.email_notifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, email_notifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="admin-actions" className="text-base font-medium">
                        Admin Action Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when other admins make changes
                      </p>
                    </div>
                    <Switch
                      id="admin-actions"
                      checked={settings.notify_on_admin_actions}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, notify_on_admin_actions: checked }))
                      }
                      disabled={!settings.email_notifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="security-events" className="text-base font-medium">
                        Security Event Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about security events
                      </p>
                    </div>
                    <Switch
                      id="security-events"
                      checked={settings.notify_on_security_events}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, notify_on_security_events: checked }))
                      }
                      disabled={!settings.email_notifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="critical-only" className="text-base font-medium">
                        Critical Events Only
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Only receive alerts for critical security events
                      </p>
                    </div>
                    <Switch
                      id="critical-only"
                      checked={settings.notify_on_critical_only}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, notify_on_critical_only: checked }))
                      }
                      disabled={!settings.email_notifications || !settings.notify_on_security_events}
                    />
                  </div>
                </div>

                <Button onClick={saveSettings} disabled={savingSettings}>
                  {savingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurityDashboard;
