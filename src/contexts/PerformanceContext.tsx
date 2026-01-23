import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceSettings {
  performanceMode: boolean;
  disableAnimations: boolean;
  disableParallax: boolean;
  reducedMotion: boolean;
  lazyLoadAggressively: boolean;
}

interface PerformanceContextType {
  settings: PerformanceSettings;
  isPerformanceMode: boolean;
  isLoading: boolean;
  togglePerformanceMode: () => void;
  updateSettings: (settings: Partial<PerformanceSettings>) => void;
}

const defaultSettings: PerformanceSettings = {
  performanceMode: false,
  disableAnimations: false,
  disableParallax: false,
  reducedMotion: false,
  lazyLoadAggressively: true,
};

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};

// Hook for optional performance context (won't throw if not in provider)
export const usePerformanceOptional = () => {
  const context = useContext(PerformanceContext);
  return context;
};

export const PerformanceProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<PerformanceSettings>(defaultSettings);

  // Check for system preference for reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setLocalSettings(prev => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Fetch settings from database
  const { data: dbSettings, isLoading } = useQuery({
    queryKey: ['site-settings', 'performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'performance')
        .maybeSingle();

      if (error) {
        console.error('Error fetching performance settings:', error);
        return defaultSettings;
      }

      if (data?.value) {
        return { ...defaultSettings, ...(data.value as unknown as Partial<PerformanceSettings>) };
      }

      return defaultSettings;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Update local settings when DB settings change
  useEffect(() => {
    if (dbSettings) {
      setLocalSettings(dbSettings);
    }
  }, [dbSettings]);

  // Mutation to update settings
  const updateMutation = useMutation({
    mutationFn: async (newSettings: PerformanceSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', 'performance')
        .maybeSingle();

      const jsonValue = JSON.parse(JSON.stringify(newSettings));

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: jsonValue })
          .eq('key', 'performance');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([{ key: 'performance', value: jsonValue }]);
        if (error) throw error;
      }

      return newSettings;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'performance'] });
      setLocalSettings(data);
    },
  });

  const togglePerformanceMode = useCallback(() => {
    const newSettings = {
      ...localSettings,
      performanceMode: !localSettings.performanceMode,
      disableAnimations: !localSettings.performanceMode,
      disableParallax: !localSettings.performanceMode,
    };
    setLocalSettings(newSettings);
    updateMutation.mutate(newSettings);
  }, [localSettings, updateMutation]);

  const updateSettings = useCallback((partialSettings: Partial<PerformanceSettings>) => {
    const newSettings = { ...localSettings, ...partialSettings };
    setLocalSettings(newSettings);
    updateMutation.mutate(newSettings);
  }, [localSettings, updateMutation]);

  // Computed value for performance mode (either explicit or system preference)
  const isPerformanceMode = localSettings.performanceMode || localSettings.reducedMotion;

  return (
    <PerformanceContext.Provider value={{
      settings: localSettings,
      isPerformanceMode,
      isLoading,
      togglePerformanceMode,
      updateSettings,
    }}>
      {children}
    </PerformanceContext.Provider>
  );
};

export default PerformanceProvider;
