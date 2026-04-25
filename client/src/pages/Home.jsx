import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBlobs from '../components/FloatingBlobs';
import TiltCard from '../components/TiltCard';
import GlowButton from '../components/GlowButton';

const features = [
  { icon: '🎙️', title: 'AI Mock Interviews',   desc: 'Practice with a smart AI interviewer that adapts to your role and difficulty level.', gradient: 'rgba(0,229,255,0.08)' },
  { icon: '🤖', title: 'Semantic Evaluation',   desc: 'AI checks if your answer is actually correct, not just long. Wrong answers get 0.', gradient: 'rgba(41,121,255,0.08)' },
  { icon: '📊', title: 'Detailed Score Report', desc: 'Get scored on communication, confidence, answer quality, and posture separately.', gradient: 'rgba(124,58,237,0.08)' },
  { icon: '👁️', title: 'Posture Detection',     desc: 'Live webcam analysis tracks your eye contact, posture, and body language.', gradient: 'rgba(0,229,255,0.06)' },
  { icon: '📝', title: 'Mock Tests',             desc: 'Aptitude, DSA, programming, and behavioral tests with timer and instant results.', gradient: 'rgba(41,121,255,0.06)' },
  { icon: '🎯', title: 'Improvement Tracking',  desc: 'Dashboard shows your progress over time with graphs and trends.', gradient: 'rgba(124,58,237,0.06)' },
];

const steps = [
  { num: '01', title: 'Choose Your Role',    desc: 'Pick the job role you are targeting.',                       icon: '🎯' },
  { num: '02', title: 'Select AI Character', desc: 'Choose male or female AI interviewer.',                      icon: '🤖' },
  { num: '03', title: 'Give the Interview',  desc: 'Speak or type your answers with live camera on.',            icon: '🎙️' },
  { num: '04', title: 'Get Honest Feedback', desc: 'AI evaluates correctness and gives real scores.',            icon: '📊' },
];

const stats = [
  { val: '10K+', label: 'Interviews Done'   },
  { val: '92%',  label: 'User Satisfaction' },
  { val: '200+', label: 'Questions'          },
  { val: '4.8★', label: 'Average Rating'     },
];

// fade up animation helper
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function Home() {
  const featRef   = useRef(null);
  const heroRef   = useRef(null);

  // Parallax: background grid moves slower than foreground
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, -120]);

  return (
    <div className="min-h-screen t-bg" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-5"
      >
        {/* Parallax background layer */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 bg-grid pointer-events-none"
          aria-hidden="true"
        />

        {/* Floating animated blobs */}
        <FloatingBlobs density="medium" opacity={0.15} />

        {/* Extra glow blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(var(--accent), transparent)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(var(--accent2), transparent)' }}
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-7 t-card"
            style={{ color: 'var(--accent)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            AI-Powered Interview Preparation
          </motion.div>

          <motion.h1 {...fadeUp(0.08)}
            className="font-display font-extrabold text-5xl md:text-7xl leading-tight mb-6 t-text">
            Ace Your <span className="grad-text">Next Interview</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 t-muted leading-relaxed">
            Practice with an AI interviewer, get honest feedback on your answers, and track your improvement over time.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton>
              <Link to="/signup"
                className="px-8 py-4 rounded-xl text-base font-semibold text-white btn-primary shadow-lg inline-block">
                Start Practicing Free →
              </Link>
            </GlowButton>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => featRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-xl btn-outline text-base">
              See Features
            </motion.button>
          </motion.div>

          {/* Stats row */}
          <motion.div {...fadeUp(0.32)}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12"
            style={{ borderTop: '1px solid var(--border)' }}>
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-2xl md:text-3xl grad-text">{s.val}</div>
                <div className="text-sm t-muted mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating score card */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-10 top-1/3 hidden xl:block t-card rounded-2xl p-4 w-56"
          style={{ boxShadow: '0 8px 32px rgba(0,229,255,0.10)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs t-muted">AI Analyzing...</span>
          </div>
          {['Communication', 'Confidence', 'Answer Quality'].map((l, i) => (
            <div key={l} className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="t-muted">{l}</span>
                <span style={{ color: 'var(--accent)' }}>{[85, 72, 91][i]}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(128,128,128,0.12)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${[85, 72, 91][i]}%` }}
                  transition={{ duration: 1.2, delay: 0.4 + i * 0.2, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }}
                />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <svg className="w-6 h-6 t-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featRef} className="py-28 px-6 relative overflow-hidden">
        {/* Subtle bg blobs */}
        <FloatingBlobs density="low" opacity={0.07} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <motion.div {...fadeUp()} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-5 t-card" style={{ color: 'var(--accent)' }}>
              ✦ Features
            </motion.div>
            <motion.h2 {...fadeUp(0.06)} className="font-display font-bold text-4xl md:text-5xl t-text mb-4">
              Everything You Need to <span className="grad-text">Land the Job</span>
            </motion.h2>
            <motion.p {...fadeUp(0.12)} className="text-lg t-muted max-w-xl mx-auto">
              Complete interview preparation with honest AI evaluation — no inflated scores.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i * 0.07)}>
                <TiltCard
                  className="t-card rounded-2xl p-6 group cursor-default h-full"
                  intensity={8}
                  scale={1.03}
                  style={{ background: f.gradient }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                    style={{ background: 'rgba(128,128,128,0.10)' }}>
                    {f.icon}
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2 t-text group-hover:text-[var(--accent)] transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm t-muted leading-relaxed">{f.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="howitworks" className="py-28 px-6 relative overflow-hidden" style={{ background: 'var(--bg2)' }}>
        <FloatingBlobs density="low" opacity={0.06} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.h2 {...fadeUp()} className="font-display font-bold text-4xl md:text-5xl t-text text-center mb-16">
            How It <span className="grad-text">Works</span>
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-6 relative">
            {steps.map((s, i) => (
              <motion.div key={s.num} {...fadeUp(i * 0.1)} className="text-center relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] w-[calc(100%-56px)] h-px"
                    style={{ background: 'linear-gradient(90deg, var(--accent), transparent)', opacity: 0.25 }}
                  />
                )}
                <TiltCard intensity={6} scale={1.04}
                  className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 t-card">
                  <span className="font-display font-bold text-lg" style={{ color: 'var(--accent)' }}>{s.num}</span>
                </TiltCard>
                <div className="text-2xl mb-2">{s.icon}</div>
                <h3 className="font-display font-semibold t-text mb-2">{s.title}</h3>
                <p className="text-sm t-muted">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <FloatingBlobs density="low" opacity={0.10} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div {...fadeUp()}
            className="relative rounded-3xl p-12 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(41,121,255,0.08), rgba(124,58,237,0.06))',
              border: '1px solid rgba(0,229,255,0.18)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 0 48px rgba(0,229,255,0.08)',
            }}>
            {/* Corner glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20"
              style={{ background: 'var(--accent)' }} />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-15"
              style={{ background: 'var(--accent2)' }} />

            <div className="relative z-10">
              <div className="text-4xl mb-4 float-alt inline-block">🚀</div>
              <h2 className="font-display font-bold text-4xl t-text mb-4">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-lg t-muted mb-8">
                Get honest AI feedback — not inflated scores. Practice until you're truly ready.
              </p>
              <GlowButton>
                <Link to="/signup"
                  className="inline-block px-10 py-4 font-semibold rounded-xl text-lg text-white btn-primary shadow-xl pulse-glow">
                  Start for Free
                </Link>
              </GlowButton>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
