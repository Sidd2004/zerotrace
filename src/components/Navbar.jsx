import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenuAlt3, HiX, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo.png';

const navLinks = [
  { name: 'Home', path: '/' },
  {
    name: 'Services',
    path: '#',
    dropdown: true,
    sections: [
      {
        label: 'Cybersecurity',
        items: [
          { name: 'SOC Setup & Managed SOC', path: '/services/soc-setup' },
          { name: 'VAPT', path: '/services/vapt' },
          { name: 'Threat Detection & IR', path: '/services/threat-detection' },
          { name: 'Security Audits', path: '/services/security-audits' },
          { name: 'SIEM Integration', path: '/services/siem-integration' },
          { name: 'Red Teaming', path: '/services/red-teaming' },
        ],
      },
      {
        label: 'AI Solutions',
        items: [
          { name: 'AI Automation', path: '/services/ai-automation' },
          { name: 'AI Security Monitoring', path: '/services/ai-security-monitoring' },
          { name: 'Workflow Automation', path: '/services/workflow-automation' },
          { name: 'Fine-Tuned Models', path: '/services/fine-tuned-models' },
          { name: 'Enterprise Search (RAG)', path: '/services/rag-enterprise-search' },
          { name: 'Custom AI Chatbots', path: '/services/ai-chatbots' },
        ],
      },
      {
        label: 'Digital Growth',
        items: [
          { name: 'Website Development', path: '/services/website-development' },
          { name: 'SEO Optimization', path: '/services/seo-optimization' },
          { name: 'AI Search & Google Ranking', path: '/services/ai-search-ranking' },
        ],
      },
    ],
  },
  { name: 'Community', path: '/community' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const dropdownTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="ZeroTrace Logo" className="h-10 w-auto object-contain" />
            <span className="font-heading font-bold text-lg tracking-tight">
              Zero<span className="gradient-text">Trace</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.dropdown ? (
                <div
                  key={link.name}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={handleDropdownEnter}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1 ${
                      location.pathname.startsWith('/services')
                        ? 'text-primary bg-primary/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    {link.name}
                    <HiChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Desktop Dropdown */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] glass-card p-4 shadow-xl shadow-black/20"
                      >
                        <div className="grid grid-cols-3 gap-4">
                          {link.sections.map((section) => (
                            <div key={section.label}>
                              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 px-2">
                                {section.label}
                              </div>
                              {section.items.map((item) => (
                                <Link
                                  key={item.path}
                                  to={item.path}
                                  className={`block px-2 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                                    location.pathname === item.path
                                      ? 'text-primary bg-primary/10'
                                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                  }`}
                                >
                                  {item.name}
                                </Link>
                              ))}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.path
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  Dashboard
                </Link>
                <Link to="/write" className="btn-gradient text-sm !py-2 !px-5">
                  Write
                </Link>
                <button
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-error hover:bg-error/10 transition-all border border-transparent hover:border-error/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-gradient text-sm !py-2 !px-5">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg-primary/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.name}>
                    <button
                      onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        location.pathname.startsWith('/services')
                          ? 'text-primary bg-primary/10'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                      }`}
                    >
                      {link.name}
                      <HiChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 py-2 space-y-3">
                            {link.sections.map((section) => (
                              <div key={section.label}>
                                <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5 px-4">
                                  {section.label}
                                </div>
                                {section.items.map((item) => (
                                  <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`block px-4 py-2 rounded-lg text-sm transition-all ${
                                      location.pathname === item.path
                                        ? 'text-primary bg-primary/10'
                                        : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                                    }`}
                                  >
                                    {item.name}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === link.path
                        ? 'text-primary bg-primary/10'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              )}
              <div className="pt-3 border-t border-border space-y-2">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/write"
                      className="block text-center btn-gradient text-sm !py-2 mb-2"
                    >
                      Write Post
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut();
                        navigate('/');
                        setIsOpen(false);
                      }}
                      className="w-full block text-center px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-error hover:bg-error/10 transition-all border border-transparent hover:border-error/20"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/5"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block text-center btn-gradient text-sm !py-2"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
