import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function GradientButton({
  children,
  to,
  href,
  onClick,
  variant = 'solid',
  className = '',
  type = 'button',
  disabled = false,
  ...props
}) {
  const baseClasses =
    variant === 'solid'
      ? 'btn-gradient'
      : 'btn-gradient-outline';

  const content = (
    <motion.span
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-block ${baseClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.span>
  );

  if (to) {
    return <Link to={to} {...props}>{content}</Link>;
  }

  if (href) {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{content}</a>;
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} {...props}>
      {content}
    </button>
  );
}
