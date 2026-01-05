import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useCacheRefresh = () => {
  const queryClient = useQueryClient();

  const refreshAllSiteSettings = useCallback(async () => {
    // Invalidate all storefront/admin settings queries
    await queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    await queryClient.invalidateQueries({ queryKey: ['hero-content-settings'] });
    await queryClient.invalidateQueries({ queryKey: ['products'] });

    // Refetch primary settings query
    await queryClient.refetchQueries({ queryKey: ['site-settings'] });

    toast.success('Cache refreshed successfully', {
      description: 'All site settings have been updated',
    });
  }, [queryClient]);

  return { refreshAllSiteSettings };
};
