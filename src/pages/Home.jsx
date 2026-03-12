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
  HiLockClosed,
  HiGlobe,
  HiUserGroup,
  HiDocumentSearch,
  HiDatabase,
  HiTerminal,
  HiRefresh,
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
  'penetration testing',
  'threat detection',
  'secure infrastructure',
  'cyber defense',
];

/* ─── Cybersecurity Services ─── */
const services = [
  {
    icon: HiShieldCheck,
    title: 'Penetration Testing',
    description:
      'Identify and exploit vulnerabilities before attackers do through comprehensive security testing.',
  },
  {
    icon: HiLightningBolt,
    title: 'Red Team Operations',
    description:
      'Simulate real-world adversary tactics to stress-test your organization\'s detection and response.',
  },
  {
    icon: HiEye,
    title: 'Threat Intelligence',
    description:
      'Proactive monitoring and analysis of emerging threats targeting your industry and stack.',
  },
  {
    icon: HiCloud,
    title: 'Cloud Security Audits',
    description:
      'Comprehensive assessment of cloud infrastructure, IAM policies, and misconfigurations.',
  },
  {
    icon: HiServer,
    title: 'Secure Infrastructure Design',
    description:
      'Architect resilient, zero-trust networks and systems from the ground up.',
  },
  {
    icon: HiCog,
    title: 'Security Automation',
    description:
      'Automate vulnerability scanning, compliance checks, and incident response workflows.',
  },
  {
    icon: HiDatabase,
    title: 'SIEM Setup & Management',
    description:
      'Deploy and configure centralized logging, alerting, and Security Information Event Management systems.',
  },
];

/* ─── Technology & Expertise ─── */
const techCapabilities = [
  {
    icon: HiChartBar,
    title: 'Advanced Threat Analysis',
    description: 'Deep inspection of attack vectors using behavioral analytics and ML-driven anomaly detection.',
  },
  {
    icon: HiLockClosed,
    title: 'Secure System Architecture',
    description: 'Defense-in-depth blueprints with zero-trust principals and micro-segmentation.',
  },
  {
    icon: HiRefresh,
    title: 'Continuous Monitoring',
    description: '24/7 SOC-level visibility into your infrastructure with real-time alerting.',
  },
  {
    icon: HiTerminal,
    title: 'Incident Response',
    description: 'Rapid containment, forensic investigation, and post-incident hardening.',
  },
];

/* ─── Security Solutions ─── */
const solutions = [
  {
    icon: HiDocumentSearch,
    title: 'Enterprise Security Assessments',
    description: 'End-to-end security evaluations covering applications, networks, and human factors.',
  },
  {
    icon: HiServer,
    title: 'Infrastructure Hardening',
    description: 'Reduce your attack surface with CIS benchmarks, patch management, and config auditing.',
  },
  {
    icon: HiGlobe,
    title: 'Security Architecture Design',
    description: 'Scalable security frameworks aligned with NIST, ISO 27001, and cloud-native best practices.',
  },
  {
    icon: HiDatabase,
    title: 'Vulnerability Management',
    description: 'Continuous discovery, prioritization, and remediation tracking across your estate.',
  },
];

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
  /* Rotating text state */
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
              Your Security, Our Mission
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6"
            >
              Security that keeps up
              <br />
              with your{' '}
              <span className="gradient-text">ambition</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed"
            >
              Advanced cybersecurity solutions built to protect modern digital
              infrastructure.
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
              <Link to="/community" className="btn-gradient text-base">
                Explore Services
              </Link>
              <Link to="/contact" className="btn-gradient-outline text-base">
                Request Security Audit
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

      {/* ══════════════ CYBERSECURITY SERVICES ══════════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Cybersecurity Services"
            subtitle="End-to-end security services designed to safeguard your digital assets, infrastructure, and operations."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                    <service.icon className="text-primary" size={24} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary">
                    {service.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {service.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TECHNOLOGY & EXPERTISE ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading
            title="Technology Driven Security"
            subtitle="Leveraging cutting-edge techniques and deep expertise to stay ahead of evolving threats."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techCapabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <div className="glass-card p-6 h-full text-center group transition-all duration-300 hover:border-primary/20 hover:bg-bg-card-hover">
                  {/* Glowing icon ring */}
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5 group-hover:shadow-[0_0_24px_rgba(239,47,136,0.15)] transition-all duration-300">
                    <cap.icon className="text-primary" size={26} />
                  </div>
                  <h3 className="font-heading font-semibold text-base mb-2 text-text-primary">
                    {cap.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {cap.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SECURITY SOLUTIONS ══════════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Security Solutions"
            subtitle="Structured programs to elevate your organization's security posture at every layer."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {solutions.map((sol, i) => (
              <motion.div
                key={sol.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full group">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-accent-blue/15 to-accent-purple/15 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(56,189,248,0.12)] transition-all duration-300">
                      <sol.icon className="text-accent-blue" size={22} />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-base mb-1.5 text-text-primary">
                        {sol.title}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed">
                        {sol.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ COMMUNITY PREVIEW ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            {...fadeUp}
            className="glass-card p-8 md:p-16 text-center gradient-border"
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-6">
              Cybersecurity{' '}
              <span className="gradient-text">Community</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Join the ZeroTrace community to collaborate with cybersecurity
              enthusiasts, participate in CTF events, and share technical
              writeups.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/community" className="btn-gradient text-base">
                Join Community
              </Link>
              <Link to="/blog" className="btn-gradient-outline text-base">
                View Writeups
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-border">
              {[
                { value: '500+', label: 'Members' },
                { value: '200+', label: 'Writeups' },
                { value: '50+', label: 'CTF Events' },
                { value: '24/7', label: 'Support' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-heading font-bold text-2xl md:text-3xl gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-text-muted text-sm mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ CONTACT CTA ══════════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <SectionHeading
              title="Get in Touch"
              subtitle="Need a security assessment or want to collaborate? We'd love to hear from you."
            />
            <Link to="/contact" className="btn-gradient text-base">
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
