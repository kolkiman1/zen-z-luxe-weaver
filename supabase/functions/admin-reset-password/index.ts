import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminResetPasswordRequest {
  userEmail: string;
  adminEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Admin password reset request received");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail, adminEmail }: AdminResetPasswordRequest = await req.json();

    if (!userEmail || !userEmail.includes("@")) {
      console.error("Invalid user email provided");
      return new Response(
        JSON.stringify({ error: "Invalid user email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Admin ${adminEmail} resetting password for: ${userEmail}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate password reset link
    const { data, error: resetError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: userEmail,
      options: {
        redirectTo: "https://gen-zee.store/forgot-password",
      },
    });

    if (resetError) {
      console.error("Supabase reset error:", resetError);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link. User may not exist." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resetLink = data?.properties?.action_link;

    if (!resetLink) {
      console.error("No reset link generated");
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Reset link generated successfully");

    // Send email to user
    const emailResponse = await resend.emails.send({
      from: "Zen Zee Store <noreply@gen-zee.store>",
      to: [userEmail],
      subject: "Password Reset Request - Zen Zee Store",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
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
                      <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1a1a1a;">Password Reset Requested</h2>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #666666;">
                        A password reset was requested for your account by our support team. Click the button below to set a new password.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center" style="padding: 10px 0 30px;">
                            <a href="${resetLink}" 
                               style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 4px 12px rgba(245,158,11,0.4);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <div style="padding: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; margin: 25px 0;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400e;">
                          <strong>Didn't request this?</strong><br>
                          If you didn't request a password reset, please contact our support team immediately.
                        </p>
                      </div>
                      
                      <p style="margin: 0; font-size: 12px; color: #aaaaaa;">
                        This link will expire in 1 hour. If the button doesn't work, copy this link:
                      </p>
                      <p style="margin: 10px 0 0; font-size: 12px; color: #f59e0b; word-break: break-all;">
                        ${resetLink}
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; text-align: center; background-color: #f8f8f8; border-top: 1px solid #eaeaea;">
                      <p style="margin: 0; font-size: 12px; color: #888888;">
                        © ${new Date().getFullYear()} Gen-zee Store. All rights reserved.
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

    console.log("Password reset email sent:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Password reset email sent to customer" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in admin-reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
