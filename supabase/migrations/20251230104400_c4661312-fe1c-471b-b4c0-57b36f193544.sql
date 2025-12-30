-- Create email_campaigns table for marketing campaigns
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL DEFAULT 'promotional',
  status TEXT NOT NULL DEFAULT 'draft',
  recipients INTEGER NOT NULL DEFAULT 0,
  open_rate NUMERIC DEFAULT 0,
  click_rate NUMERIC DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraint for status values
ALTER TABLE public.email_campaigns ADD CONSTRAINT valid_campaign_status 
  CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled'));

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_campaigns
CREATE POLICY "Admins can view all campaigns" 
  ON public.email_campaigns 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create campaigns" 
  ON public.email_campaigns 
  FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update campaigns" 
  ON public.email_campaigns 
  FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete campaigns" 
  ON public.email_campaigns 
  FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at column
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();