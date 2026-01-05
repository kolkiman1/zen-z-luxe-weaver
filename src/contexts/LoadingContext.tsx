import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingContextType {
  isLoading: boolean;
  loadingProgress: number;
  startLoading: () => void;
  updateProgress: (progress: number) => void;
  finishLoading: () => void;
  registerImage: () => void;
  imageLoaded: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalImages, setTotalImages] = useState(0);
  const [loadedImages, setLoadedImages] = useState(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setLoadingProgress(0);
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setLoadingProgress(progress);
  }, []);

  const finishLoading = useCallback(() => {
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setLoadingProgress(0);
    }, 500);
  }, []);

  const registerImage = useCallback(() => {
    setTotalImages(prev => prev + 1);
    if (!isLoading) {
      setIsLoading(true);
    }
  }, [isLoading]);

  const imageLoaded = useCallback(() => {
    setLoadedImages(prev => {
      const newLoaded = prev + 1;
      const progress = totalImages > 0 ? (newLoaded / totalImages) * 100 : 100;
      setLoadingProgress(progress);
      
      if (newLoaded >= totalImages && totalImages > 0) {
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(0);
          setTotalImages(0);
          setLoadedImages(0);
        }, 500);
      }
      
      return newLoaded;
    });
  }, [totalImages]);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      loadingProgress, 
      startLoading, 
      updateProgress, 
      finishLoading,
      registerImage,
      imageLoaded
    }}>
      {children}
      <GlobalLoadingIndicator isLoading={isLoading} progress={loadingProgress} />
    </LoadingContext.Provider>
  );
};

const GlobalLoadingIndicator = ({ isLoading, progress }: { isLoading: boolean; progress: number }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <>
          {/* Top progress bar */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] h-1 bg-muted origin-left"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-gold to-primary"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {/* Loading indicator badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: 0.2 }}
            className="fixed top-4 left-1/2 z-[100] px-4 py-2 rounded-full bg-card/90 backdrop-blur-lg border border-border shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-4 h-4">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              <span className="text-xs font-medium text-foreground">
                Loading... {Math.round(progress)}%
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoadingProvider;
