import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { mockAPI } from '../services/api';

const CATEGORIES = [
  { id: 'aptitude',    label: 'Aptitude',    icon: '🧮', desc: '15 questions · Math & logic' },
  { id: 'dsa',         label: 'DSA',         icon: '🌳', desc: '15 questions · Data structures' },
  { id: 'programming', label: 'Programming', icon: '💻', desc: '15 questions · Coding concepts' },
  { id: 'behavioral',  label: 'Behavioral',  icon: '🤝', desc: '12 questions · Soft skills' },
];

const TIME_LIMIT = 600; // 10 minutes

export default function MockTest() {
  const [stage,     setStage]    = useState('select'); // select | test | results
  const [category,  setCategory] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current,   setCurrent]  = useState(0);
  const [answers,   setAnswers]  = useState([]);  // user's selected option index
  const [selected,  setSelected] = useState(null);
  const [timeLeft,  setTimeLeft] = useState(TIME_LIMIT);
  const [results,   setResults]  = useState(null);
  const [loading,   setLoading]  = useState(false);

  const timerRef = useRef(null);

  // countdown timer
  useEffect(() => {
    if (stage !== 'test') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitTest([...answers, selected ?? -1]);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [stage]);

  const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startTest = async (cat) => {
    setLoading(true);
    try {
      const res = await mockAPI.getQuestions(cat, 10);
      setQuestions(res.data.questions);
      setCategory(cat);
      setCurrent(0);
      setAnswers([]);
      setSelected(null);
      setTimeLeft(TIME_LIMIT);
      setStage('test');
    } catch {
      alert('Failed to load questions. Check server.');
    } finally {
      setLoading(false);
    }
  };

  const goNext = () => {
    const newAnswers = [...answers, selected ?? -1];
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      clearInterval(timerRef.current);
      submitTest(newAnswers);
    }
  };

  const submitTest = async (finalAnswers) => {
    try {
      const res = await mockAPI.submit({
        type:        category,
        difficulty:  'medium',
        questions,
        userAnswers: finalAnswers,
        timeTaken:   TIME_LIMIT - timeLeft,
      });
      setResults(res.data);
      setStage('results');
    } catch {
      // even if save fails, calculate locally
      let correct = 0;
      const graded = questions.map((q, i) => {
        const right = finalAnswers[i] === q.correct;
        if (right) correct++;
        return { ...q, userAns: finalAnswers[i], isRight: right };
      });
      setResults({
        score: correct, total: questions.length,
        accuracy: Math.round((correct / questions.length) * 100),
        test: { questions: graded, analysis: { suggestion: '' } },
      });
      setStage('results');
    }
  };

  return (
    <div className="min-h-screen t-bg flex flex-col" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 pt-24 pb-16">
        <AnimatePresence mode="wait">

          {/* ── SELECT CATEGORY ── */}
          {stage === 'select' && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <h1 className="font-display font-bold text-3xl t-text mb-2">Mock Tests</h1>
                <p className="t-muted">10 questions, 10 minutes timer. Questions are randomized each time.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {CATEGORIES.map((cat, i) => (
                  <motion.button key={cat.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    whileHover={{ y: -4 }}
                    onClick={() => !loading && startTest(cat.id)}
                    disabled={loading}
                    className="t-card rounded-2xl p-6 text-left transition-all group"
                    style={{ border: '1px solid var(--border)' }}>
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{cat.icon}</div>
                    <h3 className="font-display font-semibold t-text text-lg mb-1">{cat.label}</h3>
                    <p className="text-sm t-muted">{cat.desc}</p>
                    <div className="text-xs font-medium grad-text mt-4">Start Test →</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── TEST ── */}
          {stage === 'test' && questions.length > 0 && (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* header bar */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-sm t-muted">
                    {CATEGORIES.find(c => c.id === category)?.icon}{' '}
                    {CATEGORIES.find(c => c.id === category)?.label}
                  </span>
                  <div className="text-xs t-muted mt-0.5">Q{current + 1} of {questions.length}</div>
                </div>
                <div className={`font-mono font-bold text-2xl ${timeLeft < 60 ? 'text-red-400' : timeLeft < 180 ? 'text-orange-400' : ''}`}
                  style={{ color: timeLeft >= 180 ? 'var(--accent)' : undefined }}>
                  ⏱ {fmtTime(timeLeft)}
                </div>
              </div>

              {/* progress */}
              <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(128,128,128,0.12)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }}
                  animate={{ width: `${(current / questions.length) * 100}%` }}
                />
              </div>

              {/* question */}
              <motion.div key={current}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="t-card rounded-2xl p-7 mb-5"
                style={{ borderLeft: '3px solid var(--accent)' }}>
                <p className="text-xl font-medium t-text leading-relaxed">{questions[current].question}</p>
              </motion.div>

              {/* options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {questions[current].options.map((opt, i) => (
                  <motion.button key={`${current}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(i)}
                    className="text-left px-5 py-4 rounded-xl border text-sm transition-all"
                    style={{
                      background: selected === i
                        ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                        : 'rgba(128,128,128,0.05)',
                      borderColor: selected === i ? 'transparent' : 'var(--border)',
                      color: selected === i ? 'white' : 'var(--text)',
                    }}>
                    <span className="font-mono text-xs opacity-50 mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </motion.button>
                ))}
              </div>

              {/* next / skip */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setAnswers(a => [...a, -1]); setCurrent(c => c + 1); setSelected(null); }}
                  disabled={current >= questions.length - 1}
                  className="flex-1 py-3 rounded-xl btn-outline text-sm">
                  Skip
                </button>
                <button onClick={goNext}
                  disabled={selected === null}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white btn-primary"
                  style={{ opacity: selected === null ? 0.45 : 1 }}>
                  {current < questions.length - 1 ? 'Next →' : 'Submit Test'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {stage === 'results' && results && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

              {/* score header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="text-7xl mb-4">
                  {results.accuracy >= 80 ? '🏆' : results.accuracy >= 60 ? '👍' : results.accuracy >= 40 ? '📚' : '💪'}
                </motion.div>
                <h1 className="font-display font-bold text-3xl t-text mb-1">
                  {results.score}/{results.total} Correct
                </h1>
                <p className="text-xl font-semibold"
                  style={{ color: results.accuracy >= 70 ? '#22c55e' : results.accuracy >= 50 ? 'var(--accent)' : '#fb923c' }}>
                  {results.accuracy}% — {
                    results.accuracy >= 80 ? 'Excellent!' :
                    results.accuracy >= 60 ? 'Good Job!' :
                    results.accuracy >= 40 ? 'Keep Going!' : 'Needs Practice'
                  }
                </p>
                {results.test?.analysis?.suggestion && (
                  <p className="text-sm t-muted mt-3 max-w-md mx-auto">{results.test.analysis.suggestion}</p>
                )}
              </div>

              {/* question review */}
              <div className="t-card rounded-2xl p-6 mb-5">
                <h2 className="font-display font-semibold t-text mb-4">Question Review</h2>
                <div className="space-y-3">
                  {(results.test?.questions || []).map((q, i) => (
                    <div key={i} className="p-4 rounded-xl border"
                      style={{
                        borderColor: q.isRight ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
                        background: q.isRight ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)',
                      }}>
                      <div className="flex gap-2 mb-2">
                        <span>{q.isRight ? '✅' : '❌'}</span>
                        <p className="text-sm t-text">{q.question}</p>
                      </div>
                      <div className="flex flex-wrap gap-4 ml-6 text-xs">
                        <span className="text-green-400">
                          ✓ Correct: {q.options?.[q.correct]}
                        </span>
                        {!q.isRight && q.userAns >= 0 && (
                          <span className="text-red-400">✗ Your answer: {q.options?.[q.userAns]}</span>
                        )}
                        {q.userAns === -1 && (
                          <span className="t-muted">Skipped</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* action buttons */}
              <div className="flex gap-3">
                <button onClick={() => category && startTest(category)}
                  className="flex-1 py-3.5 rounded-xl font-semibold text-sm text-white btn-primary">
                  Retry Same Category
                </button>
                <button onClick={() => setStage('select')}
                  className="flex-1 py-3.5 rounded-xl text-sm btn-outline">
                  Choose Different
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}