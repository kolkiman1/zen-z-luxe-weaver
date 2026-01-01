import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Save, RefreshCw, Eye, Code, Loader2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useActivityLog } from '@/hooks/useActivityLog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface EmailTemplate {
  key: string;
  name: string;
  description: string;
  subject: string;
  template: string;
  placeholders: string[];
}

const defaultTemplates: EmailTemplate[] = [
  {
    key: 'email_template_auto_reply',
    name: 'Contact Auto-Reply',
    description: 'Sent automatically when a customer submits a contact form',
    subject: 'We received your message - {{subject}}',
    template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #d4af37; margin: 0; font-size: 28px;">GEN-ZEE</h1>
      <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Thank you for contacting us</p>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333; margin: 0 0 20px 0;">Hello {{customer_name}}!</h2>
      
      <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
        Thank you for reaching out to us. We have received your message and our support team will review it shortly.
      </p>
      
      <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
        You can expect a response within <strong>24-48 business hours</strong>.
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin: 0 0 10px 0; font-size: 14px;">Your Message Summary:</h3>
        <p style="color: #666; margin: 0; font-size: 14px;"><strong>Subject:</strong> {{subject}}</p>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
        <p style="color: #888; font-size: 13px; margin: 0;">
          Best regards,<br>
          <strong style="color: #333;">The Gen-zee Support Team</strong>
        </p>
      </div>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p style="margin: 0;">© {{year}} Gen-zee Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['{{customer_name}}', '{{subject}}', '{{year}}'],
  },
  {
    key: 'email_template_reply',
    name: 'Admin Reply to Inquiry',
    description: 'Used when admin replies to a customer inquiry',
    subject: 'Re: {{original_subject}}',
    template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #d4af37; margin: 0; font-size: 28px;">GEN-ZEE</h1>
      <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Response to Your Inquiry</p>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333; margin: 0 0 20px 0;">Hello {{customer_name}},</h2>
      
      <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
        Thank you for reaching out to us. Below is our response to your inquiry regarding "<strong>{{original_subject}}</strong>":
      </p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
        <div style="color: #333; line-height: 1.8;">{{reply_message}}</div>
      </div>
      
      <p style="color: #555; line-height: 1.6; margin: 20px 0 0 0;">
        If you have any further questions, feel free to reply to this email.
      </p>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 25px;">
        <p style="color: #888; font-size: 13px; margin: 0;">
          Best regards,<br>
          <strong style="color: #333;">The Gen-zee Support Team</strong>
        </p>
      </div>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p style="margin: 0;">© {{year}} Gen-zee Store. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['{{customer_name}}', '{{original_subject}}', '{{reply_message}}', '{{year}}'],
  },
  {
    key: 'email_template_support_notification',
    name: 'Support Team Notification',
    description: 'Sent to support team when a new inquiry is received',
    subject: '[Customer Inquiry] {{subject}}',
    template: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
      <h1 style="color: #d4af37; margin: 0; font-size: 24px;">New Customer Inquiry</h1>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">Customer Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 100px;">Name:</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500;">{{customer_name}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Email:</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500;">{{customer_email}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Phone:</td>
            <td style="padding: 8px 0; color: #333; font-weight: 500;">{{customer_phone}}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Subject</h3>
        <p style="color: #333; margin: 0; padding: 15px; background: #f0f0f0; border-radius: 6px; font-weight: 500;">{{subject}}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Message</h3>
        <div style="color: #555; margin: 0; padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #d4af37; line-height: 1.6;">{{message}}</div>
      </div>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
      <p style="margin: 0;">This is an automated notification from Gen-zee Store</p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['{{customer_name}}', '{{customer_email}}', '{{customer_phone}}', '{{subject}}', '{{message}}'],
  },
];

const AdminEmailTemplates = () => {
  const { logActivity } = useActivityLog();
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(defaultTemplates[0].key);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate>(defaultTemplates[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const template = templates.find(t => t.key === selectedTemplate);
    if (template) {
      setCurrentTemplate({ ...template });
    }
  }, [selectedTemplate, templates]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .like('key', 'email_template_%');

      if (!error && data) {
        const loadedTemplates = defaultTemplates.map(defaultT => {
          const saved = data.find(d => d.key === defaultT.key);
          if (saved && saved.value) {
            const value = saved.value as { subject?: string; template?: string };
            return {
              ...defaultT,
              subject: value.subject || defaultT.subject,
              template: value.template || defaultT.template,
            };
          }
          return defaultT;
        });
        setTemplates(loadedTemplates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: currentTemplate.key,
          value: {
            subject: currentTemplate.subject,
            template: currentTemplate.template,
          },
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });

      if (error) throw error;

      await logActivity('email_template_updated', 'site_settings', currentTemplate.key, {
        template_name: currentTemplate.name,
      });

      toast.success('Template saved successfully');
      loadTemplates();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    const defaultTemplate = defaultTemplates.find(t => t.key === selectedTemplate);
    if (defaultTemplate) {
      setCurrentTemplate({ ...defaultTemplate });
      toast.info('Template reset to default (not saved yet)');
    }
  };

  const getPreviewHtml = () => {
    let preview = currentTemplate.template;
    // Replace placeholders with sample data
    preview = preview.replace(/{{customer_name}}/g, 'John Doe');
    preview = preview.replace(/{{customer_email}}/g, 'john@example.com');
    preview = preview.replace(/{{customer_phone}}/g, '+880 1234-567890');
    preview = preview.replace(/{{subject}}/g, 'Question about my order');
    preview = preview.replace(/{{original_subject}}/g, 'Question about my order');
    preview = preview.replace(/{{message}}/g, 'Hello, I have a question about my recent order. Can you please help me with the delivery status?');
    preview = preview.replace(/{{reply_message}}/g, 'Thank you for contacting us! Your order is currently being processed and should be delivered within 3-5 business days.');
    preview = preview.replace(/{{year}}/g, new Date().getFullYear().toString());
    return preview;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Email Templates">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>Email Templates | Admin - Gen-zee.store</title>
      </Helmet>

      <AdminLayout title="Email Templates">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Template List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mail size={20} />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((template) => (
                  <motion.button
                    key={template.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTemplate(template.key)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTemplate === template.key
                        ? 'bg-primary/20 border border-primary/50'
                        : 'bg-secondary/50 hover:bg-secondary'
                    }`}
                  >
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{currentTemplate.name}</CardTitle>
                  <CardDescription>{currentTemplate.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw size={16} className="mr-2" />
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving} className="btn-primary">
                    {isSaving ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
                    Save
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Subject Line */}
                <div>
                  <Label>Email Subject</Label>
                  <Input
                    value={currentTemplate.subject}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Placeholders Info */}
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentTemplate.placeholders.map((placeholder) => (
                      <code key={placeholder} className="px-2 py-1 bg-background rounded text-xs">
                        {placeholder}
                      </code>
                    ))}
                  </div>
                </div>

                {/* Template Editor with Tabs */}
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'code' | 'preview')}>
                  <TabsList>
                    <TabsTrigger value="code" className="gap-2">
                      <Code size={14} />
                      HTML Code
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="gap-2">
                      <Eye size={14} />
                      Preview
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="mt-4">
                    <Textarea
                      value={currentTemplate.template}
                      onChange={(e) => setCurrentTemplate({ ...currentTemplate, template: e.target.value })}
                      className="font-mono text-sm min-h-[500px]"
                      placeholder="Enter HTML template..."
                    />
                  </TabsContent>

                  <TabsContent value="preview" className="mt-4">
                    <div className="border border-border rounded-lg overflow-hidden bg-white">
                      <iframe
                        srcDoc={getPreviewHtml()}
                        className="w-full h-[500px]"
                        title="Email Preview"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminEmailTemplates;
