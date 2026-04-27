import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiGlobe,
  HiChip,
  HiEye,
  HiKey,
  HiFingerPrint,
  HiUserGroup,
  HiStar,
  HiSearch,
  HiCalendar,
  HiAcademicCap,
  HiClock,
  HiLightningBolt,
} from 'react-icons/hi';
import GridBackground from '@/components/GridBackground';
import GlassCard from '@/components/GlassCard';
import SectionHeading from '@/components/SectionHeading';
import { Link } from 'react-router-dom';

/* ── Arena CTF 1.0 config ── */
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

  // derive short tz label (e.g. "IST", "PST")
  const tzLabel =
    fmt(startDate, { timeZoneName: 'short' }).split(' ').pop() || tz;

  // check if end date is a different calendar day
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

const focusAreas = [
  {
    icon: HiGlobe,
    title: 'Web Exploitation',
    description:
      'SQL injection, XSS, CSRF, SSRF, and modern web attack vectors. Master the art of web application security.',
    color: 'from-pink-500/20 to-rose-500/20',
  },
  {
    icon: HiChip,
    title: 'Binary Exploitation',
    description:
      'Buffer overflows, ROP chains, heap exploitation, and kernel-level vulnerabilities.',
    color: 'from-purple-500/20 to-indigo-500/20',
  },
  {
    icon: HiEye,
    title: 'Reverse Engineering',
    description:
      'Malware analysis, firmware RE, decompilation, and understanding complex binaries.',
    color: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    icon: HiKey,
    title: 'Cryptography',
    description:
      'Classical ciphers, modern crypto attacks, side-channel analysis, and crypto challenges.',
    color: 'from-green-500/20 to-emerald-500/20',
  },
  {
    icon: HiFingerPrint,
    title: 'Digital Forensics',
    description:
      'Disk forensics, memory analysis, network forensics, and incident investigation.',
    color: 'from-orange-500/20 to-amber-500/20',
  },
  {
    icon: HiSearch,
    title: 'OSINT',
    description:
      'Open-source intelligence gathering, reconnaissance, and leveraging public data for security assessments.',
    color: 'from-yellow-500/20 to-lime-500/20',
  },
];

const hallOfFame = [
  { name: 'DOSA', points: 4650, rank: 1 },
  { name: 'D3m0', points: 3400, rank: 2 },
  { name: 'Rudra_Root', points: 3350, rank: 3 },
  { name: 'Th3 Evil Copr5', points: 3200, rank: 4 },
  { name: 'Your Team', points: 3100, rank: 5 },
];

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Community() {
  const navigate = useNavigate();
  const { localDate, localStart, localEnd, tzLabel, endLocalDate, dateShifted } =
    useLocalEventTime();
  const countdown = useCountdown(ARENA_START_UTC);

  return (
    <>
      {/* Hero */}
      <GridBackground className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium mb-6"
          >
            <HiUserGroup size={16} />
            Community
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-6"
          >
            Where <span className="gradient-text">Hackers</span> Unite
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-secondary text-lg max-w-2xl mx-auto mb-8"
          >
            A community-driven platform for cybersecurity enthusiasts to learn,
            share, and compete together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <span className="text-text-primary font-medium text-lg">ZeroTrace Arena CTF 1.0 Registrations are open!</span>
            <Link to="/community/zerotrace-arena-ctf-1" className="btn-gradient px-6 py-2.5 text-sm inline-flex items-center gap-2">
              <HiLightningBolt size={16} />
              Register Now
            </Link>
          </motion.div>
        </div>
      </GridBackground>

      {/* About Community */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...stagger}
            transition={{ duration: 0.6 }}
            className="glass-card p-8 md:p-12 gradient-border"
          >
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                  About <span className="gradient-text">ZeroTrace</span>
                </h2>
                <p className="text-text-secondary leading-relaxed mb-4">
                  ZeroTrace is a cybersecurity community started in March 2026, built by security
                  researchers, for security researchers. We believe in open
                  knowledge sharing, ethical hacking, and empowering the next
                  generation of security professionals.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  Whether you&apos;re just starting your journey into
                  cybersecurity or you&apos;re a seasoned professional, there&apos;s a
                  place for you here. Join us to participate in CTF events,
                  publish technical writeups, and connect with like-minded
                  individuals.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '1500+', label: 'Members Community' },
                  { value: '50+', label: 'Writeups Published' },
                  { value: '10+', label: 'CTF Events' },
                  { value: '15+', label: 'Communities Collaborated' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="glass-card p-4 text-center"
                  >
                    <div className="font-heading font-bold text-2xl gradient-text">
                      {stat.value}
                    </div>
                    <div className="text-text-muted text-xs mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Focus Areas"
            subtitle="Deep-dive into the core domains of cybersecurity with our expert community."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {focusAreas.map((area, i) => (
              <motion.div
                key={area.title}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full group">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center mb-4`}
                  >
                    <area.icon className="text-white" size={24} />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {area.title}
                  </h3>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {area.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Community CTA */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Join the Community"
            subtitle="Ready to level up your cybersecurity skills? Join hundreds of security professionals."
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link to="/register" className="btn-gradient text-base">
              Create Account
            </Link>
            <Link to="/blog" className="btn-gradient-outline text-base">
              Browse Writeups
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] font-semibold text-sm hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" /></svg>
              Join Discord Server
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/20 hover:border-[#25D366]/50 transition-all duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
              Join WhatsApp Group
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════ Featured Event: Arena CTF 1.0 ═══════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Upcoming Events"
            subtitle="Participate in CTF competitions, workshops, and community events."
          />

          {/* Featured card */}
          <motion.div
            {...stagger}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate('/community/zerotrace-arena-ctf-1')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/community/zerotrace-arena-ctf-1')}
              className="cursor-pointer"
            >
              <GlassCard className="gradient-border p-8 md:p-10">
                {/* top badges */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold">
                    <HiLightningBolt size={14} />
                    Featured
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/30 text-secondary text-xs font-semibold">
                    Jeopardy-style CTF
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-xs font-semibold">
                    <HiGlobe size={14} />
                    Online · International
                  </span>
                </div>

                {/* title */}
                <h3 className="font-heading font-black text-2xl md:text-3xl mb-3">
                  ZeroTrace Arena CTF&nbsp;1.0
                </h3>

                {/* date / time / timezone */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary mb-2">
                  <span className="inline-flex items-center gap-1.5">
                    <HiCalendar className="text-primary" size={16} />
                    {localDate}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <HiClock className="text-primary" size={16} />
                    {localStart} – {localEnd} ({tzLabel})
                  </span>
                </div>
                {dateShifted && (
                  <p className="text-xs text-text-muted mb-4">
                    Ends on {endLocalDate} in your timezone
                  </p>
                )}

                {/* meta */}
                <div className="flex flex-wrap items-center gap-5 text-xs text-text-muted mt-4 mb-6">
                  <span>⏱ 8 Hours</span>
                  <span>🏆 Prize Pool: TBA</span>
                  <span>🎁 Internships, Job Offers &amp; More</span>
                </div>


              </GlassCard>
            </div>

            {/* ── Countdown Timer ── */}
            {countdown.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-6"
              >
                <div className="glass-card p-5 md:p-6 flex flex-col items-center">
                  <p className="text-text-muted text-xs font-medium uppercase tracking-widest mb-4">
                    Starts In
                  </p>
                  <div className="grid grid-cols-4 gap-3 md:gap-6 text-center w-full max-w-lg">
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
          </motion.div>
        </div>
      </section>


      {/* Get Your Certificate */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Attended a Zerotrace Event?"
            subtitle="Retrieve and verify your certificate securely."
          />

          <motion.div
            {...stagger}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="gradient-border p-8 md:p-10" hover={false}>
              <div className="flex flex-col items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                  <HiAcademicCap className="text-primary" size={32} />
                </div>
                <p className="text-text-secondary text-sm md:text-base">
                  Verify or download your certificate
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { window.location.href = "https://certificate.zerotrace.in"; }}
                  className="btn-gradient text-base inline-flex items-center gap-2"
                >
                  <HiAcademicCap size={20} />
                  Get Your Certificate
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Hall of Fame */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Hall of Fame"
            subtitle="Top contributors and CTF champions in our community."
          />

          <div className="space-y-3">
            {hallOfFame.map((player, i) => (
              <motion.div
                key={player.name}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass-card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm ${player.rank === 1
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : player.rank === 2
                        ? 'bg-gray-400/20 text-gray-300'
                        : player.rank === 3
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-bg-card text-text-muted'
                      }`}
                  >
                    #{player.rank}
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-sm">
                      {player.name}
                    </div>
                    <div className="text-text-muted text-xs">
                      CTF Champion
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <HiStar className="text-yellow-400" size={16} />
                  <span className="font-heading font-bold text-sm gradient-text">
                    {player.points.toLocaleString()} pts
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
