import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Zap, 
  Gauge, 
  Image, 
  Film, 
  Sparkles,
  Monitor,
  Smartphone,
  RefreshCw,
  Check,
  AlertTriangle
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { usePerformance } from '@/contexts/PerformanceContext';
import { useCacheRefresh } from '@/hooks/useCacheRefresh';

const AdminPerformance = () => {
  const { settings, updateSettings, isLoading } = usePerformance();
  const { refreshAllSiteSettings } = useCacheRefresh();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTogglePerformanceMode = async () => {
    setIsSaving(true);
    const newValue = !settings.performanceMode;
    updateSettings({
      performanceMode: newValue,
      disableAnimations: newValue,
      disableParallax: newValue,
    });
    setTimeout(() => {
      setIsSaving(false);
      toast.success(
        newValue 
          ? 'Performance mode enabled - animations disabled for faster loading' 
          : 'Performance mode disabled - full animations restored'
      );
    }, 500);
  };

  const handleToggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
    toast.success('Setting updated');
  };

  const handleRefreshCache = async () => {
    setIsRefreshing(true);
    await refreshAllSiteSettings();
    setIsRefreshing(false);
    toast.success('Cache refreshed successfully');
  };

  return (
    <>
      <Helmet>
        <title>Performance Settings | Admin</title>
      </Helmet>

      <AdminLayout title="Performance Settings">
        <div className="space-y-6">
          {/* Performance Mode Banner */}
          <Card className={`border-2 transition-colors ${settings.performanceMode ? 'border-primary bg-primary/5' : 'border-border'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${settings.performanceMode ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <Zap size={24} />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Performance Mode
                      {settings.performanceMode && (
                        <Badge className="bg-primary text-primary-foreground">Active</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Enable to disable animations and optimize for faster page loads
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={settings.performanceMode}
                  onCheckedChange={handleTogglePerformanceMode}
                  disabled={isSaving}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Sparkles className={`h-5 w-5 ${settings.performanceMode ? 'text-muted-foreground' : 'text-primary'}`} />
                  <div>
                    <p className="text-sm font-medium">Animations</p>
                    <p className="text-xs text-muted-foreground">
                      {settings.performanceMode ? 'Disabled' : 'Enabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Film className={`h-5 w-5 ${settings.performanceMode ? 'text-muted-foreground' : 'text-primary'}`} />
                  <div>
                    <p className="text-sm font-medium">Parallax Effects</p>
                    <p className="text-xs text-muted-foreground">
                      {settings.performanceMode ? 'Disabled' : 'Enabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Image className={`h-5 w-5 text-primary`} />
                  <div>
                    <p className="text-sm font-medium">Lazy Loading</p>
                    <p className="text-xs text-muted-foreground">Always Enabled</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Fine-tune Performance
              </CardTitle>
              <CardDescription>
                Customize individual performance settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Disable Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn off Framer Motion animations for smoother scrolling
                  </p>
                </div>
                <Switch
                  checked={settings.disableAnimations}
                  onCheckedChange={() => handleToggleSetting('disableAnimations')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Disable Parallax</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn off scroll-based parallax effects on homepage
                  </p>
                </div>
                <Switch
                  checked={settings.disableParallax}
                  onCheckedChange={() => handleToggleSetting('disableParallax')}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Aggressive Lazy Loading</Label>
                  <p className="text-sm text-muted-foreground">
                    Load images only when they're about to enter viewport
                  </p>
                </div>
                <Switch
                  checked={settings.lazyLoadAggressively}
                  onCheckedChange={() => handleToggleSetting('lazyLoadAggressively')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cache Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Cache Management
              </CardTitle>
              <CardDescription>
                Clear cached data to ensure visitors see the latest content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Clear All Caches</p>
                  <p className="text-sm text-muted-foreground">
                    Refresh all site settings and invalidate query cache
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleRefreshCache}
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Cache'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Performance Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="font-medium text-sm">Image Optimization</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload images under 500KB and use WebP format when possible
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="font-medium text-sm">Video Background</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Keep video files under 5MB and consider using images instead
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-primary" />
                    <p className="font-medium text-sm">Desktop Users</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Animations work best on modern desktop browsers
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <p className="font-medium text-sm">Mobile Users</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Consider enabling Performance Mode for mobile-heavy traffic
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminPerformance;
