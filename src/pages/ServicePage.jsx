import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowLeft, HiCheckCircle, HiChevronRight } from 'react-icons/hi';
import GridBackground from '@/components/GridBackground';
import GlassCard from '@/components/GlassCard';
import SectionHeading from '@/components/SectionHeading';
import { getServiceBySlug, cyberServices, aiServices } from '@/data/serviceData';

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

export default function ServicePage() {
  const { slug } = useParams();
  const service = getServiceBySlug(slug);

  if (!service) {
    return <Navigate to="/" replace />;
  }

  const isCyber = cyberServices.some((s) => s.slug === slug);
  const relatedServices = (isCyber ? cyberServices : aiServices)
    .filter((s) => s.slug !== slug)
    .slice(0, 3);

  return (
    <>
      {/* ══════════════ HERO ══════════════ */}
      <GridBackground className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-text-muted mb-8"
          >
            <Link to="/" className="hover:text-text-primary transition-colors">Home</Link>
            <HiChevronRight size={14} />
            <span className="text-text-secondary">Services</span>
            <HiChevronRight size={14} />
            <span className="text-primary">{service.title}</span>
          </motion.div>

          <div className="max-w-4xl">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <service.icon size={16} />
              {isCyber ? 'Cybersecurity Service' : 'AI Solution'}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-black text-4xl sm:text-5xl md:text-6xl leading-[1.1] mb-6"
            >
              {service.title}
            </motion.h1>

            {/* Intro */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-text-secondary text-lg md:text-xl max-w-3xl leading-relaxed mb-8"
            >
              {service.intro}
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/contact" className="btn-gradient text-base">
                {service.ctaText}
              </Link>
              <Link to="/" className="btn-gradient-outline text-base inline-flex items-center gap-2">
                <HiArrowLeft size={16} />
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </GridBackground>

      {/* ══════════════ WHAT IT IS ══════════════ */}
      <section className="py-24 bg-bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div {...fadeUp}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
                What Is <span className="gradient-text">{service.title}</span>?
              </h2>
              <p className="text-text-secondary text-base leading-relaxed">
                {service.whatItIs}
              </p>
            </motion.div>

            {/* How It Works */}
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <GlassCard hover={false} className="gradient-border">
                <h3 className="font-heading font-semibold text-xl mb-6 text-text-primary">
                  How It Works
                </h3>
                <div className="space-y-4">
                  {service.howItWorks.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-sm font-heading font-bold text-primary">
                        {i + 1}
                      </div>
                      <p className="text-text-secondary text-sm leading-relaxed pt-1">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ USE CASES ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeading
            title="Use Cases"
            subtitle="Real-world scenarios where this service delivers measurable value."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {service.useCases.map((useCase, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="h-full">
                  <div className="flex items-start gap-3">
                    <HiCheckCircle className="text-success shrink-0 mt-0.5" size={20} />
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {useCase}
                    </p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ TECH STACK ══════════════ */}
      {service.techStack && service.techStack.length > 0 && (
        <section className="py-24 bg-bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Technology Stack"
              subtitle="Tools and frameworks we leverage for this service."
            />

            <motion.div
              {...fadeUp}
              className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto"
            >
              {service.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-5 py-2.5 rounded-xl bg-bg-card border border-border text-text-secondary text-sm font-medium hover:border-primary/30 hover:text-text-primary transition-all duration-200"
                >
                  {tech}
                </span>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══════════════ WHY ZEROTRACE ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-transparent to-bg-primary" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div {...fadeUp} className="glass-card p-8 md:p-12 gradient-border text-center">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              Why <span className="gradient-text">ZeroTrace</span>?
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              {service.whyZeroTrace}
            </p>
            <Link to="/contact" className="btn-gradient text-base">
              {service.ctaText}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ RELATED SERVICES ══════════════ */}
      {relatedServices.length > 0 && (
        <section className="py-24 bg-bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Related Services"
              subtitle={`Explore more ${isCyber ? 'cybersecurity' : 'AI'} solutions.`}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((rel, i) => (
                <motion.div
                  key={rel.slug}
                  {...stagger}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link to={`/services/${rel.slug}`}>
                    <GlassCard className="h-full group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300">
                        <rel.icon className="text-primary" size={24} />
                      </div>
                      <h3 className="font-heading font-semibold text-lg mb-2 text-text-primary">
                        {rel.title}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed">
                        {rel.shortDesc}
                      </p>
                      <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-4">
                        Learn more <HiChevronRight size={14} />
                      </span>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <SectionHeading
              title="Ready to Get Started?"
              subtitle="Let's discuss how this service can help your organization."
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/contact" className="btn-gradient text-base">
                {service.ctaText}
              </Link>
              <Link to="/" className="btn-gradient-outline text-base">
                View All Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
