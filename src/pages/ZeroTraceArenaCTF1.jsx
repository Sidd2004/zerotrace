import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiGlobe,
  HiEye,
  HiKey,
  HiFingerPrint,
  HiSearch,
  HiCalendar,
  HiClock,
  HiLightningBolt,
  HiCheckCircle,
  HiStar,
  HiUserGroup,
  HiBriefcase,
  HiAcademicCap,
} from 'react-icons/hi';
import GridBackground from '@/components/GridBackground';
import GlassCard from '@/components/GlassCard';
import SectionHeading from '@/components/SectionHeading';

/* ── Arena CTF 1.0 config (same constants as Community) ── */
const ARENA_START_UTC = '2026-08-01T13:00:00Z';
const ARENA_END_UTC = '2026-08-01T21:00:00Z';

function useLocalEventTime() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const startDate = new Date(ARENA_START_UTC);
  const endDate = new Date(ARENA_END_UTC);

  const fmt = (d, opts) =>
    d.toLocaleString(undefined, { timeZone: tz, ...opts });

  const localDate = fmt(startDate, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const localStart = fmt(startDate, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const localEnd = fmt(endDate, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const tzLabel =
    fmt(startDate, { timeZoneName: 'short' }).split(' ').pop() || tz;

  const endLocalDate = fmt(endDate, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateShifted = localDate !== endLocalDate;

  return { localDate, localStart, localEnd, tzLabel, endLocalDate, dateShifted };
}

function useCountdown(targetUTC) {
  const [remaining, setRemaining] = useState(() => calcRemaining(targetUTC));

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(calcRemaining(targetUTC));
    }, 1000);
    return () => clearInterval(id);
  }, [targetUTC]);

  return remaining;
}

function calcRemaining(targetUTC) {
  const diff = Math.max(0, new Date(targetUTC).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    total: diff,
  };
}

/* ── Data ── */
const categories = [
  {
    icon: HiGlobe,
    title: 'Web Exploitation',
    description:
      'SQL injection, XSS, SSRF and modern web attack vectors — exploit real web applications.',
    color: 'from-pink-500/20 to-rose-500/20',
  },
  {
    icon: HiKey,
    title: 'Cryptography',
    description:
      'Break ciphers, crack keys, and exploit flawed crypto implementations.',
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: HiEye,
    title: 'Reverse Engineering',
    description:
      'Decompile binaries, patch executables, and uncover hidden logic.',
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: HiFingerPrint,
    title: 'Forensics',
    description:
      'Analyze disk images, memory dumps, and network captures to find evidence.',
    color: 'from-orange-500/20 to-amber-500/20',
  },
  {
    icon: HiSearch,
    title: 'OSINT',
    description:
      'Leverage public data, social media, and open-source intel to solve challenges.',
    color: 'from-yellow-500/20 to-lime-500/20',
  },
  {
    icon: HiBriefcase,
    title: 'Sponsor Track',
    description:
      'Tackle custom challenges crafted by our sponsors to prove your technical skills and fast-track your way to internship and job opportunities.',
    color: 'from-purple-500/20 to-indigo-500/20',
  },
];

const whyParticipate = [
  {
    icon: HiCheckCircle,
    title: 'Skill Validation',
    description: 'Prove your skills against real-world cybersecurity scenarios — no theoretical exams.',
  },
  {
    icon: HiLightningBolt,
    title: 'CTF-style Problem Solving',
    description: 'Sharpen your offensive security thinking with jeopardy-style challenges.',
  },
  {
    icon: HiBriefcase,
    title: 'Career Opportunities',
    description: 'Stand out to recruiters — top performers get internship and job offers.',
  },
];

const prizeItems = [
  { icon: HiStar, label: 'Prize Pool', value: 'TBA' },
  { icon: HiBriefcase, label: 'Internship Opportunities', value: 'Top performers' },
  { icon: HiAcademicCap, label: 'Job Offers', value: 'For finalists' },
  { icon: HiUserGroup, label: 'Community Recognition', value: 'Hall of Fame listing' },
];

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function ZeroTraceArenaCTF1() {
  const { localDate, localStart, localEnd, tzLabel, endLocalDate, dateShifted } =
    useLocalEventTime();
  const countdown = useCountdown(ARENA_START_UTC);

  useEffect(() => {
    document.title = "ZeroTrace Arena CTF 1.0 | ZeroTrace";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "ZeroTrace Arena CTF 1.0 is an 8-hour online international Capture The Flag competition designed for security enthusiasts. Register now to compete, win prizes, and unlock career opportunities.");
    }
    
    // Cleanup to restore default title on unmount if necessary, though typical SPA behavior is fine without
    return () => {
      document.title = "ZeroTrace | Cybersecurity Community";
    };
  }, []);

  return (
    <>
      {/* ═══════════ Hero ═══════════ */}
      <GridBackground className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
              <HiLightningBolt size={14} />
              Featured Event
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-semibold">
              Jeopardy-style CTF
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs font-semibold">
              <HiGlobe size={14} />
              Online · International
            </span>
          </motion.div>

          {/* title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            ZeroTrace <span className="gradient-text">Arena CTF</span>&nbsp;1.0
          </motion.h1>

          {/* date / time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-5 text-text-secondary text-sm mb-2"
          >
            <span className="inline-flex items-center gap-1.5">
              <HiCalendar className="text-primary" size={16} />
              {localDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HiClock className="text-primary" size={16} />
              {localStart} – {localEnd} ({tzLabel})
            </span>
          </motion.div>
          {dateShifted && (
            <p className="text-xs text-text-muted mb-4">
              Ends on {endLocalDate} in your timezone
            </p>
          )}

          {/* Countdown */}
          {countdown.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="mt-8 max-w-lg mx-auto"
            >
              <div className="glass-card p-5 md:p-6">
                <p className="text-text-muted text-xs font-medium uppercase tracking-widest mb-4">
                  Starts In
                </p>
                <div className="grid grid-cols-4 gap-3 md:gap-6 text-center">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.minutes, label: 'Min' },
                    { value: countdown.seconds, label: 'Sec' },
                  ].map((unit) => (
                    <div key={unit.label} className="flex flex-col items-center justify-center">
                      <div className="font-heading font-black gradient-text tabular-nums leading-tight text-3xl md:text-5xl px-2 pb-1">
                        {String(unit.value).padStart(unit.label === 'Days' && unit.value >= 100 ? 3 : 2, '0')}
                      </div>
                      <div className="text-text-muted text-[10px] md:text-xs mt-1 uppercase tracking-wider">
                        {unit.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* hero CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8"
          >
            <a href="#register" className="btn-gradient text-base inline-flex items-center gap-2">
              <HiLightningBolt size={18} />
              Register Now
            </a>
          </motion.div>
        </div>
      </GridBackground>

      {/* ═══════════ Overview ═══════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Overview"
            subtitle="Everything you need to know about Arena CTF 1.0"
          />

          <motion.div
            {...stagger}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="gradient-border p-8 md:p-10" hover={false}>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  <strong className="text-text-primary">ZeroTrace Arena CTF 1.0</strong> is an{' '}
                  <strong className="text-text-primary">8-hour online international</strong> Capture
                  The Flag competition designed for security enthusiasts of all levels.
                </p>
                <p>
                  The event is{' '}
                  <strong className="text-text-primary">fully practical — no theory, no MCQs</strong>.
                  Every challenge is built around real-world cybersecurity scenarios that mirror
                  actual attack surfaces and vulnerabilities.
                </p>
                <p>
                  Whether you are a first-time CTF player or a seasoned competitor, Arena CTF offers
                  challenges ranging from beginner-friendly to expert-level, ensuring everyone finds
                  something to hack on.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Categories ═══════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Challenge Categories"
            subtitle="Five core domains. Real-world challenges. No theory."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4`}
                  >
                    <cat.icon className="text-white" size={24} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {cat.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Why Participate ═══════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Why Participate"
            subtitle="More than a competition — it's a career accelerator."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {whyParticipate.map((item, i) => (
              <motion.div
                key={item.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <GlassCard className="h-full text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="text-primary" size={26} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
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

      {/* ═══════════ Prize & Opportunities ═══════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Prize & Opportunities"
            subtitle="Compete, win, and unlock your next career move."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {prizeItems.map((p, i) => (
              <motion.div
                key={p.label}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <GlassCard className="flex items-center gap-5">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                    <p.icon className="text-primary" size={22} />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-sm">{p.label}</div>
                    <div className="text-text-muted text-xs mt-0.5">{p.value}</div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Register CTA ═══════════ */}
      <section id="register" className="py-24 bg-bg-secondary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Ready to Compete?"
            subtitle="Registration is free. Grab your spot now."
          />

          <motion.div
            {...stagger}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="gradient-border p-8 md:p-12" hover={false}>
              <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <HiLightningBolt className="text-primary" size={32} />
                </div>
                <p className="text-text-secondary text-sm md:text-base max-w-lg">
                  Join hundreds of hackers from around the world. 8 hours. 5 categories.
                  Real challenges. One winner.
                </p>
                <motion.a
                  href="#register"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-gradient text-lg px-10 py-4 inline-flex items-center gap-2 font-bold"
                >
                  <HiLightningBolt size={20} />
                  Register Now
                </motion.a>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Volunteer Section ═══════════ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Become a Volunteer"
            subtitle="Help us make Arena CTF 1.0 a world-class event."
          />

          <motion.div
            {...stagger}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="gradient-border p-8 md:p-10" hover={false}>
              <div className="flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-accent-blue/20 flex items-center justify-center">
                  <HiUserGroup className="text-secondary" size={32} />
                </div>
                <p className="text-text-secondary text-sm md:text-base max-w-lg">
                  Help organize and manage the CTF, moderate challenges, review submissions,
                  and support participants throughout the event. Gain experience in event
                  management and cybersecurity operations.
                </p>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-gradient-outline text-base inline-flex items-center gap-2"
                >
                  <HiUserGroup size={18} />
                  Register as Volunteer
                </motion.a>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    </>
  );
}
