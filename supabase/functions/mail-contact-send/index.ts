import { serve } from "https://deno.land/std/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp/mod.ts"

serve(async (req) => {
  try {
    const { name, email, phone, service, message } = await req.json()

    const client = new SmtpClient()

    await client.connectTLS({
      hostname: Deno.env.get("SMTP_HOST"),
      port: Number(Deno.env.get("SMTP_PORT")),
      username: Deno.env.get("SMTP_USER"),
      password: Deno.env.get("SMTP_PASS"),
    })

    // Email to admin
    await client.send({
      from: "ZeroTrace Support <support@zerotrace.in>",
      to: "zerotrace2004@gmail.com",
      subject: "New Contact Request",
      content: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Service: ${service}

Message:
${message}
      `,
    })

    // Confirmation email to user
    await client.send({
      from: "ZeroTrace Support <support@zerotrace.in>",
      to: email,
      subject: "We received your request",
      content: `
Hello ${name},

Thank you for contacting ZeroTrace.

Our team has received your request and will respond shortly.

Regards,
ZeroTrace Security Team
https://zerotrace.in
      `,
    })

    await client.close()

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
