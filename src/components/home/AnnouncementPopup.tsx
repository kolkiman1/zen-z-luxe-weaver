import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Megaphone } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  background_color: string | null;
  button_text: string | null;
}

const AnnouncementPopup = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      // Check if user has dismissed announcements in this session
      const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]');

      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, message, background_color, button_text')
        .eq('is_active', true)
        .or('end_date.is.null,end_date.gt.now()')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching announcement:', error);
        return;
      }

      if (data && !dismissedIds.includes(data.id)) {
        setAnnouncement(data);
        // Small delay before showing popup for better UX
        setTimeout(() => setOpen(true), 1000);
      }
    };

    fetchAnnouncement();
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      const dismissedIds = JSON.parse(sessionStorage.getItem('dismissedAnnouncements') || '[]');
      dismissedIds.push(announcement.id);
      sessionStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedIds));
    }
    setOpen(false);
  };

  if (!announcement) return null;

  const bgColor = announcement.background_color || '#ffffff';
  const buttonText = announcement.button_text || 'Got it!';
  
  // Calculate if text should be light or dark based on background
  const isLightBg = () => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="sm:max-w-md border-0"
        style={{ 
          backgroundColor: bgColor,
          color: isLightBg() ? '#1a1a1a' : '#ffffff'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className="flex items-center gap-2"
            style={{ color: isLightBg() ? '#1a1a1a' : '#ffffff' }}
          >
            <Megaphone className="w-5 h-5" style={{ color: isLightBg() ? 'hsl(var(--primary))' : '#ffffff' }} />
            {announcement.title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription 
          className="text-base leading-relaxed whitespace-pre-wrap"
          style={{ color: isLightBg() ? '#4a4a4a' : '#e0e0e0' }}
        >
          {announcement.message}
        </DialogDescription>
        <div className="flex justify-end mt-4">
          <Button onClick={handleDismiss}>
            {buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementPopup;
