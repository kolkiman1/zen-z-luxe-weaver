import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, Globe, LogOut, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SessionInfo {
  id: string;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
}

function parseUserAgent(ua: string): { deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'; browser: string; os: string } {
  const lowerUa = ua.toLowerCase();
  
  // Device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
  if (/tablet|ipad/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|android|iphone|ipod/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/windows|macintosh|linux/i.test(ua)) {
    deviceType = 'desktop';
  }
  
  // Browser
  let browser = 'Unknown Browser';
  if (lowerUa.includes('edg/')) browser = 'Edge';
  else if (lowerUa.includes('chrome')) browser = 'Chrome';
  else if (lowerUa.includes('safari') && !lowerUa.includes('chrome')) browser = 'Safari';
  else if (lowerUa.includes('firefox')) browser = 'Firefox';
  else if (lowerUa.includes('opera') || lowerUa.includes('opr')) browser = 'Opera';
  
  // OS
  let os = 'Unknown OS';
  if (lowerUa.includes('windows')) os = 'Windows';
  else if (lowerUa.includes('mac os') || lowerUa.includes('macintosh')) os = 'macOS';
  else if (lowerUa.includes('linux')) os = 'Linux';
  else if (lowerUa.includes('android')) os = 'Android';
  else if (lowerUa.includes('iphone') || lowerUa.includes('ipad')) os = 'iOS';
  
  return { deviceType, browser, os };
}

function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case 'mobile':
      return <Smartphone className="w-5 h-5" />;
    case 'tablet':
      return <Tablet className="w-5 h-5" />;
    case 'desktop':
      return <Monitor className="w-5 h-5" />;
    default:
      return <Globe className="w-5 h-5" />;
  }
}

export default function SessionsCard() {
  const { session: currentSession } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState<string | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      // Supabase doesn't expose a session list API directly.
      // We'll show the current session info only
      // For full session management, you'd need a custom backend or database.
      if (currentSession) {
        const parsed = parseUserAgent(navigator.userAgent);
        const sessionInfo: SessionInfo = {
          id: currentSession.access_token.slice(-8),
          userAgent: navigator.userAgent,
          createdAt: new Date(currentSession.expires_at ? (currentSession.expires_at * 1000 - 3600000) : Date.now()).toISOString(),
          isCurrent: true,
          ...parsed,
        };
        setSessions([sessionInfo]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentSession]);

  const handleSignOutCurrent = async () => {
    setSigningOut('current');
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    } finally {
      setSigningOut(null);
    }
  };

  const handleSignOutAllDevices = async () => {
    setSigningOutAll(true);
    try {
      // Sign out from all sessions using scope: 'global'
      await supabase.auth.signOut({ scope: 'global' });
      toast.success('Signed out from all devices');
    } catch (error) {
      toast.error('Failed to sign out from all devices');
    } finally {
      setSigningOutAll(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Active Sessions
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active sessions found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.browser} on {session.os}</span>
                        {session.isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            This device
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Started {new Date(session.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {session.isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOutCurrent}
                      disabled={signingOut === 'current'}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {signingOut === 'current' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign out
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Sign out all devices */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-start gap-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Sign out everywhere</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will sign you out from all devices including this one. You'll need to sign in again.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="mt-3"
                        disabled={signingOutAll}
                      >
                        {signingOutAll ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <LogOut className="w-4 h-4 mr-2" />
                        )}
                        Sign out all devices
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sign out from all devices?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will immediately sign you out from every device where you're logged in, including this one. You'll need to sign in again with your password.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOutAllDevices} className="bg-destructive hover:bg-destructive/90">
                          Sign out everywhere
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
