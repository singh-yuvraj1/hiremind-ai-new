import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  { icon: '🎙️', title: 'AI Mock Interviews',      desc: 'Practice with a smart AI interviewer that adapts to your role and difficulty level.' },
  { icon: '🤖', title: 'Semantic Evaluation',      desc: 'AI checks if your answer is actually correct, not just long. Wrong answers get 0.' },
  { icon: '📊', title: 'Detailed Score Report',    desc: 'Get scored on communication, confidence, answer quality, and posture separately.' },
  { icon: '👁️', title: 'Posture Detection',        desc: 'Live webcam analysis tracks your eye contact, posture, and body language.' },
  { icon: '📝', title: 'Mock Tests',               desc: 'Aptitude, DSA, programming, and behavioral tests with timer and instant results.' },
  { icon: '🎯', title: 'Improvement Tracking',     desc: 'Dashboard shows your progress over time with graphs and trends.' },
];

const steps = [
  { num: '01', title: 'Choose Your Role',      desc: 'Pick the job role you are targeting.' },
  { num: '02', title: 'Select AI Character',   desc: 'Choose male or female AI interviewer.' },
  { num: '03', title: 'Give the Interview',    desc: 'Speak or type your answers with live camera on.' },
  { num: '04', title: 'Get Honest Feedback',   desc: 'AI evaluates correctness and gives real scores.' },
];

const stats = [
  { val: '10K+', label: 'Interviews Done'  },
  { val: '92%',  label: 'User Satisfaction' },
  { val: '200+', label: 'Questions'         },
  { val: '4.8★', label: 'Average Rating'    },
];

// fade up animation helper
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

export default function Home() {
  const featRef = useRef(null);

  return (
    <div className="min-h-screen t-bg" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid pt-20 px-5">
        {/* glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(var(--accent), transparent)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(var(--accent2), transparent)' }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div {...fadeUp(0)}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm mb-7 t-card"
            style={{ color: 'var(--accent)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            AI-Powered Interview Preparation
          </motion.div>

          <motion.h1 {...fadeUp(0.1)}
            className="font-display font-extrabold text-5xl md:text-7xl leading-tight mb-6 t-text">
            Ace Your <span className="grad-text">Next Interview</span>
          </motion.h1>

          <motion.p {...fadeUp(0.2)}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-10 t-muted leading-relaxed">
            Practice with an AI interviewer, get honest feedback on your answers, and track your improvement over time.
          </motion.p>

          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup"
              className="px-8 py-4 rounded-xl text-base font-semibold text-white btn-primary shadow-lg">
              Start Practicing Free →
            </Link>
            <button
              onClick={() => featRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-xl btn-outline text-base">
              See Features
            </button>
          </motion.div>

          {/* stats row */}
          <motion.div {...fadeUp(0.4)}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12"
            style={{ borderTop: '1px solid var(--border)' }}>
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-2xl md:text-3xl grad-text">{s.val}</div>
                <div className="text-sm t-muted mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* floating score card */}
        <motion.div
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-10 top-1/3 hidden xl:block t-card rounded-2xl p-4 w-52">
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
                <div className="h-full rounded-full" style={{ width: `${[85, 72, 91][i]}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" ref={featRef} className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2 {...fadeUp()} className="font-display font-bold text-4xl md:text-5xl t-text mb-4">
              Everything You Need to <span className="grad-text">Land the Job</span>
            </motion.h2>
            <motion.p {...fadeUp(0.1)} className="text-lg t-muted max-w-xl mx-auto">
              Complete interview preparation with honest AI evaluation — no inflated scores.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title} {...fadeUp(i * 0.07)}
                whileHover={{ y: -5 }}
                className="t-card rounded-2xl p-6 group cursor-default">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: 'rgba(128,128,128,0.08)' }}>
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 t-text group-hover:text-[var(--accent)] transition-colors">
                  {f.title}
                </h3>
                <p className="text-sm t-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="howitworks" className="py-24 px-6" style={{ background: 'var(--bg2)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.h2 {...fadeUp()} className="font-display font-bold text-4xl md:text-5xl t-text text-center mb-14">
            How It <span className="grad-text">Works</span>
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div key={s.num} {...fadeUp(i * 0.1)} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 t-card">
                  <span className="font-display font-bold text-lg" style={{ color: 'var(--accent)' }}>{s.num}</span>
                </div>
                <h3 className="font-display font-semibold t-text mb-2">{s.title}</h3>
                <p className="text-sm t-muted">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp()} className="t-card rounded-3xl p-12">
            <h2 className="font-display font-bold text-4xl t-text mb-4">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-lg t-muted mb-8">
              Get honest AI feedback — not inflated scores. Practice until you're truly ready.
            </p>
            <Link to="/signup"
              className="inline-block px-10 py-4 font-semibold rounded-xl text-lg text-white btn-primary shadow-xl hover:scale-105 transition-transform">
              Start for Free
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}



