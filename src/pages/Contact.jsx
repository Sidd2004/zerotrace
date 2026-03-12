import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiShieldCheck,
  HiGlobe,
  HiServer,
  HiUser,
  HiCog,
  HiChat,
} from 'react-icons/hi';
import GridBackground from '@/components/GridBackground';
import SectionHeading from '@/components/SectionHeading';
import GlassCard from '@/components/GlassCard';
import toast from 'react-hot-toast';

const serviceOptions = [
  'Penetration Testing',
  'Web Application Security',
  'Cloud Infrastructure Audit',
  'Red Team Operations',
  'Security Architecture Design',
  'Incident Response',
  'Other / General Inquiry',
];

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Frontend Validation
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedMessage = form.message.trim();

    if (!trimmedName) {
      toast.error('Name is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!trimmedMessage) {
      toast.error('Message cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      // 2. Transmit to Render API (Backend takes care of Supabase DB insert)
      // Supabase Native SMTP takes over automatically inside the Database via webhook
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error('API endpoint is not configured.');
      }
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          phone: form.phone.trim(),
          service: form.service,
          message: trimmedMessage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit contact request.');
      }

      // 3. Frontend Success Feedback
      toast.success(
        <div>
          ✅ Message sent successfully.<br/>
          Our team will get back to you soon.
        </div>,
        { duration: 5000 }
      );
      
      setForm({ name: '', email: '', phone: '', service: '', message: '' });
    } catch (error) {
      console.error('Contact Form Error:', error);
      toast.error(
        <div>
          ❌ Something went wrong while sending your message.<br/>
          Please try again later.
        </div>,
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <GridBackground className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            Get in <span className="gradient-text">Touch</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary text-lg max-w-2xl mx-auto"
          >
            Have a security concern or want to collaborate? We&apos;re here to help.
          </motion.p>
        </div>
      </GridBackground>

      <section className="py-16 bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="font-heading font-bold text-2xl mb-6">
                  Contact <span className="gradient-text">Information</span>
                </h2>

                <div className="space-y-4">
                  {[
                    {
                      icon: HiMail,
                      label: 'Email',
                      value: 'contact@zerotrace.io',
                    },
                    {
                      icon: HiLocationMarker,
                      label: 'Location',
                      value: 'Remote / Global',
                    },
                    {
                      icon: HiChat,
                      label: 'Response Time',
                      value: 'Within 24 hours',
                    },
                  ].map((item) => (
                    <GlassCard
                      key={item.label}
                      hover={false}
                      className="flex items-center gap-4 !p-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <item.icon className="text-primary" size={18} />
                      </div>
                      <div>
                        <div className="text-xs text-text-muted">{item.label}</div>
                        <div className="text-sm font-medium">{item.value}</div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3"
            >
              <GlassCard hover={false} className="gradient-border">
                <h3 className="font-heading font-semibold text-xl mb-6">
                  Send us a Message
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">
                        Name
                      </label>
                      <div className="relative">
                        <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">
                        Email
                      </label>
                      <div className="relative">
                        <HiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          required
                          className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">
                        Phone
                      </label>
                      <div className="relative">
                        <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Service */}
                    <div>
                      <label className="block text-sm text-text-secondary mb-1.5">
                        Service Needed
                      </label>
                      <div className="relative">
                        <HiCog className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <select
                          name="service"
                          value={form.service}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-bg-primary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                        >
                          <option value="">Select a service</option>
                          {serviceOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project or concern..."
                      required
                      rows={5}
                      className="w-full bg-bg-primary border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 resize-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-gradient !py-3.5 text-sm"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
