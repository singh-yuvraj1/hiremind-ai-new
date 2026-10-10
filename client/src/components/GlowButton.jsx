/**
 * GlowButton — DEPRECATED decorative wrapper
 * Now just a passthrough to preserve compatibility
 */
export default function GlowButton({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}
