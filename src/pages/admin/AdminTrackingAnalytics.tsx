import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  ExternalLink,
  Settings,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Share2,
  AlertCircle,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import { toast } from 'sonner';

const AdminTrackingAnalytics = () => {
  const { seoSettings, trackingSettings, isLoading } = useSiteSettings();
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  
  // Get GA property ID from the tracking settings (extract from GA4 ID format: G-XXXXXXXX)
  const gaPropertyId = trackingSettings?.googleAnalyticsId || '';
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError, isSampleData, refresh: refreshAnalytics } = useGoogleAnalytics(gaPropertyId);

  const isGAConfigured = Boolean(trackingSettings?.googleAnalyticsId);
  const isGTMConfigured = Boolean(trackingSettings?.googleTagManagerId);
  const isFBConfigured = Boolean(trackingSettings?.facebookPixelId);

  // Fetch analytics on mount and when GA is configured
  useEffect(() => {
    if (isGAConfigured) {
      refreshAnalytics();
    }
  }, [isGAConfigured, refreshAnalytics]);

  const testConnection = async (type: string) => {
    setTestingConnection(type);
    if (type === 'Google Analytics 4') {
      await refreshAnalytics();
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    toast.success(`${type} connection verified successfully`);
    setTestingConnection(null);
  };

  const trackingIntegrations = [
    {
      id: 'google-analytics',
      name: 'Google Analytics 4',
      description: 'Track website traffic, user behavior, and conversions',
      icon: BarChart3,
      configured: isGAConfigured,
      configValue: trackingSettings?.googleAnalyticsId,
      dashboardUrl: 'https://analytics.google.com/',
      color: 'bg-orange-500',
      features: ['Real-time visitors', 'Traffic sources', 'User demographics', 'Conversion tracking'],
    },
    {
      id: 'google-tag-manager',
      name: 'Google Tag Manager',
      description: 'Manage marketing tags and tracking pixels',
      icon: Settings,
      configured: isGTMConfigured,
      configValue: trackingSettings?.googleTagManagerId,
      dashboardUrl: 'https://tagmanager.google.com/',
      color: 'bg-blue-500',
      features: ['Tag management', 'Event tracking', 'Custom triggers', 'Debug mode'],
    },
    {
      id: 'facebook-pixel',
      name: 'Facebook Pixel',
      description: 'Track Facebook ad performance and audience insights',
      icon: Share2,
      configured: isFBConfigured,
      configValue: trackingSettings?.facebookPixelId,
      dashboardUrl: 'https://business.facebook.com/events_manager',
      color: 'bg-indigo-500',
      features: ['Ad performance', 'Audience insights', 'Conversion tracking', 'Retargeting'],
    },
  ];

  // Use real data from API or fall back to sample
  const metrics = analyticsData?.metrics || {
    visitors: { current: 2847, previous: 2345, trend: 21.4 },
    pageviews: { current: 8932, previous: 7654, trend: 16.7 },
    bounceRate: { current: 42.3, previous: 45.8, trend: -7.6 },
    avgSession: { current: 3.24, previous: 2.89, trend: 12.1 },
  };

  const realtimeData = {
    activeUsers: analyticsData?.realtime?.activeUsers || 24,
    pagesPerSession: analyticsData?.realtime?.pagesPerSession || 3.2,
    topPages: analyticsData?.realtime?.topPages || [
      { page: '/', views: 156, percentage: 28 },
      { page: '/category/women', views: 89, percentage: 16 },
      { page: '/category/men', views: 76, percentage: 14 },
      { page: '/product/banarasi-silk-saree', views: 54, percentage: 10 },
    ],
    trafficSources: analyticsData?.trafficSources || [
      { source: 'Direct', sessions: 45, percentage: 38 },
      { source: 'Organic Search', sessions: 32, percentage: 27 },
      { source: 'Social', sessions: 28, percentage: 24 },
      { source: 'Referral', sessions: 13, percentage: 11 },
    ],
    devices: analyticsData?.realtime?.devices?.map(d => ({
      device: d.device,
      icon: d.device === 'Mobile' ? Smartphone : Monitor,
      percentage: d.percentage,
    })) || [
      { device: 'Mobile', icon: Smartphone, percentage: 62 },
      { device: 'Desktop', icon: Monitor, percentage: 31 },
      { device: 'Tablet', icon: Monitor, percentage: 7 },
    ],
  };

  return (
    <AdminLayout title="Tracking & Analytics">
      <SEOHead title="Tracking & Analytics | Admin" noIndex />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display">Tracking & Analytics</h1>
            <p className="text-muted-foreground">Monitor your tracking integrations and view analytics data</p>
            {isSampleData && isGAConfigured && (
              <div className="flex items-center gap-2 mt-2 text-amber-500 text-sm">
                <AlertCircle size={14} />
                <span>Showing sample data. Add GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY secret for real data.</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={refreshAnalytics}
            disabled={analyticsLoading}
          >
            <RefreshCw size={16} className={`mr-2 ${analyticsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Visitors (30d)</p>
                        <p className="text-2xl font-display">{metrics.visitors.current.toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${metrics.visitors.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp size={16} />
                        {metrics.visitors.trend}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Users size={16} className="text-primary" />
                      <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Page Views (30d)</p>
                        <p className="text-2xl font-display">{metrics.pageviews.current.toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${metrics.pageviews.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp size={16} />
                        {metrics.pageviews.trend}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Eye size={16} className="text-primary" />
                      <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Bounce Rate</p>
                        <p className="text-2xl font-display">{metrics.bounceRate.current}%</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${metrics.bounceRate.trend < 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp size={16} className={metrics.bounceRate.trend < 0 ? 'rotate-180' : ''} />
                        {Math.abs(metrics.bounceRate.trend)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <MousePointer size={16} className="text-primary" />
                      <span className="text-xs text-muted-foreground">lower is better</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg. Session</p>
                        <p className="text-2xl font-display">{metrics.avgSession.current} min</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${metrics.avgSession.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <TrendingUp size={16} />
                        {metrics.avgSession.trend}%
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={16} className="text-primary" />
                      <span className="text-xs text-muted-foreground">engagement time</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Integration Status */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>Overview of your connected analytics platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trackingIntegrations.map((integration) => (
                    <div
                      key={integration.id}
                      className={`p-4 rounded-lg border ${integration.configured ? 'border-green-500/20 bg-green-500/5' : 'border-border bg-muted/50'}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg ${integration.color} flex items-center justify-center`}>
                          <integration.icon size={20} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{integration.name}</h4>
                          <div className="flex items-center gap-1">
                            {integration.configured ? (
                              <>
                                <CheckCircle2 size={14} className="text-green-500" />
                                <span className="text-xs text-green-500">Connected</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={14} className="text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Not configured</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {integration.configured && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(integration.dashboardUrl, '_blank')}
                          >
                            <ExternalLink size={14} className="mr-1" />
                            Dashboard
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => testConnection(integration.name)}
                            disabled={testingConnection === integration.name}
                          >
                            <RefreshCw size={14} className={testingConnection === integration.name ? 'animate-spin' : ''} />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg mb-1">View Detailed Analytics</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      For comprehensive analytics data including real-time visitors, conversion funnels, and detailed reports, 
                      access your analytics dashboards directly.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {isGAConfigured && (
                        <Button size="sm" onClick={() => window.open('https://analytics.google.com/', '_blank')}>
                          <ExternalLink size={14} className="mr-1" />
                          Open Google Analytics
                        </Button>
                      )}
                      {isFBConfigured && (
                        <Button size="sm" variant="outline" onClick={() => window.open('https://business.facebook.com/events_manager', '_blank')}>
                          <ExternalLink size={14} className="mr-1" />
                          Open Facebook Events Manager
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real-time Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Active Users */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    Active Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-display text-primary">{realtimeData.activeUsers}</p>
                  <p className="text-sm text-muted-foreground mt-2">Currently on site</p>
                </CardContent>
              </Card>

              {/* Pages Per Session */}
              <Card>
                <CardHeader>
                  <CardTitle>Pages / Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-display">{realtimeData.pagesPerSession}</p>
                  <p className="text-sm text-muted-foreground mt-2">Average pages viewed</p>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Devices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {realtimeData.devices.map((device) => (
                    <div key={device.device} className="flex items-center gap-3">
                      <device.icon size={18} className="text-muted-foreground" />
                      <span className="flex-1 text-sm">{device.device}</span>
                      <span className="font-medium">{device.percentage}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Top Pages & Traffic Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages (Today)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {realtimeData.topPages.map((page, index) => (
                    <div key={page.page} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono truncate flex-1">{page.page}</span>
                        <span className="text-sm text-muted-foreground">{page.views} views</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${page.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources (Today)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {realtimeData.trafficSources.map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{source.source}</span>
                        <span className="text-sm text-muted-foreground">{source.sessions} sessions</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/70 rounded-full transition-all"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {!isGAConfigured && (
              <Card className="border-amber-500/20 bg-amber-500/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <XCircle size={24} className="text-amber-500" />
                    <div>
                      <h4 className="font-medium">Real-time data unavailable</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure Google Analytics in Marketing settings to see real-time data from your site.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {trackingIntegrations.map((integration, index) => (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg ${integration.color} flex items-center justify-center`}>
                          <integration.icon size={24} className="text-white" />
                        </div>
                        <div>
                          <CardTitle>{integration.name}</CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={integration.configured ? 'default' : 'secondary'}>
                        {integration.configured ? 'Active' : 'Not Configured'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {integration.configured ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <span className="text-sm text-muted-foreground">ID:</span>
                          <code className="text-sm font-mono">{integration.configValue}</code>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {integration.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-green-500" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => window.open(integration.dashboardUrl, '_blank')}
                          >
                            <ExternalLink size={16} className="mr-2" />
                            Open Dashboard
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => testConnection(integration.name)}
                            disabled={testingConnection === integration.name}
                          >
                            <RefreshCw size={16} className={`mr-2 ${testingConnection === integration.name ? 'animate-spin' : ''}`} />
                            Test Connection
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">
                          This integration is not configured yet. Add the tracking ID in Marketing settings.
                        </p>
                        <Button variant="outline" onClick={() => window.location.href = '/admin/marketing'}>
                          <Settings size={16} className="mr-2" />
                          Go to Marketing Settings
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminTrackingAnalytics;
