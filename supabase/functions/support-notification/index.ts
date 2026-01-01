import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

async function sendEmail(emailData: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to?: string;
}) {
  console.log("Attempting to send email to:", emailData.to);
  console.log("Using RESEND_API_KEY:", RESEND_API_KEY ? "Present" : "Missing");
  
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(emailData),
  });
  
  const result = await response.json();
  console.log("Resend API response:", JSON.stringify(result));
  
  if (!response.ok) {
    console.error("Resend API error:", result);
    throw new Error(result.message || "Failed to send email");
  }
  return result;
}

async function getEmailTemplate(key: string): Promise<{ subject: string; template: string } | null> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data?.value) {
      console.log(`No custom template found for ${key}, using default`);
      return null;
    }

    const value = data.value as { subject?: string; template?: string };
    if (value.subject && value.template) {
      return { subject: value.subject, template: value.template };
    }
    return null;
  } catch (err) {
    console.error("Error fetching email template:", err);
    return null;
  }
}

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Support notification function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: SupportRequest = await req.json();
    console.log("Received support request from:", data.email);
    console.log("Subject:", data.subject);

    // Try to get custom template for support team notification
    const supportTemplate = await getEmailTemplate('email_template_support_notification');
    
    let supportEmailHtml: string;
    let supportSubject: string;
    
    if (supportTemplate) {
      console.log("Using custom support notification template");
      supportSubject = replacePlaceholders(supportTemplate.subject, { subject: data.subject });
      supportEmailHtml = replacePlaceholders(supportTemplate.template, {
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone || 'Not provided',
        subject: data.subject,
        message: data.message,
      });
    } else {
      console.log("Using default support notification template");
      supportSubject = `[Customer Inquiry] ${data.subject}`;
      supportEmailHtml = `
        <!DOCTYPE html>
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
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${data.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Email:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">
                      <a href="mailto:${data.email}" style="color: #d4af37; text-decoration: none;">${data.email}</a>
                    </td>
                  </tr>
                  ${data.phone ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Phone:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 500;">${data.phone}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Subject</h3>
                <p style="color: #333; margin: 0; padding: 15px; background: #f0f0f0; border-radius: 6px; font-weight: 500;">${data.subject}</p>
              </div>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">Message</h3>
                <div style="color: #555; margin: 0; padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #d4af37; line-height: 1.6; white-space: pre-wrap;">${data.message}</div>
              </div>
              
              <div style="text-align: center; margin-top: 25px;">
                <a href="mailto:${data.email}?subject=Re: ${encodeURIComponent(data.subject)}" 
                   style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #1a1a2e; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Reply to Customer
                </a>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">This is an automated notification from Gen-zee Store</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send notification to support team
    const emailResponse = await sendEmail({
      from: "Gen-zee Support <support@gen-zee.store>",
      to: ["support@gen-zee.store"],
      reply_to: data.email,
      subject: supportSubject,
      html: supportEmailHtml,
    });

    console.log("Support notification sent successfully:", emailResponse);

    // Try to get custom template for customer auto-reply
    const autoReplyTemplate = await getEmailTemplate('email_template_auto_reply');
    
    let customerEmailHtml: string;
    let customerSubject: string;
    
    if (autoReplyTemplate) {
      console.log("Using custom auto-reply template");
      customerSubject = replacePlaceholders(autoReplyTemplate.subject, { subject: data.subject });
      customerEmailHtml = replacePlaceholders(autoReplyTemplate.template, {
        customer_name: data.name,
        subject: data.subject,
        year: new Date().getFullYear().toString(),
      });
    } else {
      console.log("Using default auto-reply template");
      customerSubject = `We received your message - ${data.subject}`;
      customerEmailHtml = `
        <!DOCTYPE html>
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
              <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${data.name}!</h2>
              
              <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
                Thank you for reaching out to us. We have received your message and our support team will review it shortly.
              </p>
              
              <p style="color: #555; line-height: 1.6; margin: 0 0 20px 0;">
                You can expect a response within <strong>24-48 business hours</strong>. If your inquiry is urgent, please don't hesitate to call us directly.
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 14px;">Your Message Summary:</h3>
                <p style="color: #666; margin: 0; font-size: 14px;"><strong>Subject:</strong> ${data.subject}</p>
              </div>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #333;">The Gen-zee Support Team</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">Need immediate help? Call us at +880 1XXX-XXXXXX</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Gen-zee Store. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send auto-reply to customer
    const customerReply = await sendEmail({
      from: "Gen-zee Support <support@gen-zee.store>",
      to: [data.email],
      subject: customerSubject,
      html: customerEmailHtml,
    });

    console.log("Customer auto-reply sent:", customerReply);

    return new Response(
      JSON.stringify({ 
        success: true, 
        supportNotification: emailResponse,
        customerReply: customerReply 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in support-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message, details: error.toString() }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
