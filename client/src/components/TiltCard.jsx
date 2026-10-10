/**
 * TiltCard — DEPRECATED 3D tilt effect
 * Now renders as a clean static wrapper — removes the jarring 3D effect
 */
export default function TiltCard({ children, className = '', style = {}, intensity, scale, ...rest }) {
  return (
    <div className={className} style={style} {...rest}>
      {children}
    </div>
  );
}
