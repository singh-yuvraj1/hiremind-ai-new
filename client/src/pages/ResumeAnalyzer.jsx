import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { resumeAPI } from '../services/api';

const ROLES = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Data Scientist', 'ML Engineer',
  'DevOps Engineer', 'Product Manager', 'Mobile Developer', 'AI Engineer',
];

const SCORE_COLOR = (s) => s >= 70 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444';

export default function ResumeAnalyzer() {
  const [resumeText,   setResumeText]   = useState('');
  const [pdfFile,      setPdfFile]      = useState(null);   // raw PDF File object
  const [pdfName,      setPdfName]      = useState('');     // PDF filename for display
  const [targetRole,   setTargetRole]   = useState('Software Engineer');
  const [analysis,     setAnalysis]     = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [dragOver,     setDragOver]     = useState(false);
  const fileRef = useRef(null);

  const handleAnalyze = async () => {
    if (resumeText.trim().length < 50) {
      setError('Please upload a PDF or paste your full resume text (at least 50 characters).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // If a PDF file is selected, send as multipart/form-data
      if (pdfFile) {
        const formData = new FormData();
        formData.append('resume', pdfFile);
        formData.append('targetRole', targetRole);
        const res = await resumeAPI.analyze(formData, true); // true = isFormData
        setAnalysis(res.data.analysis);
      } else {
        // Plain text paste — send as JSON
        const res = await resumeAPI.analyze({ resumeText, targetRole });
        setAnalysis(res.data.analysis);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handles both PDF and TXT files dropped or selected
  const handleFile = (file) => {
    if (!file) return;
    setError('');

    const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
    const isTxt = file.type === 'text/plain'      || file.name?.toLowerCase().endsWith('.txt');

    if (isPdf) {
      // Store the raw PDF file — it will be sent to backend via FormData
      if (file.size > 5 * 1024 * 1024) {
        setError('PDF is too large. Maximum file size is 5 MB.');
        return;
      }
      setPdfFile(file);
      setPdfName(file.name);
      setResumeText(`[PDF selected: ${file.name}] — Backend will parse this automatically.`);
    } else if (isTxt) {
      // Read .txt file as plain text
      setPdfFile(null);
      setPdfName('');
      const reader = new FileReader();
      reader.onload = e => setResumeText(e.target.result);
      reader.readAsText(file);
    } else {
      setError('Only PDF (.pdf) or plain text (.txt) files are supported.');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display font-bold text-3xl t-text">
          Resume <span className="grad-text">Analyzer</span>
        </h1>
        <p className="t-muted mt-1 text-sm">Get your ATS score, keyword gaps, and AI-powered improvement tips</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Input Panel ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          {/* Drop zone */}
          <div
            className="rounded-2xl mb-4 flex flex-col items-center justify-center cursor-pointer transition-all"
            style={{
              minHeight: 110,
              border: `2px dashed ${dragOver ? 'var(--accent)' : pdfName ? 'rgba(34,197,94,0.5)' : 'var(--border)'}`,
              background: dragOver ? 'rgba(0,229,255,0.05)' : pdfName ? 'rgba(34,197,94,0.04)' : 'rgba(128,128,128,0.03)',
              padding: '1.5rem',
            }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div className="text-3xl mb-2">{pdfName ? '✅' : '📄'}</div>
            {pdfName ? (
              <>
                <p className="text-sm font-semibold text-green-400 text-center">{pdfName}</p>
                <p className="text-xs t-muted mt-1 text-center">PDF ready — click Analyze to scan</p>
                <button
                  className="mt-2 text-xs text-red-400 underline"
                  onClick={e => { e.stopPropagation(); setPdfFile(null); setPdfName(''); setResumeText(''); }}
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium t-text text-center">Drop your <strong>PDF resume</strong> here or click to upload</p>
                <p className="text-xs t-muted mt-1 text-center">Supports .pdf and .txt · Max 5 MB</p>
              </>
            )}
            {/* accept PDF and TXT */}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf,.txt,text/plain"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>

          {/* Text area — hidden when PDF is uploaded */}
          <div className="mb-4">
            <label className="block text-sm font-medium t-muted mb-2">
              {pdfName ? 'Or paste resume text instead (will override PDF)' : 'Paste Resume Text'}
            </label>
            <textarea
              rows={pdfName ? 5 : 14}
              value={pdfName ? '' : resumeText}
              onChange={e => { setPdfFile(null); setPdfName(''); setResumeText(e.target.value); }}
              placeholder={pdfName ? 'Type here to use text instead of uploaded PDF...' : 'Paste your full resume here — name, contact, experience, skills, education, achievements...'}
              className="input-box w-full resize-none"
              style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8rem', lineHeight: 1.7 }}
            />
            {!pdfName && (
              <p className="text-xs t-muted mt-1">{resumeText.trim().split(/\s+/).filter(Boolean).length} words</p>
            )}
          </div>

          {/* Target role */}
          <div className="mb-4">
            <label className="block text-sm font-medium t-muted mb-2">Target Role</label>
            <select
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              className="input-box"
            >
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400 mb-4 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)' }}>
              {error}
            </p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || (!pdfFile && resumeText.trim().length < 50)}
            className="w-full py-3.5 rounded-xl font-semibold text-white btn-primary disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analyzing with AI...
              </span>
            ) : '🤖 Analyze My Resume'}
          </button>

          {/* Tips */}
          <div className="mt-5 p-4 rounded-xl text-xs space-y-1.5"
            style={{ background: 'rgba(128,128,128,0.05)', borderLeft: '3px solid var(--accent)' }}>
            <p className="font-medium" style={{ color: 'var(--accent)' }}>📋 Tips for best results:</p>
            <p className="t-muted">• Upload your PDF directly — no copy-paste needed</p>
            <p className="t-muted">• Include contact info, summary, skills, and experience</p>
            <p className="t-muted">• Add quantified achievements (e.g., "reduced load time by 40%")</p>
            <p className="t-muted">• Use keywords from the job description</p>
            <p className="t-muted">• Aim for 300–600 words for a thorough analysis</p>
          </div>
        </motion.div>

        {/* ── Results Panel ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-20 t-card rounded-2xl">
                <div className="text-6xl mb-4">🎯</div>
                <p className="t-muted font-medium">Your ATS analysis will appear here</p>
                <p className="text-sm t-muted mt-2">Paste your resume and click Analyze</p>
              </motion.div>
            )}

            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-20 t-card rounded-2xl">
                <div className="w-16 h-16 border-2 border-t-transparent rounded-full animate-spin mb-6"
                  style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                <p className="t-text font-medium">Analyzing your resume...</p>
                <p className="t-muted text-sm mt-2">Checking ATS compatibility, keywords, and sections</p>
              </motion.div>
            )}

            {analysis && !loading && (
              <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4">

                {/* ATS Score ring */}
                <div className="t-card rounded-2xl p-6 text-center">
                  <p className="text-sm t-muted mb-3 font-medium">ATS Compatibility Score</p>
                  <div className="relative inline-flex items-center justify-center w-28 h-28 mb-3">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth="10" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke={SCORE_COLOR(analysis.atsScore)} strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - analysis.atsScore / 100) }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold t-text">{analysis.atsScore}</span>
                      <span className="text-xs t-muted">/100</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium" style={{ color: SCORE_COLOR(analysis.atsScore) }}>
                    {analysis.atsScore >= 70 ? '✅ ATS Friendly' : analysis.atsScore >= 50 ? '⚠️ Needs Improvement' : '❌ Poor ATS Score'}
                  </p>
                  <p className="text-xs t-muted mt-2 leading-relaxed">{analysis.summary}</p>
                </div>

                {/* Section scores */}
                {analysis.sections && (
                  <div className="t-card rounded-2xl p-5">
                    <h3 className="font-semibold t-text mb-4 text-sm">Section Analysis</h3>
                    <div className="space-y-3">
                      {Object.entries(analysis.sections).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="t-text capitalize">{key}</span>
                            <span style={{ color: SCORE_COLOR(val.score * 10) }}>{val.score}/10</span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(128,128,128,0.12)' }}>
                            <motion.div className="h-full rounded-full"
                              style={{ background: SCORE_COLOR(val.score * 10) }}
                              initial={{ width: 0 }}
                              animate={{ width: `${val.score * 10}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                          <p className="text-xs t-muted mt-0.5">{val.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                {analysis.keywords && (
                  <div className="t-card rounded-2xl p-5">
                    <h3 className="font-semibold t-text mb-3 text-sm">Keyword Analysis</h3>
                    <div className="mb-3">
                      <p className="text-xs t-muted mb-2">✅ Found ({analysis.keywords.found?.length || 0})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.keywords.found?.map(k => (
                          <span key={k} className="px-2 py-0.5 rounded-md text-xs"
                            style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs t-muted mb-2">❌ Missing ({analysis.keywords.missing?.length || 0})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.keywords.missing?.map(k => (
                          <span key={k} className="px-2 py-0.5 rounded-md text-xs"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="t-card rounded-2xl p-4">
                    <p className="text-xs font-semibold mb-2" style={{ color: '#22c55e' }}>✅ Strengths</p>
                    <ul className="space-y-1">
                      {analysis.strengths?.map((s, i) => (
                        <li key={i} className="text-xs t-muted">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="t-card rounded-2xl p-4">
                    <p className="text-xs font-semibold mb-2 text-yellow-400">⚡ Improvements</p>
                    <ul className="space-y-1">
                      {analysis.improvements?.map((s, i) => (
                        <li key={i} className="text-xs t-muted">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Re-analyze */}
                <button onClick={() => setAnalysis(null)}
                  className="w-full py-2.5 rounded-xl text-sm btn-outline">
                  ↩ Analyze Another Resume
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
