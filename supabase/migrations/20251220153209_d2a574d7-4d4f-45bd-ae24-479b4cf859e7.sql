-- Add styling columns to announcements table
ALTER TABLE public.announcements 
ADD COLUMN background_color text DEFAULT '#ffffff',
ADD COLUMN button_text text DEFAULT 'Got it!';