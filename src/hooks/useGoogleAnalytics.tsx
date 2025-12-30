import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsRealtime {
  activeUsers: number;
  pagesPerSession?: number;
  topPages: { page: string; views: number; percentage: number }[];
  devices: { device: string; percentage: number }[];
}

interface AnalyticsMetrics {
  visitors: { current: number; previous?: number; trend: number };
  pageviews: { current: number; previous?: number; trend: number };
  bounceRate: { current: number; previous?: number; trend: number };
  avgSession: { current: number; previous?: number; trend: number };
}

interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
}

interface AnalyticsData {
  realtime: AnalyticsRealtime;
  metrics: AnalyticsMetrics;
  trafficSources: TrafficSource[];
}

interface UseGoogleAnalyticsResult {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  isSampleData: boolean;
  refresh: () => Promise<void>;
}

export const useGoogleAnalytics = (propertyId?: string): UseGoogleAnalyticsResult => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSampleData, setIsSampleData] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: responseData, error: fetchError } = await supabase.functions.invoke(
        'google-analytics',
        {
          body: {
            propertyId: propertyId || '',
            startDate: '30daysAgo',
            endDate: 'today',
          },
        }
      );

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (responseData?.error) {
        setError(responseData.message || responseData.error);
      }

      setData(responseData?.data || null);
      setIsSampleData(responseData?.sampleData ?? true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data');
      // Set sample data on error
      setData(getSampleData());
      setIsSampleData(true);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  return { data, loading, error, isSampleData, refresh };
};

function getSampleData(): AnalyticsData {
  return {
    realtime: {
      activeUsers: 24,
      pagesPerSession: 3.2,
      topPages: [
        { page: '/', views: 156, percentage: 28 },
        { page: '/category/women', views: 89, percentage: 16 },
        { page: '/category/men', views: 76, percentage: 14 },
        { page: '/product/banarasi-silk-saree', views: 54, percentage: 10 },
      ],
      devices: [
        { device: 'Mobile', percentage: 62 },
        { device: 'Desktop', percentage: 31 },
        { device: 'Tablet', percentage: 7 },
      ],
    },
    metrics: {
      visitors: { current: 2847, previous: 2345, trend: 21.4 },
      pageviews: { current: 8932, previous: 7654, trend: 16.7 },
      bounceRate: { current: 42.3, previous: 45.8, trend: -7.6 },
      avgSession: { current: 3.24, previous: 2.89, trend: 12.1 },
    },
    trafficSources: [
      { source: 'Direct', sessions: 45, percentage: 38 },
      { source: 'Organic Search', sessions: 32, percentage: 27 },
      { source: 'Social', sessions: 28, percentage: 24 },
      { source: 'Referral', sessions: 13, percentage: 11 },
    ],
  };
}
