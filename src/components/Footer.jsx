import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaDiscord, FaLinkedin } from 'react-icons/fa';
import NewsletterForm from './NewsletterForm';
import logo from '@/assets/logo.png';

const footerLinks = {
  'Cybersecurity': [
    { name: 'SOC Setup', path: '/services/soc-setup' },
    { name: 'VAPT', path: '/services/vapt' },
    { name: 'Threat Detection', path: '/services/threat-detection' },
    { name: 'Security Audits', path: '/services/security-audits' },
    { name: 'SIEM Integration', path: '/services/siem-integration' },
    { name: 'Red Teaming', path: '/services/red-teaming' },
  ],
  'AI Solutions': [
    { name: 'AI Chatbots', path: '/services/ai-chatbots' },
    { name: 'AI Automation', path: '/services/ai-automation' },
    { name: 'Workflow Automation', path: '/services/workflow-automation' },
    { name: 'Fine-Tuned Models', path: '/services/fine-tuned-models' },
    { name: 'Enterprise Search', path: '/services/rag-enterprise-search' },
  ],
  'Digital Growth': [
    { name: 'Website Development', path: '/services/website-development' },
    { name: 'SEO Optimization', path: '/services/seo-optimization' },
    { name: 'AI Search Ranking', path: '/services/ai-search-ranking' },
    { name: 'Community', path: '/community' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ],
};

const socialLinks = [
  { icon: FaGithub, href: '#', label: 'GitHub' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaDiscord, href: '#', label: 'Discord' },
  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="ZeroTrace Logo" className="h-10 w-auto object-contain" />
              <span className="font-heading font-bold text-lg">
                Zero<span className="gradient-text">Trace</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Websites, AI, SEO &amp; cybersecurity — everything your business needs to grow, automate, and stay protected.
            </p>
            <div className="flex items-center gap-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-bg-card border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
            {/* Newsletter */}
            <div>
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-secondary mb-3">
                Newsletter
              </h4>
              <p className="text-text-muted text-xs mb-3">
                Security, AI &amp; growth insights — straight to your inbox.
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-secondary mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-text-muted hover:text-text-primary text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            &copy; {new Date().getFullYear()} ZeroTrace. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Websites · AI · SEO · Cybersecurity — zerotrace.in
          </p>
        </div>
      </div>
    </footer>
  );
}
