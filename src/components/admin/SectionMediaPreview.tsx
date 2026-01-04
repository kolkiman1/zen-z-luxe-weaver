import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface SectionMediaPreviewProps {
  url: string;
  type: 'image' | 'video';
  overlayOpacity: number;
  sectionTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SectionMediaPreview = ({
  url,
  type,
  overlayOpacity,
  sectionTitle,
  open,
  onOpenChange,
}: SectionMediaPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showOverlay, setShowOverlay] = useState(true);
  const [localOpacity, setLocalOpacity] = useState(overlayOpacity);

  const handleVideoToggle = () => {
    const video = document.querySelector('#preview-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    const video = document.querySelector('#preview-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[85vh] p-0 overflow-hidden bg-background">
        <div className="relative w-full h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div>
              <h3 className="font-semibold text-lg">{sectionTitle} Preview</h3>
              <p className="text-sm text-muted-foreground">Full-screen media preview with overlay</p>
            </div>
            <div className="flex items-center gap-2">
              {type === 'video' && (
                <>
                  <Button variant="outline" size="icon" onClick={handleVideoToggle}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleMuteToggle}>
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOverlay(!showOverlay)}
              >
                {showOverlay ? 'Hide Overlay' : 'Show Overlay'}
              </Button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 relative overflow-hidden">
            {type === 'video' ? (
              <video
                id="preview-video"
                src={url}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={url}
                alt="Section preview"
                className="w-full h-full object-cover"
              />
            )}

            {/* Overlay */}
            <AnimatePresence>
              {showOverlay && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: localOpacity / 100 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Sample Content */}
            {showOverlay && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-4">
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-primary font-medium tracking-wider uppercase text-sm"
                  >
                    Sample Tagline
                  </motion.p>
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-display font-bold text-foreground"
                  >
                    Sample <span className="text-primary">Headline</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground max-w-md mx-auto"
                  >
                    Preview how your content will look with this background
                  </motion.p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium min-w-[120px]">
                Overlay: {localOpacity}%
              </span>
              <Slider
                value={[localOpacity]}
                onValueChange={([v]) => setLocalOpacity(v)}
                min={0}
                max={100}
                step={5}
                className="flex-1 max-w-md"
              />
              <span className="text-xs text-muted-foreground">
                (Adjust to see text readability)
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SectionMediaPreview;
