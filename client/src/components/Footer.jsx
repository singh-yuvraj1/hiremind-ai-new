import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="py-10 px-6 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">

          {/* logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L15 5V11L8 15L1 11V5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="8" cy="8" r="2.5" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-bold t-text">HireMind AI</span>
          </Link>

          {/* credits - Yuvraj */}
          <div className="text-center">
            <p className="text-sm t-muted">© 2024 HireMind AI. All rights reserved.</p>
            <p className="text-xs t-muted mt-1 flex items-center justify-center gap-1.5">
              Made with <span className="text-red-400">❤️</span> by{' '}
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>Yuvraj Singh</span>
              <span className="t-muted">·</span>
              <a href="mailto:yuvraj.singh.95928@gmail.com"
                className="underline underline-offset-2 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--accent)' }}>
                yuvraj.singh.95928@gmail.com
              </a>
            </p>
          </div>

          {/* links */}
          <div className="flex gap-5 text-sm t-muted">
            <a href="#" className="hover:t-text transition-colors">Privacy</a>
            <a href="#" className="hover:t-text transition-colors">Terms</a>
            <a href="mailto:yuvraj.singh.95928@gmail.com" className="hover:t-text transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}