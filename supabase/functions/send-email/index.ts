import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function sanitize(str: string): string {
  if (!str) return "";
  return str.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, phone, service, message } = await req.json();

    // ─── Validation ───
    if (!name || name.trim() === "") {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!message || message.trim() === "") {
      return new Response(JSON.stringify({ error: "Message cannot be empty" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sanitizedData = {
      name: sanitize(name),
      email: email.trim().toLowerCase(),
      phone: sanitize(phone) || null,
      service: sanitize(service) || "General Inquiry",
      message: sanitize(message),
      status: "new",
    };

    // ─── Insert into Supabase ───
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error: dbError } = await supabase
      .from("contact_messages")
      .insert([sanitizedData])
      .select("id")
      .single();

    if (dbError) {
      console.error("DB Insert Error:", dbError);
      throw new Error("Failed to save message");
    }

    console.log(`✅ Contact saved [ID: ${data.id}]`);

    // ─── Send Emails via Brevo SMTP ───
    const smtpHost = Deno.env.get("SMTP_HOST") || "smtp-relay.brevo.com";
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL") || "support@zerotrace.in";
    const fromName = Deno.env.get("SMTP_FROM_NAME") || "ZeroTrace Security";
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "zerotrace2004@gmail.com";

    if (smtpUser && smtpPass) {
      const client = new SmtpClient();

      try {
        await client.connectTLS({
          hostname: smtpHost,
          port: smtpPort,
          username: smtpUser,
          password: smtpPass,
        });

        // Admin notification
        const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
        await client.send({
          from: `${fromName} <${fromEmail}>`,
          to: adminEmail,
          subject: `New Contact Request — ${sanitizedData.name}`,
          content: "text/html",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f0f0f0;padding:24px;border-radius:12px;">
              <h2 style="color:#ef2f88;margin-top:0;">New Contact Submission</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px 0;color:#999;">Name</td><td style="padding:8px 0;">${sanitizedData.name}</td></tr>
                <tr><td style="padding:8px 0;color:#999;">Email</td><td style="padding:8px 0;">${sanitizedData.email}</td></tr>
                <tr><td style="padding:8px 0;color:#999;">Phone</td><td style="padding:8px 0;">${sanitizedData.phone || "Not provided"}</td></tr>
                <tr><td style="padding:8px 0;color:#999;">Service</td><td style="padding:8px 0;">${sanitizedData.service}</td></tr>
                <tr><td style="padding:8px 0;color:#999;">Timestamp</td><td style="padding:8px 0;">${timestamp}</td></tr>
              </table>
              <div style="margin-top:16px;padding:16px;background:#111;border-radius:8px;">
                <p style="color:#999;margin:0 0 8px;">Message:</p>
                <p style="margin:0;line-height:1.6;">${sanitizedData.message}</p>
              </div>
            </div>
          `,
        });
        console.log("✅ Admin email sent");

        // User acknowledgement
        await client.send({
          from: `${fromName} <${fromEmail}>`,
          to: sanitizedData.email,
          subject: "We received your message — ZeroTrace",
          content: "text/html",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#f0f0f0;padding:24px;border-radius:12px;">
              <h2 style="color:#ef2f88;margin-top:0;">Thank you, ${sanitizedData.name}!</h2>
              <p style="color:#ccc;line-height:1.6;">We have received your message and our team will get back to you within 24 hours.</p>
              <p style="color:#ccc;line-height:1.6;">If your inquiry is urgent, reach out at <a href="mailto:${adminEmail}" style="color:#ef2f88;">${adminEmail}</a>.</p>
              <hr style="border:none;border-top:1px solid #222;margin:24px 0;">
              <p style="color:#666;font-size:12px;margin:0;">&copy; ${new Date().getFullYear()} ZeroTrace Security. All rights reserved.</p>
            </div>
          `,
        });
        console.log("✅ User acknowledgement email sent");

        await client.close();
      } catch (mailErr) {
        console.error("⚠️ SMTP Error:", mailErr.message);
        // Don't fail the request — message was still saved to DB
      }
    } else {
      console.warn("⚠️ SMTP credentials not set — skipping email send");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Message sent successfully." }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
