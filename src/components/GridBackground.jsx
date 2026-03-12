export default function GridBackground({ children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 radial-overlay" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
