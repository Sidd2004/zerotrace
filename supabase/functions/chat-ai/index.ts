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
If the user asks about scheduling a meeting, call, consultation, or wants to talk to the team:
1. Ask: "Would you like to schedule a meeting with the ZeroTrace team?"
2. If they say yes, respond with EXACTLY this text (the marker is critical for the UI to render the button):
   "Great! You can pick a time that works best for you. Click the button below to schedule a 15-minute meeting: [CALENDLY]"
3. Do NOT try to collect date, time, email, or any other details. The Calendly link handles everything.
4. Do NOT mention sending emails, calendar invites, or any backend scheduling — just direct them to the button.

REMEMBER: Short. Direct. Accurate. 2-4 sentences max for general questions.`;

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.1-8b-instant";

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

    // ── Simple completion (no tools) ──────────────────────────────────────────
    // deno-lint-ignore no-explicit-any
    const conversationMessages: any[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...sanitizedMessages,
    ];

    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: conversationMessages,
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

    const reply = message.content ?? "";

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
