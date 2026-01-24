import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReplyRequest {
  inquiryId: string;
  customerName: string;
  customerEmail: string;
  originalSubject: string;
  replyMessage: string;
}

async function getEmailTemplate(supabase: any, templateKey: string): Promise<string | null> {
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', templateKey)
    .single();
  
  return data?.value?.template || null;
}

async function sendEmail(emailData: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  reply_to?: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(emailData),
  });
  
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to send email");
  }
  return result;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReplyRequest = await req.json();
    console.log("Sending reply to:", data.customerEmail);
    console.log("Subject:", data.originalSubject);

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Try to get custom template
    const customTemplate = await getEmailTemplate(supabase, 'email_template_reply');

    let emailHtml: string;

    if (customTemplate) {
      // Replace placeholders in custom template
      emailHtml = customTemplate
        .replace(/{{customer_name}}/g, data.customerName)
        .replace(/{{reply_message}}/g, data.replyMessage.replace(/\n/g, '<br>'))
        .replace(/{{original_subject}}/g, data.originalSubject)
        .replace(/{{year}}/g, new Date().getFullYear().toString());
    } else {
      // Default template
      emailHtml = `
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
              <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">Response to Your Inquiry</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${data.customerName},</h2>
              
              <p style="color: #555; line-height: 1.6; margin: 0 0 15px 0;">
                Thank you for reaching out to us. Below is our response to your inquiry regarding "<strong>${data.originalSubject}</strong>":
              </p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37;">
                <div style="color: #333; line-height: 1.8; white-space: pre-wrap;">${data.replyMessage}</div>
              </div>
              
              <p style="color: #555; line-height: 1.6; margin: 20px 0 0 0;">
                If you have any further questions, feel free to reply to this email or contact us again.
              </p>
              
              <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 25px;">
                <p style="color: #888; font-size: 13px; margin: 0;">
                  Best regards,<br>
                  <strong style="color: #333;">The Gen-zee Support Team</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0 0 10px 0;">Need more help? Reply to this email or visit our website</p>
              <p style="margin: 0;">© ${new Date().getFullYear()} Gen-zee Store. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await sendEmail({
      from: "Zen Zee Support <support@gen-zee.store>",
      to: [data.customerEmail],
      reply_to: "support@gen-zee.store",
      subject: `Re: ${data.originalSubject}`,
      html: emailHtml,
    });

    console.log("Reply sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, response: emailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in inquiry-reply function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
