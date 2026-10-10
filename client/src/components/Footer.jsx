import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        padding: '2.5rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>

        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C5.79 2 4 3.79 4 6c0 1.3.61 2.46 1.56 3.22L5 11h6l-.56-1.78C11.39 8.46 12 7.3 12 6c0-2.21-1.79-4-4-4z" fill="white" opacity="0.9"/>
              <path d="M6 11h4v1.5a.5.5 0 01-1 0V13H7v-.5a.5.5 0 01-1 0V11z" fill="white" opacity="0.7"/>
              <circle cx="8" cy="6" r="1.5" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)', letterSpacing: '-0.01em' }}>
            HireMind AI
          </span>
        </Link>

        {/* Center */}
        <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', margin: 0 }}>
          © {year} HireMind AI · Built by{' '}
          <a
            href="mailto:yuvraj.singh.95928@gmail.com"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
          >
            Yuvraj Singh
          </a>
        </p>

        {/* Links */}
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a
              key={l}
              href={l === 'Contact' ? 'mailto:yuvraj.singh.95928@gmail.com' : '#'}
              style={{ fontSize: '0.8125rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color 0.15s ease' }}
              onMouseEnter={e => e.target.style.color = 'var(--text-2)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}