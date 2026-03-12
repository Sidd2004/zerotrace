import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
} from 'react-icons/hi';
import GridBackground from '@/components/GridBackground';
import GlassCard from '@/components/GlassCard';
import SectionHeading from '@/components/SectionHeading';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/utils/helpers';
import { Link } from 'react-router-dom';

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
  { name: 'CipherPhantom', points: 4850, rank: 1 },
  { name: 'NullByte', points: 4620, rank: 2 },
  { name: 'XSSHunter', points: 4310, rank: 3 },
  { name: 'ShellStorm', points: 3980, rank: 4 },
  { name: 'ByteReaper', points: 3750, rank: 5 },
];

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Community() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(4);
      if (error) {
        console.error('[Community] Error fetching events:', error);
      } else if (data) {
        setEvents(data);
      }
    } catch (err) {
      console.error('[Community] Exception fetching events:', err);
    }
  };

  // Fallback events for when DB is not configured
  const displayEvents =
    events.length > 0
      ? events
      : [
          {
            id: '1',
            name: 'ZeroTrace CTF 2025',
            description: 'Annual flagship CTF competition with challenges across all categories.',
            date: '2025-06-15T00:00:00Z',
            duration: '48 hours',
            team_size: 4,
            prize_pool: '$5,000',
          },
          {
            id: '2',
            name: 'Web Exploitation Workshop',
            description: 'Hands-on workshop covering modern web attack vectors and defense techniques.',
            date: '2025-04-20T00:00:00Z',
            duration: '4 hours',
            team_size: 1,
            prize_pool: 'Free',
          },
          {
            id: '3',
            name: 'Binary Pwn Night',
            description: 'Live binary exploitation challenges with real-time leaderboard.',
            date: '2025-05-10T00:00:00Z',
            duration: '6 hours',
            team_size: 2,
            prize_pool: '$1,000',
          },
        ];

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
            className="text-text-secondary text-lg max-w-2xl mx-auto"
          >
            A community-driven platform for cybersecurity enthusiasts to learn,
            share, and compete together.
          </motion.p>
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
                  ZeroTrace is a cybersecurity community built by security
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
                  { value: '500+', label: 'Active Members' },
                  { value: '100+', label: 'Writeups Published' },
                  { value: '30+', label: 'CTF Events' },
                  { value: '5', label: 'Focus Areas' },
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-gradient text-base">
              Create Account
            </Link>
            <Link to="/blog" className="btn-gradient-outline text-base">
              Browse Writeups
            </Link>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Upcoming Events"
            subtitle="Participate in CTF competitions, workshops, and community events."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event, i) => (
              <motion.div
                key={event.id}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-center gap-2 mb-3">
                    <HiCalendar className="text-primary" size={16} />
                    <span className="text-xs text-primary font-medium">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {event.name}
                  </h3>
                  <p className="text-text-muted text-sm mb-4 leading-relaxed">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    {event.duration && <span>⏱ {event.duration}</span>}
                    {event.team_size && <span>👥 {event.team_size} per team</span>}
                    {event.prize_pool && <span>🏆 {event.prize_pool}</span>}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hall of Fame */}
      <section className="py-24 bg-bg-secondary">
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
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-sm ${
                      player.rank === 1
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
