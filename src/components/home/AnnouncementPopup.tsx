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
        .select('id, title, message')
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-primary" />
            {announcement.title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap">
          {announcement.message}
        </DialogDescription>
        <div className="flex justify-end mt-4">
          <Button onClick={handleDismiss}>
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementPopup;
