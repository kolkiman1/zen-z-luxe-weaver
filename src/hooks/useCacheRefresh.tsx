import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useCacheRefresh = () => {
  const queryClient = useQueryClient();

  const refreshAllSiteSettings = useCallback(async () => {
    // Invalidate all site settings queries
    await queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    await queryClient.invalidateQueries({ queryKey: ['hero-content'] });
    await queryClient.invalidateQueries({ queryKey: ['announcement-bar'] });
    await queryClient.invalidateQueries({ queryKey: ['category-banners'] });
    await queryClient.invalidateQueries({ queryKey: ['video-showcase'] });
    await queryClient.invalidateQueries({ queryKey: ['products'] });
    await queryClient.invalidateQueries({ queryKey: ['product-collections'] });
    
    // Refetch all queries
    await queryClient.refetchQueries({ queryKey: ['site-settings'] });
    
    toast.success('Cache refreshed successfully', {
      description: 'All site settings have been updated',
    });
  }, [queryClient]);

  return { refreshAllSiteSettings };
};
