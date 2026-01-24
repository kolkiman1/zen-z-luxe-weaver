import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSwipe } from '@/hooks/useSwipe';

interface ImageZoomViewerProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  alt: string;
}

const ImageZoomViewer = ({ images, currentIndex, onIndexChange, alt }: ImageZoomViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });

  const nextImage = useCallback(() => {
    onIndexChange((currentIndex + 1) % images.length);
    resetZoom();
  }, [currentIndex, images.length, onIndexChange]);

  const prevImage = useCallback(() => {
    onIndexChange((currentIndex - 1 + images.length) % images.length);
    resetZoom();
  }, [currentIndex, images.length, onIndexChange]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: nextImage,
    onSwipeRight: prevImage,
  });

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || zoomLevel <= 1) return;

    if (isDragging) {
      const deltaX = e.clientX - dragStart.current.x;
      const deltaY = e.clientY - dragStart.current.y;
      
      setPosition({
        x: positionStart.current.x + deltaX,
        y: positionStart.current.y + deltaY,
      });
    } else if (isHovering && !isFullscreen) {
      // Hover-based panning for inline viewer
      const rect = imageRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      const maxMove = (zoomLevel - 1) * 50;
      setPosition({
        x: (0.5 - x) * maxMove * 2,
        y: (0.5 - y) * maxMove * 2,
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1 && isFullscreen) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      positionStart.current = { ...position };
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      resetZoom();
    } else {
      setZoomLevel(2);
    }
  };

  useEffect(() => {
    resetZoom();
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          setIsFullscreen(false);
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, nextImage, prevImage]);

  const ImageContent = ({ fullscreen = false }: { fullscreen?: boolean }) => (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${fullscreen ? 'w-full h-full' : 'aspect-[3/4] sm:aspect-[4/5] rounded-lg sm:rounded-xl'} bg-secondary`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setIsHovering(false);
        if (!fullscreen && zoomLevel > 1) {
          setPosition({ x: 0, y: 0 });
        }
      }}
      onMouseEnter={() => setIsHovering(true)}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
      {...swipeHandlers}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-200"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            scale: zoomLevel,
            x: position.x,
            y: position.y,
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            opacity: { duration: 0.3 },
            scale: { duration: 0.2 },
            x: { duration: isDragging ? 0 : 0.1 },
            y: { duration: isDragging ? 0 : 0.1 },
          }}
          draggable={false}
        />
      </AnimatePresence>

      {/* Zoom Level Indicator */}
      {zoomLevel > 1 && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md text-xs font-medium">
          {Math.round(zoomLevel * 100)}%
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          >
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Zoom Controls - Inline */}
      {!fullscreen && (
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full glass"
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
            disabled={zoomLevel <= 1}
          >
            <ZoomOut size={14} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full glass"
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
            disabled={zoomLevel >= 4}
          >
            <ZoomIn size={14} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="w-8 h-8 rounded-full glass"
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(true); }}
          >
            <Maximize2 size={14} />
          </Button>
        </div>
      )}

      {/* Image Dots for Mobile */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); onIndexChange(index); }}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? 'bg-primary w-4' : 'bg-background/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <ImageContent />

      {/* Fullscreen Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-background/95 backdrop-blur-xl border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/50 hover:bg-background/80"
              onClick={() => setIsFullscreen(false)}
            >
              <X size={20} />
            </Button>

            {/* Zoom Controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 glass"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
              >
                <ZoomOut size={16} />
              </Button>
              <div className="px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-md text-sm font-medium flex items-center">
                {Math.round(zoomLevel * 100)}%
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 glass"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 4}
              >
                <ZoomIn size={16} />
              </Button>
            </div>

            {/* Image Container */}
            <div className="w-full h-full max-w-5xl max-h-[80vh] mx-auto p-4 flex items-center justify-center">
              <div
                className="relative w-full h-full overflow-hidden rounded-xl"
                onMouseMove={handleMouseMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onDoubleClick={handleDoubleClick}
                style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in' }}
                {...swipeHandlers}
              >
                <motion.img
                  src={images[currentIndex]}
                  alt={`${alt} - Image ${currentIndex + 1}`}
                  className="w-full h-full object-contain"
                  animate={{
                    scale: zoomLevel,
                    x: position.x,
                    y: position.y,
                  }}
                  transition={{
                    scale: { duration: 0.2 },
                    x: { duration: isDragging ? 0 : 0.1 },
                    y: { duration: isDragging ? 0 : 0.1 },
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-50"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-50"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-background/50 backdrop-blur-sm rounded-lg z-50">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => onIndexChange(index)}
                    className={`w-12 h-12 rounded-md overflow-hidden border-2 transition-all ${
                      currentIndex === index ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-muted-foreground text-center z-40">
              <p>Scroll or +/- to zoom • Drag to pan • Double-click to toggle zoom • Arrow keys to navigate</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageZoomViewer;
