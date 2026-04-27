import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HiShieldCheck,
  HiLightningBolt,
  HiEye,
  HiCloud,
  HiServer,
  HiCog,
  HiChartBar,
  HiDatabase,
  HiTerminal,
  HiRefresh,
  HiDocumentSearch,
  HiUserGroup,
  HiArrowRight,
  HiTrendingUp,
  HiGlobe,
  HiSearchCircle,
  HiChatAlt2,
  HiCode,
} from 'react-icons/hi';
import GridBackground from '@/components/GridBackground';
import GlassCard from '@/components/GlassCard';
import SectionHeading from '@/components/SectionHeading';

/* ─── Animation presets ─── */
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

/* ─── Hero rotating words ─── */
const rotatingWords = [
  'website development',
  'SEO & Google ranking',
  'AI chatbots',
  'SOC & VAPT',
  'workflow automation',
  'AI search ranking',
];

/* ─── Cybersecurity Services ─── */
const cyberServices = [
  {
    icon: HiServer,
    title: 'SOC Setup & Managed SOC',
    slug: 'soc-setup',
    description:
      'Build and operate a fully managed Security Operations Center with 24/7 threat monitoring tailored to your infrastructure.',
  },
  {
    icon: HiShieldCheck,
    title: 'VAPT',
    slug: 'vapt',
    description:
      'Identify and exploit vulnerabilities before attackers do through comprehensive, methodology-driven security testing.',
  },
  {
    icon: HiEye,
    title: 'Threat Detection & IR',
    slug: 'threat-detection',
    description:
      'Detect threats in real time and respond with speed and precision to minimize damage and downtime.',
  },
  {
    icon: HiDocumentSearch,
    title: 'Security Audits & Compliance',
    slug: 'security-audits',
    description:
      'Comprehensive audits aligned with ISO 27001, SOC 2, and NIST to meet regulatory requirements.',
  },
  {
    icon: HiDatabase,
    title: 'SIEM Integration',
    slug: 'siem-integration',
    description:
      'Centralize your security logs and gain real-time visibility into threats across your entire infrastructure.',
  },
  {
    icon: HiLightningBolt,
    title: 'Red Teaming',
    slug: 'red-teaming',
    description:
      'Simulate sophisticated real-world adversary tactics to stress-test your detection and response capabilities.',
  },
];

/* ─── AI Solutions ─── */
const aiSolutions = [
  {
    icon: HiCog,
    title: 'Custom AI Automation',
    slug: 'ai-automation',
    description:
      'Build intelligent automation that eliminates repetitive tasks, reduces errors, and accelerates your operations.',
  },
  {
    icon: HiChatAlt2,
    title: 'Custom AI Chatbots',
    slug: 'ai-chatbots',
    description:
      'Deploy on-brand AI chatbots for customer support, lead generation, and internal helpdesks — trained on your data.',
  },
  {
    icon: HiRefresh,
    title: 'Workflow Automation',
    slug: 'workflow-automation',
    description:
      'Connect your tools and data into intelligent pipelines that adapt, decide, and scale with your business.',
  },
  {
    icon: HiTerminal,
    title: 'Fine-Tuned AI Models',
    slug: 'fine-tuned-models',
    description:
      'Deploy AI models fine-tuned on your proprietary data for domain-specific intelligence and competitive advantage.',
  },
  {
    icon: HiCloud,
    title: 'RAG Enterprise Search',
    slug: 'rag-enterprise-search',
    description:
      'Turn your internal documents into an intelligent Q&A system — like a private ChatGPT for your company.',
  },
  {
    icon: HiChartBar,
    title: 'AI Security Monitoring',
    slug: 'ai-security-monitoring',
    description:
      'Enhance your SOC with ML-driven anomaly detection that catches threats traditional rules miss.',
  },
];

/* ─── Digital Growth Services ─── */
const digitalGrowth = [
  {
    icon: HiCode,
    title: 'Website Development',
    slug: 'website-development',
    description:
      'Fast, modern, conversion-optimized websites built with React and Next.js — designed to look premium and perform.',
  },
  {
    icon: HiSearchCircle,
    title: 'SEO Optimization',
    slug: 'seo-optimization',
    description:
      'Rank higher on Google with technical SEO, Core Web Vitals fixes, content strategy, and on-page optimization.',
  },
  {
    icon: HiTrendingUp,
    title: 'AI Search & Google Ranking',
    slug: 'ai-search-ranking',
    description:
      'Get cited in ChatGPT, Perplexity, and Google AI Overviews — optimize for the next generation of search.',
  },
];

/* ─── Process Steps ─── */
const processSteps = [
  { step: '01', title: 'Discover', description: 'We learn your business, goals, and current gaps — no assumptions.' },
  { step: '02', title: 'Design', description: 'Our team architects a tailored solution with the right tools and strategies.' },
  { step: '03', title: 'Build', description: 'We implement with minimal disruption, shipping clean and production-ready work.' },
  { step: '04', title: 'Launch', description: 'Go live with confidence — we handle deployment, testing, and handover.' },
  { step: '05', title: 'Grow', description: 'We monitor, optimize, and iterate so your results compound over time.' },
];

/* ─── Outcomes ─── */
const outcomes = [
  {
    icon: HiTrendingUp,
    metric: '3x',
    title: 'More Organic Traffic',
    description: 'Our SEO and AI search strategies drive compounding organic growth without relying on paid ads.',
  },
  {
    icon: HiRefresh,
    metric: '10x',
    title: 'Workflow Efficiency',
    description: 'Automate repetitive tasks across your business to free your team for high-impact, strategic work.',
  },
  {
    icon: HiEye,
    metric: '60%',
    title: 'Faster Incident Response',
    description: 'Reduce mean time to detect and respond to security threats with automated monitoring and real-time alerts.',
  },
];

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* ══════════════ HERO ══════════════ */}
      <GridBackground className="min-h-screen pt-20 relative">
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Security · AI · Digital Growth
              </motion.div>

              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6"
              >
                Build Smarter. Rank Higher.<br />
                <span className="gradient-text">Stay Secure.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-text-secondary text-lg md:text-xl max-w-3xl mx-auto mb-4 leading-relaxed"
              >
                From websites and SEO to AI chatbots, cybersecurity, and automation — we help businesses grow, operate, and stay protected.
              </motion.p>

              {/* Rotating text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="h-10 flex items-center justify-center mb-10"
              >
                <span className="text-text-muted text-base mr-2">Specializing in</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35 }}
                    className="gradient-text-blue font-heading font-semibold text-base md:text-lg"
                  >
                    {rotatingWords[wordIndex]}
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to="/contact" className="btn-gradient text-lg px-8 py-4 sm:px-10 sm:py-4">
                  Book a Free Consultation
                </Link>
                <Link to="/services/website-development" className="btn-gradient-outline text-base px-6 py-3.5">
                  Explore Services
                </Link>
              </motion.div>

              {/* Floating decorative elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/3 left-10 w-20 h-20 rounded-full bg-primary/5 blur-xl hidden lg:block"
              />
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-1/2 right-16 w-32 h-32 rounded-full bg-secondary/5 blur-xl hidden lg:block"
              />
            </div>
          </div>
        </div>
      </GridBackground>

      {/* ══════════════ WHO WE SERVE ══════════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center mb-16">
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
              One Partner for <span className="gradient-text">Everything That Matters</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-3xl mx-auto leading-relaxed">
              Whether you need a high-converting website, to dominate Google, deploy an AI assistant, or secure your infrastructure — we've got you covered under one roof.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: HiGlobe,
                title: 'Grow Online',
                description: 'Launch or redesign your website, rank higher on Google, and get discovered in AI search tools like ChatGPT and Perplexity.',
              },
              {
                icon: HiCog,
                title: 'Automate & Scale',
                description: 'Deploy AI chatbots, automate workflows, and build custom AI systems that save time and multiply your team\'s output.',
              },
              {
                icon: HiShieldCheck,
                title: 'Stay Secure',
                description: 'Protect your business with penetration testing, managed SOC, incident response, and compliance-ready security audits.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-5">
                    <item.icon className="text-primary" size={26} />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3 text-text-primary">
                    {item.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {item.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ DIGITAL GROWTH SERVICES ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading
            title="Digital Growth"
            subtitle="Websites, SEO, and AI search strategies that get your business found and remembered."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {digitalGrowth.map((service, i) => (
              <motion.div
                key={service.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/services/${service.slug}`} className="block h-full">
                  <GlassCard className="h-full group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-primary/20 flex items-center justify-center mb-4 group-hover:from-accent-blue/30 group-hover:to-primary/30 transition-all duration-300">
                      <service.icon className="text-accent-blue" size={24} />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary">
                      {service.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-3">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-accent-blue text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more <HiArrowRight size={14} />
                    </span>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ AI SOLUTIONS ══════════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="AI Solutions"
            subtitle="From custom chatbots and automation to fine-tuned models and enterprise search — AI that actually works for your business."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiSolutions.map((service, i) => (
              <motion.div
                key={service.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/services/${service.slug}`} className="block h-full">
                  <GlassCard className="h-full group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 flex items-center justify-center mb-4 group-hover:shadow-[0_0_24px_rgba(56,189,248,0.12)] transition-all duration-300">
                      <service.icon className="text-accent-blue" size={24} />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary">
                      {service.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-3">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-accent-blue text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more <HiArrowRight size={14} />
                    </span>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CYBERSECURITY SERVICES ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading
            title="Cybersecurity"
            subtitle="Enterprise-grade security services to protect your business from modern threats — end to end."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cyberServices.map((service, i) => (
              <motion.div
                key={service.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/services/${service.slug}`} className="block h-full">
                  <GlassCard className="h-full group">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                      <service.icon className="text-primary" size={24} />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary">
                      {service.title}
                    </h3>
                    <p className="text-text-muted text-sm leading-relaxed mb-3">
                      {service.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more <HiArrowRight size={14} />
                    </span>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PROCESS ══════════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How We Work"
            subtitle="A clear, no-nonsense process that delivers results at every stage."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {processSteps.map((step, i) => (
              <motion.div
                key={step.step}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className="glass-card p-6 h-full text-center group transition-all duration-300 hover:border-primary/20 hover:bg-bg-card-hover relative">
                  {i < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                  )}
                  <div className="font-heading font-black text-3xl gradient-text mb-3">
                    {step.step}
                  </div>
                  <h3 className="font-heading font-semibold text-base mb-2 text-text-primary">
                    {step.title}
                  </h3>
                  <p className="text-text-muted text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ OUTCOMES ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading
            title="Real Business Outcomes"
            subtitle="Measurable results that impact your bottom line — not just vanity metrics."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {outcomes.map((outcome, i) => (
              <motion.div
                key={outcome.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full text-center" hover={false}>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 flex items-center justify-center mb-4">
                    <outcome.icon className="text-primary" size={26} />
                  </div>
                  <div className="font-heading font-black text-4xl gradient-text mb-2">
                    {outcome.metric}
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary">
                    {outcome.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {outcome.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ COMMUNITY ══════════════ */}
      <section className="py-16 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="glass-card p-8 md:p-10 text-center border border-border"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-medium mb-4">
              <HiUserGroup size={14} />
              Community
            </div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4">
              ZeroTrace Community — <span className="gradient-text">CTFs, Research & Talent</span>
            </h2>
            <p className="text-text-secondary text-base max-w-2xl mx-auto mb-6 leading-relaxed">
              Our community drives security research, knowledge sharing, and hands-on CTF challenges. Join practitioners, researchers, and builders shaping the future of cybersecurity and AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/community" className="btn-gradient-outline text-sm !py-2.5 !px-6">
                Explore Community
              </Link>
              <Link to="/blog" className="text-text-muted hover:text-text-primary text-sm font-medium transition-colors">
                View Blog →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="text-center">
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
              Ready to <span className="gradient-text">Build, Grow & Protect</span>?
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Whether it's a new website, better rankings, an AI chatbot, or enterprise security — we're ready to help. Let's talk about what you need.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-gradient text-base">
                Book a Free Consultation
              </Link>
              <Link to="/contact" className="btn-gradient-outline text-base">
                Get a Custom Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
