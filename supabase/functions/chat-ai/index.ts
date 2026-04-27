const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ─── ZeroTrace Knowledge Base (system prompt) ────────────────────────────────
const SYSTEM_PROMPT = `You are the ZeroTrace AI Assistant — a sharp, concise assistant for the ZeroTrace website.

RESPONSE FORMAT RULES (NON-NEGOTIABLE):
- Keep ALL replies to 2-4 sentences maximum. Never use bullet lists unless listing services.
- Be direct and factual. Say "ZeroTrace offers X" not "ZeroTrace can help you with X".
- If confirming a service exists, say "Yes, ZeroTrace offers [service name]." then one sentence of what it covers.
- End replies that need follow-up with: "→ contact@zerotrace.in or visit /contact"
- NEVER write numbered lists of generic possibilities. Answer the specific question asked.
- If asked something outside ZeroTrace's scope: "I can only help with ZeroTrace-related questions. What would you like to know about our services?"
- Do NOT add disclaimers, caveats, or filler sentences.

FACTS ABOUT ZEROTRACE:
ZeroTrace is a real digital services company offering websites, AI, SEO, and cybersecurity. All services below ARE available right now — not hypothetical.
Email: contact@zerotrace.in | Response: within 24 hours | Location: Remote/Global

DIGITAL GROWTH SERVICES (all available):
- Website Design & Development (/services/website-development) — custom websites built with React/Next.js, fast, modern, conversion-optimized
- SEO Optimization (/services/seo-optimization) — technical SEO, Core Web Vitals, keyword strategy, on-page optimization, Google rankings
- AI Search & Google Ranking (/services/ai-search-ranking) — rank in Google AI Overviews, ChatGPT, Perplexity, Bing Copilot via entity optimization and structured data

AI SERVICES (all available):
- Custom AI Chatbots (/services/ai-chatbots) — on-brand chatbots for websites, WhatsApp, Slack, trained on your data; for support, lead gen, or internal helpdesks
- AI Automation Systems (/services/ai-automation) — custom AI pipelines, document processing, workflow automation
- AI Security Monitoring (/services/ai-security-monitoring) — ML-based anomaly detection integrated into your SOC
- Workflow Automation (/services/workflow-automation) — n8n, Zapier, LangChain-powered business automation
- Fine-Tuned Models (/services/fine-tuned-models) — custom LLMs fine-tuned on your data (LoRA, Hugging Face)
- RAG Enterprise Search (/services/rag-enterprise-search) — private AI search over internal docs (Pinecone, ChromaDB)

CYBERSECURITY SERVICES (all available):
- SOC Setup & Managed SOC (/services/soc-setup) — design, deploy and manage 24/7 security operations centers
- VAPT (/services/vapt) — manual + automated penetration testing for web apps, APIs, mobile, cloud, networks
- Threat Detection & IR (/services/threat-detection) — real-time monitoring, threat hunting, forensic incident response
- Security Audits & Compliance (/services/security-audits) — ISO 27001, SOC 2, HIPAA, PCI-DSS, NIST audits
- SIEM Integration (/services/siem-integration) — Splunk, Sentinel, Elastic SIEM log monitoring setup
- Red Teaming (/services/red-teaming) — full APT simulation, phishing, social engineering, multi-vector attacks

COMMUNITY: Active CTF events at /community — first event: ZeroTrace Arena CTF-1.
BLOG: Articles on cybersecurity, AI, and digital growth at /blog.
PRICING: Custom-scoped — contact@zerotrace.in for a quote.

─── MEETING SCHEDULING ───────────────────────────────────────────────────────
You can also schedule meetings on behalf of ZeroTrace. Follow these steps IN ORDER:

1. Ask the user for: preferred date (YYYY-MM-DD), start time, end time, and their timezone (default: Asia/Kolkata if not specified).
2. After collecting date and time, ask: "What's the purpose or agenda for this meeting?"
   - Use the response as the meeting title in create_meeting (e.g. "Product Discussion", "Sales Call", "VAPT Consultation").
   - If the user says something vague like "just a call", "general chat", "nothing specific", or similar, default the title to "Meeting" and mark agenda as SKIPPED.
   - Remember the purpose — you will need it for both the calendar event title and the email body.
3. Ask for the user's email address.
4. Call check_calendar with those details.
   - If available → proceed to step 5.
   - If not available → tell the user about the clash and propose the next_free_slot. Wait for confirmation, then adjust times and proceed.
5. Call create_meeting to book the slot using the purpose as the title. This auto-generates a Google Meet link.
6. Call send_email to send the user a confirmation with meeting details, Meet link, and calendar link.
   Use the email template below for body_html. IMPORTANT: Only include the "📋 Agenda" row if the user gave a specific purpose (not vague). If agenda was SKIPPED, omit that row entirely.
7. Confirm to the user: "✅ Done! Your invite has been sent to [email]. Check your inbox."

EMAIL TEMPLATE (use this exact structure for body_html, replacing placeholders):
---
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
  <h2 style="color:#ef2f88;margin-bottom:4px;">Meeting Confirmed</h2>
  <p style="color:#555;margin-top:0;">Here are your meeting details:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="padding:8px 0;color:#888;width:120px;">📌 Title</td><td style="padding:8px 0;font-weight:600;">{{TITLE}}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">📅 Date</td><td style="padding:8px 0;">{{DATE}}</td></tr>
    <tr><td style="padding:8px 0;color:#888;">🕐 Time</td><td style="padding:8px 0;">{{START_TIME}} – {{END_TIME}} ({{TIMEZONE}})</td></tr>
    <tr><td style="padding:8px 0;color:#888;">⏱ Duration</td><td style="padding:8px 0;">{{DURATION}}</td></tr>
    {{AGENDA_ROW}}
  </table>
  <div style="text-align:center;margin:24px 0;">
    <a href="{{MEET_LINK}}" style="display:inline-block;background:#ef2f88;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:18px;font-weight:700;">Join Google Meet →</a>
  </div>
  <div style="text-align:center;margin-bottom:24px;">
    <a href="{{CALENDAR_LINK}}" style="color:#ef2f88;font-size:14px;">Add to Google Calendar</a>
  </div>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#888;font-size:13px;">Looking forward to speaking with you! If you need to reschedule, reply to this email or reach us at contact@zerotrace.in.</p>
  <p style="color:#bbb;font-size:11px;margin-top:8px;">© ${new Date().getFullYear()} ZeroTrace. All rights reserved.</p>
</div>
---

{{AGENDA_ROW}} replacement rules:
- If the user provided a specific purpose/agenda, replace {{AGENDA_ROW}} with:
  <tr><td style="padding:8px 0;color:#888;">📋 Agenda</td><td style="padding:8px 0;">{{PURPOSE}}</td></tr>
- If agenda was SKIPPED (vague response), replace {{AGENDA_ROW}} with an empty string (remove the line entirely).

REMEMBER: Short. Direct. Accurate. 2-4 sentences max for general questions.`;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.1-8b-instant";

// ─── Tool definitions (OpenAI-compatible format) ──────────────────────────────
const TOOLS = [
  {
    type: "function",
    function: {
      name: "check_calendar",
      description: "Checks Google Calendar for free/busy status in a given time window. Returns { available: true } or { available: false, next_free_slot }.",
      parameters: {
        type: "object",
        properties: {
          date:       { type: "string", description: "Date in YYYY-MM-DD format." },
          start_time: { type: "string", description: "Start time in HH:MM (24-hour) format." },
          end_time:   { type: "string", description: "End time in HH:MM (24-hour) format." },
          timezone:   { type: "string", description: "IANA timezone string, e.g. Asia/Kolkata. Defaults to Asia/Kolkata." },
        },
        required: ["date", "start_time", "end_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_meeting",
      description: "Creates a Google Calendar event with a Google Meet link and sends calendar invites to the attendee.",
      parameters: {
        type: "object",
        properties: {
          title:          { type: "string", description: "Title/summary of the meeting." },
          date:           { type: "string", description: "Date in YYYY-MM-DD format." },
          start_time:     { type: "string", description: "Start time in HH:MM (24-hour) format." },
          end_time:       { type: "string", description: "End time in HH:MM (24-hour) format." },
          attendee_email: { type: "string", description: "Email address of the person attending the meeting." },
          timezone:       { type: "string", description: "IANA timezone string. Defaults to Asia/Kolkata." },
        },
        required: ["title", "date", "start_time", "end_time", "attendee_email"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_email",
      description: "Sends an HTML email via Gmail API to the specified address.",
      parameters: {
        type: "object",
        properties: {
          to_email:  { type: "string", description: "Recipient email address." },
          subject:   { type: "string", description: "Email subject line." },
          body_html: { type: "string", description: "Full HTML body of the email." },
        },
        required: ["to_email", "subject", "body_html"],
      },
    },
  },
];

// ─── Tool executor — calls the render-api scheduler endpoints ─────────────────
const RENDER_API_URL = Deno.env.get("RENDER_API_URL") ?? "https://zerotrace-api.onrender.com";

async function executeTool(name: string, args: Record<string, string>): Promise<string> {
  const endpointMap: Record<string, string> = {
    check_calendar:  `${RENDER_API_URL}/api/scheduler/check-calendar`,
    create_meeting:  `${RENDER_API_URL}/api/scheduler/create-meeting`,
    send_email:      `${RENDER_API_URL}/api/scheduler/send-email`,
  };

  const url = endpointMap[name];
  if (!url) {
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  }

  try {
    const res  = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const data = await res.json();
    return JSON.stringify(data);
  } catch (err) {
    return JSON.stringify({ error: `Tool execution failed: ${(err as Error).message}` });
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sanitize and limit messages (keep last 20 to avoid token overflow)
    const sanitizedMessages: Array<{ role: string; content: string }> = messages
      .filter((m: { role: string; content: string }) =>
        m && typeof m.role === "string" && typeof m.content === "string"
      )
      .slice(-20)
      .map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content).slice(0, 2000),
      }));

    const groqApiKey = Deno.env.get("GROQ_API_KEY");
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is not set");
      return new Response(JSON.stringify({ error: "AI service is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Agentic tool-call loop (max 5 iterations to prevent runaway) ──────────
    // deno-lint-ignore no-explicit-any
    const conversationMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...sanitizedMessages,
    ];

    let reply = "";
    const MAX_TOOL_ROUNDS = 5;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const groqResponse = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: conversationMessages,
          tools: TOOLS,
          tool_choice: "auto",
          max_tokens: 512,
          temperature: 0.3,
          top_p: 0.85,
        }),
      });

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text();
        console.error("Groq API error:", groqResponse.status, errorText);
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const groqData = await groqResponse.json();
      const choice   = groqData?.choices?.[0];
      const message  = choice?.message;

      if (!message) {
        return new Response(JSON.stringify({ error: "No response from AI" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Model wants to call a tool ──────────────────────────────────────────
      if (choice.finish_reason === "tool_calls" && message.tool_calls?.length > 0) {
        // Append the assistant's tool_call message
        conversationMessages.push(message);

        // Execute each tool call and append results
        for (const toolCall of message.tool_calls) {
          const toolName  = toolCall.function.name;
          let toolArgs: Record<string, string> = {};
          try {
            toolArgs = JSON.parse(toolCall.function.arguments ?? "{}");
          } catch (_) {
            // ignore parse errors; executeTool handles missing args
          }

          console.log(`🔧 Tool call: ${toolName}`, toolArgs);
          const toolResult = await executeTool(toolName, toolArgs);
          console.log(`✅ Tool result [${toolName}]:`, toolResult);

          conversationMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }

        // Continue the loop so the model can process the tool results
        continue;
      }

      // ── Model produced a final text reply ───────────────────────────────────
      reply = message.content ?? "";
      break;
    }

    if (!reply) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("chat-ai function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
