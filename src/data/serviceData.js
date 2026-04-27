import {
  HiShieldCheck,
  HiLightningBolt,
  HiEye,
  HiCog,
  HiChartBar,
  HiServer,
  HiDocumentSearch,
  HiDatabase,
  HiTerminal,
  HiRefresh,
  HiCloud,
  HiGlobe,
  HiSearchCircle,
  HiChatAlt2,
  HiCode,
  HiTrendingUp,
} from 'react-icons/hi';

/* ═══════════════════════════════════════════
   CYBERSECURITY SERVICES
   ═══════════════════════════════════════════ */

export const cyberServices = [
  {
    slug: 'soc-setup',
    title: 'SOC Setup & Managed SOC',
    icon: HiServer,
    shortDesc:
      'Build and operate a fully managed Security Operations Center tailored to your infrastructure and threat landscape.',
    intro:
      'A Security Operations Center (SOC) is the nerve center of your organization\'s cyber defense. We design, deploy, and manage SOC infrastructure that provides 24/7 visibility into threats targeting your business.',
    whatItIs:
      'Our SOC Setup & Managed SOC service covers the full lifecycle — from architecture design and tool selection to staffing, runbook development, and ongoing operations. Whether you need a greenfield SOC or want to outsource monitoring to our team, we deliver a purpose-built solution aligned with your risk profile.',
    howItWorks: [
      'Assess your current security posture and monitoring gaps',
      'Design SOC architecture with appropriate SIEM, SOAR, and EDR tooling',
      'Deploy and configure all monitoring infrastructure',
      'Develop detection rules, playbooks, and escalation procedures',
      'Provide 24/7 managed monitoring with regular reporting',
    ],
    useCases: [
      'Startups scaling security without hiring a full team',
      'Enterprises consolidating security operations',
      'Regulated industries requiring continuous monitoring',
      'Organizations preparing for compliance certifications',
    ],
    techStack: ['Splunk', 'QRadar', 'Microsoft Sentinel', 'Elastic SIEM', 'CrowdStrike', 'Cortex XSOAR'],
    whyZeroTrace:
      'We combine deep operational experience with modern tooling to deliver SOCs that actually catch threats — not just generate alerts. Our team has deployed SOC infrastructure across startups, mid-market, and enterprise environments.',
    ctaText: 'Get SOC Setup Consultation',
  },
  {
    slug: 'vapt',
    title: 'Vulnerability Assessment & Penetration Testing',
    icon: HiShieldCheck,
    shortDesc:
      'Identify and exploit vulnerabilities before attackers do through comprehensive, methodology-driven security testing.',
    intro:
      'Vulnerability Assessment and Penetration Testing (VAPT) is the most direct way to validate your security posture. We simulate real-world attacks against your applications, networks, and infrastructure to find and fix weaknesses before they are exploited.',
    whatItIs:
      'VAPT combines automated vulnerability scanning with manual penetration testing performed by experienced security researchers. We test web applications, APIs, mobile apps, cloud infrastructure, and internal networks using industry-standard methodologies like OWASP, PTES, and NIST.',
    howItWorks: [
      'Define scope, objectives, and rules of engagement',
      'Perform automated scanning and manual reconnaissance',
      'Execute targeted exploitation of identified vulnerabilities',
      'Document findings with severity, impact, and remediation guidance',
      'Deliver executive and technical reports with retest validation',
    ],
    useCases: [
      'Pre-launch security validation for web and mobile applications',
      'Annual compliance-driven penetration testing',
      'M&A due diligence security assessments',
      'Continuous security testing for agile development teams',
    ],
    techStack: ['Burp Suite', 'Nmap', 'Metasploit', 'Nuclei', 'Custom scripts', 'OWASP ZAP'],
    whyZeroTrace:
      'Our testers are CTF champions and active security researchers who go beyond automated scanners. We deliver actionable findings — not 200-page reports full of false positives.',
    ctaText: 'Request a Pentest',
  },
  {
    slug: 'threat-detection',
    title: 'Threat Detection & Incident Response',
    icon: HiEye,
    shortDesc:
      'Detect threats in real time and respond to incidents with speed and precision to minimize damage and downtime.',
    intro:
      'When a security incident strikes, response time determines the outcome. Our Threat Detection & Incident Response service ensures your organization can detect, contain, and recover from security incidents rapidly.',
    whatItIs:
      'We deploy advanced threat detection systems and maintain incident response readiness so your organization is never caught off guard. From real-time monitoring and threat hunting to forensic investigation and post-incident recovery, we cover the full incident lifecycle.',
    howItWorks: [
      'Deploy threat detection across endpoints, network, and cloud',
      'Implement behavioral analytics and anomaly detection',
      'Establish incident response procedures and communication plans',
      'Provide rapid containment and forensic investigation during incidents',
      'Conduct post-incident review and hardening',
    ],
    useCases: [
      'Organizations with limited in-house incident response capability',
      'Businesses handling sensitive customer data',
      'Companies in regulated industries (finance, healthcare)',
      'Teams needing 24/7 threat monitoring coverage',
    ],
    techStack: ['CrowdStrike Falcon', 'Carbon Black', 'Velociraptor', 'TheHive', 'MITRE ATT&CK'],
    whyZeroTrace:
      'Our IR team has handled real-world breaches across multiple industries. We bring battle-tested playbooks and deep forensic expertise to every engagement.',
    ctaText: 'Get Incident Response Ready',
  },
  {
    slug: 'security-audits',
    title: 'Security Audits & Compliance',
    icon: HiDocumentSearch,
    shortDesc:
      'Comprehensive security audits aligned with industry standards to meet regulatory requirements and reduce risk.',
    intro:
      'Security audits provide a structured evaluation of your organization\'s security controls, policies, and practices. We align our audits with frameworks like ISO 27001, SOC 2, HIPAA, and PCI-DSS to ensure you meet compliance requirements while actually improving security.',
    whatItIs:
      'Our audits go beyond checkbox compliance. We evaluate your technical controls, processes, and organizational readiness against established frameworks, providing actionable recommendations that close real security gaps.',
    howItWorks: [
      'Define audit scope and applicable compliance frameworks',
      'Review technical controls, policies, and documentation',
      'Conduct interviews and process evaluations',
      'Identify gaps and prioritize remediation recommendations',
      'Deliver audit report with compliance roadmap',
    ],
    useCases: [
      'Preparing for ISO 27001 or SOC 2 certification',
      'Meeting customer or investor security requirements',
      'Annual security posture reviews',
      'Post-incident security improvement assessments',
    ],
    techStack: ['ISO 27001', 'SOC 2', 'NIST CSF', 'PCI-DSS', 'HIPAA', 'CIS Benchmarks'],
    whyZeroTrace:
      'We deliver audits that solve real security problems — not just produce paperwork. Our team understands both the technical and business sides of compliance.',
    ctaText: 'Schedule a Security Audit',
  },
  {
    slug: 'siem-integration',
    title: 'Log Monitoring & SIEM Integration',
    icon: HiDatabase,
    shortDesc:
      'Centralize your security logs and gain real-time visibility into threats across your entire infrastructure.',
    intro:
      'Effective security monitoring starts with centralized log collection and intelligent analysis. Our SIEM integration service transforms your raw log data into actionable security intelligence.',
    whatItIs:
      'We design and deploy Security Information and Event Management (SIEM) systems that collect, normalize, and correlate logs from across your infrastructure. This gives your security team real-time visibility into threats, compliance violations, and operational anomalies.',
    howItWorks: [
      'Inventory all log sources across infrastructure, applications, and cloud',
      'Design SIEM architecture and log ingestion pipeline',
      'Configure parsing, normalization, and correlation rules',
      'Build dashboards, alerts, and automated response workflows',
      'Tune detection rules to minimize false positives',
    ],
    useCases: [
      'Organizations adopting centralized security monitoring',
      'Teams drowning in unstructured log data',
      'Compliance requirements mandating log retention and monitoring',
      'Security teams needing better threat visibility',
    ],
    techStack: ['Splunk', 'Elastic SIEM', 'Microsoft Sentinel', 'Graylog', 'Wazuh', 'Sumo Logic'],
    whyZeroTrace:
      'We don\'t just deploy a SIEM — we make it work. Our tuning and optimization ensures you get real detections, not alert fatigue.',
    ctaText: 'Start SIEM Integration',
  },
  {
    slug: 'red-teaming',
    title: 'Red Teaming',
    icon: HiLightningBolt,
    shortDesc:
      'Simulate sophisticated real-world adversary tactics to stress-test your organization\'s detection and response capabilities.',
    intro:
      'Red teaming goes beyond traditional penetration testing by simulating the tactics, techniques, and procedures (TTPs) of real-world threat actors. It tests not just your technology, but your people and processes.',
    whatItIs:
      'Our red team engagements simulate advanced persistent threats (APTs) targeting your organization. We use the same techniques as nation-state actors and sophisticated cybercriminals — phishing, social engineering, physical security testing, and multi-stage exploitation — to evaluate your end-to-end security posture.',
    howItWorks: [
      'Define objectives, scope, and threat model',
      'Conduct reconnaissance and develop attack scenarios',
      'Execute multi-vector attack campaigns over defined period',
      'Test detection, response, and escalation procedures',
      'Deliver detailed findings with improvement roadmap',
    ],
    useCases: [
      'Mature security teams validating their detection capabilities',
      'Organizations preparing for advanced threats',
      'Testing incident response procedures under realistic conditions',
      'Board-level security posture validation',
    ],
    techStack: ['MITRE ATT&CK', 'Cobalt Strike', 'Custom C2 frameworks', 'Social engineering toolkits'],
    whyZeroTrace:
      'Our red team operators have deep offensive security experience and approach every engagement as real adversaries would — creative, persistent, and goal-oriented.',
    ctaText: 'Request Red Team Assessment',
  },
];

/* ═══════════════════════════════════════════
   AI SOLUTIONS
   ═══════════════════════════════════════════ */

export const aiServices = [
  {
    slug: 'ai-automation',
    title: 'Custom AI Automation Systems',
    icon: HiCog,
    shortDesc:
      'Build intelligent automation systems that eliminate repetitive tasks, reduce errors, and accelerate your operations.',
    intro:
      'Manual processes slow down your business and introduce errors. Our custom AI automation systems transform how your team works by automating complex workflows with intelligent decision-making.',
    whatItIs:
      'We design and build AI-powered automation systems tailored to your specific business processes. From document processing and data extraction to intelligent routing and decision support, we create systems that work the way your team needs them to.',
    howItWorks: [
      'Map your current workflows and identify automation opportunities',
      'Design AI pipelines with appropriate models and integrations',
      'Build, test, and validate automation systems',
      'Deploy with monitoring and feedback loops',
      'Iterate and optimize based on real-world performance',
    ],
    useCases: [
      'Automated document processing and data extraction',
      'Intelligent customer support triage and routing',
      'Automated report generation and analysis',
      'Internal knowledge management and retrieval systems',
    ],
    techStack: ['OpenAI', 'LangChain', 'Python', 'n8n', 'Custom APIs', 'Vector databases'],
    whyZeroTrace:
      'We focus on building automation that delivers measurable ROI — not science projects. Every system we build is designed for production reliability and business impact.',
    ctaText: 'Explore AI Automation',
  },
  {
    slug: 'ai-security-monitoring',
    title: 'AI-Powered Security Monitoring',
    icon: HiChartBar,
    shortDesc:
      'Enhance your security operations with AI-driven threat detection that identifies attacks traditional systems miss.',
    intro:
      'Traditional rule-based security monitoring generates excessive alerts while missing sophisticated threats. Our AI-powered monitoring uses machine learning to detect anomalies and identify real attacks with higher accuracy.',
    whatItIs:
      'We integrate AI models into your security monitoring stack to improve detection accuracy, reduce false positives, and identify threats that rule-based systems miss. This includes behavioral analytics, anomaly detection, and automated threat classification.',
    howItWorks: [
      'Analyze your current detection gaps and alert patterns',
      'Deploy ML models for behavioral analysis and anomaly detection',
      'Integrate AI-driven classification into existing SIEM/SOC workflows',
      'Train models on your specific environment and threat landscape',
      'Continuously improve detection through feedback loops',
    ],
    useCases: [
      'Reducing false positive rates in SOC operations',
      'Detecting insider threats and anomalous behavior',
      'Identifying zero-day attacks and novel threat patterns',
      'Automating initial alert triage and prioritization',
    ],
    techStack: ['TensorFlow', 'scikit-learn', 'Elastic ML', 'Custom models', 'MITRE ATT&CK'],
    whyZeroTrace:
      'We sit at the intersection of cybersecurity and AI — our team understands both domains deeply, which means our AI security solutions actually work in production.',
    ctaText: 'Upgrade Your Security Monitoring',
  },
  {
    slug: 'workflow-automation',
    title: 'Workflow Automation Using AI',
    icon: HiRefresh,
    shortDesc:
      'Streamline business processes with intelligent workflow automation that adapts, learns, and scales with your operations.',
    intro:
      'Business workflows are often complex, manual, and error-prone. Our AI-powered workflow automation connects your tools, processes, and data into intelligent, self-optimizing pipelines.',
    whatItIs:
      'We build end-to-end workflow automation powered by AI that goes beyond simple triggers and actions. Our solutions understand context, make decisions, handle exceptions, and continuously improve — transforming your operations from reactive to proactive.',
    howItWorks: [
      'Audit existing workflows to identify bottlenecks and manual steps',
      'Design intelligent automation pipelines with AI decision points',
      'Integrate with your existing tools and data sources',
      'Deploy with human-in-the-loop oversight where needed',
      'Monitor, measure, and optimize workflow performance',
    ],
    useCases: [
      'Automated onboarding and HR processes',
      'Intelligent invoice processing and approvals',
      'Sales pipeline automation with AI-driven scoring',
      'Cross-departmental process orchestration',
    ],
    techStack: ['n8n', 'Zapier', 'Make', 'LangChain', 'Custom APIs', 'Python'],
    whyZeroTrace:
      'We build workflows that actually get adopted by teams — because we design for usability, reliability, and measurable business outcomes.',
    ctaText: 'Automate Your Workflows',
  },
  {
    slug: 'fine-tuned-models',
    title: 'Fine-Tuned Models for Business Use Cases',
    icon: HiTerminal,
    shortDesc:
      'Deploy AI models fine-tuned on your data to deliver domain-specific intelligence and competitive advantage.',
    intro:
      'Off-the-shelf AI models are powerful but generic. Fine-tuning creates models that understand your industry, your terminology, and your specific use cases — delivering significantly better results.',
    whatItIs:
      'We fine-tune large language models and other AI systems on your proprietary data to create domain-specific intelligence. This includes custom classification models, specialized chatbots, industry-specific content generators, and private AI assistants that understand your business context.',
    howItWorks: [
      'Evaluate your use case and data readiness',
      'Prepare and curate training datasets',
      'Select and fine-tune appropriate base models',
      'Validate model performance against business metrics',
      'Deploy with monitoring, versioning, and update pipelines',
    ],
    useCases: [
      'Industry-specific AI assistants for customer support',
      'Custom content generation for marketing teams',
      'Domain-specific document classification and extraction',
      'Private GPT systems for internal knowledge management',
    ],
    techStack: ['OpenAI Fine-tuning API', 'Hugging Face', 'LoRA/QLoRA', 'vLLM', 'PEFT'],
    whyZeroTrace:
      'We understand the full pipeline from data preparation to production deployment. Our models are built for business value, not benchmark scores.',
    ctaText: 'Build Your Custom Model',
  },
  {
    slug: 'rag-enterprise-search',
    title: 'RAG-Based Enterprise Search Systems',
    icon: HiCloud,
    shortDesc:
      'Transform your internal knowledge base into an intelligent search system that delivers accurate, contextual answers.',
    intro:
      'Your organization\'s knowledge is trapped in documents, wikis, and databases that employees can\'t effectively search. RAG (Retrieval-Augmented Generation) changes that by combining search with AI to deliver precise, contextual answers.',
    whatItIs:
      'We build enterprise search systems powered by RAG that connect to your internal data sources — documents, databases, wikis, Slack, email — and provide employees with accurate, sourced answers through a natural language interface. Think of it as a private ChatGPT trained on your company\'s knowledge.',
    howItWorks: [
      'Audit internal knowledge sources and data formats',
      'Build document ingestion and chunking pipelines',
      'Deploy vector databases and embedding models',
      'Implement retrieval + generation pipeline with source attribution',
      'Integrate with your tools (Slack, Teams, internal portals)',
    ],
    useCases: [
      'Internal knowledge base search and Q&A',
      'Customer support agents accessing policy and procedure docs',
      'Legal and compliance teams searching contracts and regulations',
      'Engineering teams searching technical documentation',
    ],
    techStack: ['Pinecone', 'Weaviate', 'ChromaDB', 'LangChain', 'OpenAI', 'Custom embeddings'],
    whyZeroTrace:
      'We build RAG systems that are accurate, fast, and trustworthy — with proper source attribution and hallucination guards. Our systems are designed for enterprise-grade reliability.',
    ctaText: 'Build Your Enterprise Search',
  },
  {
    slug: 'ai-chatbots',
    title: 'Custom AI Chatbots',
    icon: HiChatAlt2,
    shortDesc:
      'Deploy intelligent, on-brand chatbots for customer support, lead generation, and internal productivity — trained on your data.',
    intro:
      'Generic chatbots frustrate users. Ours don\'t. We build custom AI chatbots that know your products, understand your customers, and handle real conversations — all trained on your specific knowledge base.',
    whatItIs:
      'We design, train, and deploy AI chatbots for websites, apps, Slack, WhatsApp, and more. Each bot is purpose-built: scoped to your use case, integrated with your tools, and continuously improved based on real user interactions.',
    howItWorks: [
      'Define the chatbot\'s scope, tone, and target audience',
      'Ingest your knowledge base, FAQs, docs, and policies',
      'Train and fine-tune the AI on your specific content',
      'Build the chat interface and integrate with your platform',
      'Monitor conversations and iterate on quality',
    ],
    useCases: [
      'Website support bots that answer product questions 24/7',
      'Lead qualification and appointment booking bots',
      'Internal HR/IT helpdesk automation',
      'E-commerce shopping assistants',
    ],
    techStack: ['OpenAI GPT-4', 'LangChain', 'Groq', 'Supabase', 'Custom UI', 'Webhooks'],
    whyZeroTrace:
      'We build chatbots that actually resolve queries — not just deflect them. Our bots are scoped, accurate, and built for real business impact.',
    ctaText: 'Build Your AI Chatbot',
  },
];

/* ═══════════════════════════════════════════
   DIGITAL GROWTH SERVICES
   ═══════════════════════════════════════════ */

export const digitalServices = [
  {
    slug: 'website-development',
    title: 'Website Design & Development',
    icon: HiCode,
    shortDesc:
      'Fast, modern, conversion-optimized websites built from scratch — designed to look premium and perform better.',
    intro:
      'Your website is your most important digital asset. We design and develop high-performance websites that load fast, look stunning, and convert visitors into customers.',
    whatItIs:
      'We build custom websites using modern frameworks (React, Next.js, Vite) with a focus on speed, accessibility, and design excellence. Whether it\'s a landing page, a full company site, or a web app — we deliver work that stands out.',
    howItWorks: [
      'Understand your brand, goals, and target audience',
      'Design wireframes and high-fidelity mockups',
      'Develop the site with clean, maintainable code',
      'Optimize for performance, SEO, and accessibility',
      'Deploy, test, and hand over with documentation',
    ],
    useCases: [
      'Startups launching their first professional website',
      'Businesses redesigning outdated sites',
      'SaaS products needing marketing landing pages',
      'Agencies needing white-label development',
    ],
    techStack: ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'Supabase', 'Vercel'],
    whyZeroTrace:
      'We combine strong design sensibility with engineering rigor — every site we ship is fast, beautiful, and built to scale.',
    ctaText: 'Get Your Website Built',
  },
  {
    slug: 'seo-optimization',
    title: 'SEO Optimization',
    icon: HiSearchCircle,
    shortDesc:
      'Rank higher on Google with technical SEO, content strategy, and on-page optimization that drives real organic traffic.',
    intro:
      'Great products don\'t get found by accident. We audit, fix, and optimize your website\'s SEO so the right people find you — without paid ads.',
    whatItIs:
      'Our SEO service covers everything from technical audits and Core Web Vitals optimization to keyword strategy, on-page content, schema markup, and backlink analysis. We focus on sustainable, white-hat SEO that compounds over time.',
    howItWorks: [
      'Conduct a full technical and content SEO audit',
      'Identify target keywords and search intent mapping',
      'Fix technical issues (speed, schema, crawlability, sitemap)',
      'Optimize existing pages and create targeted content',
      'Track rankings, traffic, and conversions month-over-month',
    ],
    useCases: [
      'Businesses losing traffic to competitors',
      'New websites that need to build organic visibility',
      'E-commerce stores targeting product keywords',
      'SaaS companies targeting high-intent search terms',
    ],
    techStack: ['Google Search Console', 'Ahrefs', 'Screaming Frog', 'PageSpeed Insights', 'Schema.org'],
    whyZeroTrace:
      'We don\'t chase vanity metrics. Every SEO decision we make is tied to traffic quality and business outcomes.',
    ctaText: 'Boost Your SEO',
  },
  {
    slug: 'ai-search-ranking',
    title: 'AI Search & Google Ranking',
    icon: HiTrendingUp,
    shortDesc:
      'Optimize your content and digital presence for both traditional Google rankings and AI-powered search engines like ChatGPT, Gemini, and Perplexity.',
    intro:
      'Search is changing fast. Beyond traditional SEO, your brand now needs to be discoverable in AI search tools. We help you rank in both worlds.',
    whatItIs:
      'We build content and technical strategies that make your website authoritative across Google Search, Google\'s AI Overviews, Perplexity, ChatGPT, and Bing Copilot. This includes structured data, entity optimization, and AI-friendly content architecture.',
    howItWorks: [
      'Audit current visibility across traditional and AI search',
      'Build entity-based content and knowledge graph optimization',
      'Implement structured data, FAQ schema, and rich snippets',
      'Create AI-optimized long-form content targeting answer boxes',
      'Monitor brand mentions and AI citation rates',
    ],
    useCases: [
      'Brands wanting to appear in ChatGPT and Perplexity answers',
      'Businesses targeting Google\'s AI Overviews',
      'Thought leaders building topical authority',
      'Companies competing in rapidly AI-disrupted industries',
    ],
    techStack: ['Google Search Console', 'Schema.org', 'Perplexity API', 'Content AI tools', 'Custom analytics'],
    whyZeroTrace:
      'We\'re ahead of the curve on AI search — we understand how LLMs surface information and build strategies that get your brand cited.',
    ctaText: 'Dominate AI Search',
  },
];

/* ═══════════════════════════════════════════
   ALL SERVICES (combined)
   ═══════════════════════════════════════════ */
export const allServices = [...cyberServices, ...aiServices, ...digitalServices];

/**
 * Look up a service by its URL slug.
 * @param {string} slug
 * @returns {object|undefined}
 */
export function getServiceBySlug(slug) {
  return allServices.find((s) => s.slug === slug);
}
