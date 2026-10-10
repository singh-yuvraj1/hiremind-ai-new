import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
    title: 'AI Mock Interviews',
    desc: 'Practice with a smart AI interviewer that adapts to your role and difficulty level. Get realistic, high-pressure sessions from your browser.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    title: 'Semantic Evaluation',
    desc: 'AI checks if your answer is actually correct — not just long. Wrong answers get scored low. No inflated scores, ever.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: 'Detailed Score Report',
    desc: 'Get scored separately on communication, confidence, answer quality, and posture. Understand exactly where to improve.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    ),
    title: 'Posture Detection',
    desc: 'Live webcam analysis tracks your eye contact, posture, and body language — giving you feedback real interviewers won\'t.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
    title: 'Mock Tests',
    desc: 'Aptitude, DSA, programming, and behavioral tests with timers and instant graded results. Practice without an AI session.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: 'ATS Resume Analyzer',
    desc: 'Upload your PDF and get an ATS compatibility score, missing keyword gaps, and actionable improvement suggestions instantly.',
  },
];

const steps = [
  { num: '01', title: 'Choose Your Role',    desc: 'Pick the job role you\'re targeting — Frontend, Backend, Data Science, and more.' },
  { num: '02', title: 'Configure Interview', desc: 'Select difficulty, number of questions, and AI interviewer style.' },
  { num: '03', title: 'Give the Interview',  desc: 'Speak or type your answers. Live camera tracks posture and body language.' },
  { num: '04', title: 'Get Real Feedback',   desc: 'AI evaluates correctness, gives honest scores, and explains what went wrong.' },
];

const stats = [
  { val: '10K+', label: 'Interviews practiced' },
  { val: '200+', label: 'Unique questions'      },
  { val: '92%',  label: 'User satisfaction'     },
  { val: '4.8',  label: 'Average rating'        },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  const featRef = useRef(null);

  return (
    <div className="min-h-screen t-bg">
      <Navbar />

      {/* ── HERO ── */}
      <section
        style={{ paddingTop: 'calc(var(--nav-h) + 5rem)', paddingBottom: '6rem', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>

          {/* Status badge */}
          <motion.div
            {...fadeUp(0)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, marginBottom: '1.75rem', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-subtle 2s infinite' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--accent)' }}>
              AI-powered interview preparation
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            {...fadeUp(0.06)}
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              margin: '0 0 1.25rem',
            }}
          >
            Ace your next<br />
            <span style={{ color: 'var(--accent)' }}>technical interview</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            {...fadeUp(0.12)}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
              color: 'var(--muted)',
              maxWidth: 560,
              margin: '0 auto 2.5rem',
              lineHeight: 1.65,
            }}
          >
            Practice with an AI interviewer, get honest scores on your answers, and track your improvement with real data — not inflated metrics.
          </motion.p>

          {/* CTAs */}
          <motion.div {...fadeUp(0.18)} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/signup"
              className="btn-primary"
              style={{ padding: '12px 28px', fontSize: '0.9375rem', textDecoration: 'none', display: 'inline-block' }}
            >
              Start for free →
            </Link>
            <button
              onClick={() => featRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline"
              style={{ padding: '12px 24px', fontSize: '0.9375rem' }}
            >
              See how it works
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...fadeUp(0.26)}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0',
              marginTop: '4rem',
              paddingTop: '2.5rem',
              borderTop: '1px solid var(--border)',
            }}
            className="grid-cols-2 sm:grid-cols-4"
          >
            {stats.map((s, i) => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0 1rem' }}>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {s.val}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featRef} style={{ padding: '5rem 1.5rem', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <motion.p {...fadeUp()} style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Features
            </motion.p>
            <motion.h2 {...fadeUp(0.06)} style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 16px' }}>
              Everything you need to land the job
            </motion.h2>
            <motion.p {...fadeUp(0.12)} style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
              Complete interview preparation with honest AI evaluation — no inflated scores.
            </motion.p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'var(--border)' }}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp(i * 0.05)}
                style={{
                  padding: '2rem',
                  background: 'var(--bg2)',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--bg2)'}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'var(--accent-bg)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent)',
                    marginBottom: '1.25rem',
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="howitworks" style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <motion.p {...fadeUp()} style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              How it works
            </motion.p>
            <motion.h2 {...fadeUp(0.06)} style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', margin: 0 }}>
              From signup to feedback in minutes
            </motion.h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {steps.map((s, i) => (
              <motion.div key={s.num} {...fadeUp(i * 0.08)}>
                <div
                  style={{
                    padding: '1.75rem 1.5rem',
                    borderRadius: 12,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    height: '100%',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', marginBottom: 12 }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 10px', letterSpacing: '-0.01em' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '5rem 1.5rem', background: 'var(--bg2)' }}>
        <div style={{ maxWidth: 620, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...fadeUp()}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', margin: '0 0 1rem' }}>
              Ready to start practicing?
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', margin: '0 0 2rem', lineHeight: 1.6 }}>
              Join thousands of candidates who use HireMind AI to prepare with honest, accurate feedback.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                to="/signup"
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '0.9375rem', textDecoration: 'none', display: 'inline-block' }}
              >
                Get started for free
              </Link>
              <Link
                to="/login"
                className="btn-outline"
                style={{ padding: '12px 24px', fontSize: '0.9375rem', textDecoration: 'none', display: 'inline-block' }}
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
