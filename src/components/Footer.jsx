import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaDiscord, FaLinkedin } from 'react-icons/fa';
import NewsletterForm from './NewsletterForm';
import logo from '@/assets/logo.png';
const footerLinks = {
  Platform: [
    { name: 'Home', path: '/' },
    { name: 'Community', path: '/community' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ],
  Resources: [
    { name: 'Writeups', path: '/blog' },
    { name: 'Events', path: '/community' },
    { name: 'Dashboard', path: '/dashboard' },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={logo} alt="ZeroTrace Logo" className="h-10 w-auto object-contain" />
              <span className="font-heading font-bold text-lg">
                Zero<span className="gradient-text">Trace</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              A cybersecurity community platform for security professionals, CTF players,
              and ethical hackers.
            </p>
            <div className="flex items-center gap-3">
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
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-secondary mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
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

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-text-secondary mb-4">
              Newsletter
            </h4>
            <p className="text-text-muted text-sm mb-4">
              Get the latest cybersecurity news and updates.
            </p>
            <NewsletterForm />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            &copy; {new Date().getFullYear()} ZeroTrace. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Built for the cybersecurity community.
          </p>
        </div>
      </div>
    </footer>
  );
}
