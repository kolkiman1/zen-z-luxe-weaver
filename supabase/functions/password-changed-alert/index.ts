import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordChangedRequest {
  email: string;
  userName?: string;
  changeMethod: "reset" | "account";
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Password changed alert request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName, changeMethod }: PasswordChangedRequest = await req.json();

    if (!email || !email.includes("@")) {
      console.error("Invalid email provided");
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending password change alert to: ${email}`);

    const changeMethodText = changeMethod === "reset" 
      ? "using a password reset link" 
      : "from your account settings";

    const emailResponse = await resend.emails.send({
      from: "Gen-zee Store <noreply@gen-zee.store>",
      to: [email],
      subject: "Password Changed - Gen-zee Store",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Changed</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f8f8;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                        <span style="color: #f59e0b;">Gen</span>-zee
                      </h1>
                      <p style="margin: 8px 0 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.6);">Wear the Trend</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <div style="width: 64px; height: 64px; margin: 0 auto 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <span style="font-size: 32px;">🔐</span>
                        </div>
                        <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: 600; color: #1a1a1a;">Password Changed Successfully</h2>
                      </div>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                        Hi${userName ? ` ${userName}` : ''},
                      </p>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                        Your password was successfully changed ${changeMethodText} on <strong>${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong> at <strong>${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</strong>.
                      </p>
                      
                      <div style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; margin: 25px 0;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                          <strong>Didn't make this change?</strong><br>
                          If you didn't change your password, someone else might have access to your account. Please contact our support team immediately or reset your password again.
                        </p>
                      </div>
                      
                      <p style="margin: 0 0 25px; font-size: 14px; line-height: 1.6; color: #888888;">
                        For your security, we recommend:
                      </p>
                      
                      <ul style="margin: 0 0 25px; padding-left: 20px; font-size: 14px; line-height: 1.8; color: #666666;">
                        <li>Using a unique password that you don't use elsewhere</li>
                        <li>Signing out from devices you don't recognize</li>
                        <li>Keeping your email account secure</li>
                      </ul>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #eaeaea;">
                      <p style="margin: 0; font-size: 12px; color: #888888;">
                        © ${new Date().getFullYear()} Gen-zee Store. All rights reserved.
                      </p>
                      <p style="margin: 10px 0 0; font-size: 12px; color: #aaaaaa;">
                        This is an automated security alert for your account.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Password change alert sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Password change alert sent" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in password-changed-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
