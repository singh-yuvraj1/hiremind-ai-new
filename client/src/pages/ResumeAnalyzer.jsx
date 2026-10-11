import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { resumeAPI } from '../services/api';

const ROLES = [
  { label: 'Software Engineer', icon: '⚙️' },
  { label: 'Frontend Developer', icon: '🎨' },
  { label: 'Backend Developer', icon: '🔧' },
  { label: 'Full Stack Developer', icon: '🔀' },
  { label: 'Data Scientist', icon: '📊' },
  { label: 'ML Engineer', icon: '🤖' },
  { label: 'DevOps Engineer', icon: '🚀' },
  { label: 'Product Manager', icon: '📋' },
  { label: 'Mobile Developer', icon: '📱' },
  { label: 'AI Engineer', icon: '🧠' },
];

const SCORE_COLOR = (s) => (s >= 75 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444');

export default function ResumeAnalyzer() {
  const [resumeText,     setResumeText]     = useState('');
  const [docFile,        setDocFile]        = useState(null);   // File object (.pdf, .docx, .txt)
  const [fileName,       setFileName]       = useState('');
  const [targetRole,     setTargetRole]     = useState('Software Engineer');
  const [jobDescription, setJobDescription] = useState('');
  const [showJdInput,    setShowJdInput]    = useState(false);
  const [analysis,       setAnalysis]       = useState(null);
  const [history,        setHistory]        = useState([]);
  const [showHistory,    setShowHistory]    = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [dragOver,       setDragOver]       = useState(false);
  const fileRef = useRef(null);

  // Load previous analyses history
  useEffect(() => {
    resumeAPI.getHistory()
      .then((res) => setHistory(res.data?.history || []))
      .catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!docFile && resumeText.trim().length < 50) {
      setError('Please upload a resume file (.pdf or .docx) or paste your resume text (minimum 50 characters).');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (docFile) {
        const formData = new FormData();
        formData.append('resume', docFile);
        formData.append('targetRole', targetRole);
        if (jobDescription.trim()) {
          formData.append('jobDescription', jobDescription.trim());
        }
        const res = await resumeAPI.analyze(formData, true);
        setAnalysis(res.data.analysis);
      } else {
        const res = await resumeAPI.analyze({
          resumeText,
          targetRole,
          jobDescription: jobDescription.trim() || undefined,
        });
        setAnalysis(res.data.analysis);
      }

      // Refresh history
      resumeAPI.getHistory()
        .then((hRes) => setHistory(hRes.data?.history || []))
        .catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Resume analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    setError('');

    const name = file.name || '';
    const nameLow = name.toLowerCase();
    const isPdf  = file.type === 'application/pdf' || nameLow.endsWith('.pdf');
    const isDocx = nameLow.endsWith('.docx') || nameLow.endsWith('.doc') || file.type.includes('word') || file.type.includes('document');
    const isTxt  = file.type === 'text/plain' || nameLow.endsWith('.txt');

    if (!isPdf && !isDocx && !isTxt) {
      setError('Unsupported file type. Please upload a PDF (.pdf), Word Document (.docx), or plain text (.txt) file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum allowed size is 5 MB.');
      return;
    }

    if (isTxt) {
      setDocFile(null);
      setFileName('');
      const reader = new FileReader();
      reader.onload = (e) => setResumeText(e.target.result || '');
      reader.readAsText(file);
    } else {
      setDocFile(file);
      setFileName(name);
      setResumeText(`[Document selected: ${name}] — Extracted directly by server parser.`);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadPastAnalysis = async (id) => {
    try {
      setLoading(true);
      const res = await resumeAPI.getOne(id);
      if (res.data?.analysis) {
        setAnalysis(res.data.analysis);
        setShowHistory(false);
      }
    } catch (e) {
      setError('Could not load past analysis.');
    } finally {
      setLoading(false);
    }
  };

  const fileIcon = fileName.toLowerCase().endsWith('.docx') ? '📝' : fileName ? '📄' : '📤';

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl t-text">
              ATS Resume <span className="grad-text">Analyzer</span>
            </h1>
            <p className="t-muted mt-1 text-sm">
              Transparent, deterministic ATS scoring across 7 dimensions with job description matching
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="btn-outline px-3.5 py-1.5 text-xs rounded-xl flex items-center gap-1.5"
            >
              <span>🕒</span>
              <span>Past Reports ({history.length})</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 t-card rounded-2xl p-4 overflow-hidden border"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold t-text">Previous Resume Analyses</h3>
              <button onClick={() => setShowHistory(false)} className="text-xs t-muted hover:text-white">✕ Close</button>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
              {history.map((h) => (
                <div
                  key={h._id}
                  onClick={() => loadPastAnalysis(h._id)}
                  className="p-3 rounded-xl cursor-pointer transition-all hover:border-cyan-500 border text-left"
                  style={{ background: 'rgba(128,128,128,0.05)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm" style={{ color: SCORE_COLOR(h.atsScore) }}>
                      {h.atsScore}/100
                    </span>
                    <span className="text-xs t-muted">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-medium t-text truncate">{h.fileName || 'Resume'}</p>
                  <p className="text-xs t-muted truncate">
                    {h.targetRole} {h.isJobSpecific ? '· Targeted' : '· General'}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* ── Input Panel (Left Column) ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-5 space-y-4">
          {/* File Upload Zone */}
          <div
            className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all"
            style={{
              minHeight: 120,
              border: `2px dashed ${dragOver ? 'var(--accent)' : fileName ? 'rgba(34,197,94,0.5)' : 'var(--border)'}`,
              background: dragOver ? 'rgba(0,229,255,0.05)' : fileName ? 'rgba(34,197,94,0.04)' : 'rgba(128,128,128,0.03)',
              padding: '1.25rem',
            }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div className="text-3xl mb-2">{fileIcon}</div>
            {fileName ? (
              <>
                <p className="text-sm font-semibold text-green-400 text-center truncate max-w-full px-2">{fileName}</p>
                <p className="text-xs t-muted mt-1 text-center">Ready for ATS parsing</p>
                <button
                  type="button"
                  className="mt-2 text-xs text-red-400 underline hover:text-red-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDocFile(null);
                    setFileName('');
                    setResumeText('');
                  }}
                >
                  Remove document
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium t-text text-center">
                  Drop your <strong>PDF (.pdf)</strong> or <strong>Word (.docx)</strong> resume
                </p>
                <p className="text-xs t-muted mt-1 text-center">Supports .pdf, .docx, and .txt · Max 5 MB</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.doc,.txt,text/plain"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          {/* Paste Text Area */}
          <div>
            <label className="block text-xs font-medium t-muted mb-1.5">
              {fileName ? 'Or paste raw resume text instead:' : 'Resume Text Content:'}
            </label>
            <textarea
              rows={fileName ? 4 : 10}
              value={fileName ? '' : resumeText}
              onChange={(e) => {
                setDocFile(null);
                setFileName('');
                setResumeText(e.target.value);
              }}
              placeholder={fileName ? 'Type here to override uploaded file with text...' : 'Paste your resume content here (name, contact, experience, skills, education, projects)...'}
              className="input-box w-full resize-none text-xs leading-relaxed"
              style={{ fontFamily: 'monospace' }}
            />
            {!fileName && (
              <p className="text-xs t-muted mt-1 text-right">
                {resumeText.trim().split(/\s+/).filter(Boolean).length} words
              </p>
            )}
          </div>

          {/* Target Role Selector */}
          <div>
            <label className="block text-xs font-semibold mb-2 t-text">
              🎯 Target Role:
              <span className="ml-2 font-normal text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,229,255,0.12)', color: 'var(--accent)' }}>
                {targetRole}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {ROLES.map(({ label, icon }) => {
                const active = targetRole === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setTargetRole(label)}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-medium text-left transition-all"
                    style={{
                      background: active ? 'rgba(0,229,255,0.18)' : 'rgba(128,128,128,0.06)',
                      border: active ? '1px solid var(--accent)' : '1px solid rgba(128,128,128,0.15)',
                      color: active ? 'var(--accent)' : 'var(--muted)',
                    }}
                  >
                    <span>{icon}</span>
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Job Description Input */}
          <div className="rounded-xl p-3 border" style={{ background: 'rgba(128,128,128,0.03)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold t-text flex items-center gap-1.5 cursor-pointer" onClick={() => setShowJdInput(!showJdInput)}>
                <span>📌 Target Job Description</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Optional</span>
              </label>
              <button
                type="button"
                onClick={() => setShowJdInput(!showJdInput)}
                className="text-xs t-muted hover:text-white"
              >
                {showJdInput ? '▲ Hide' : '▼ Add JD for exact match'}
              </button>
            </div>

            {showJdInput && (
              <div className="mt-2.5">
                <textarea
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description, required qualifications, and duties here to evaluate exact skill match, keyword density, and custom fit..."
                  className="input-box w-full resize-none text-xs leading-relaxed"
                />
                <p className="text-[11px] t-muted mt-1">
                  Enables tailored Required vs Preferred skill extraction and exact JD compatibility score.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl text-xs text-red-400 border border-red-500/30" style={{ background: 'rgba(239,68,68,0.08)' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || (!docFile && resumeText.trim().length < 50)}
            className="w-full py-3.5 rounded-xl font-semibold text-white btn-primary disabled:opacity-50 text-sm shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Evaluating Resume...
              </span>
            ) : (
              '⚡ Analyze Resume with ATS Engine'
            )}
          </button>
        </motion.div>

        {/* ── Results Panel (Right Column) ── */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-20 t-card rounded-2xl"
              >
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="font-semibold text-base t-text">Your ATS Evaluation Report</h3>
                <p className="t-muted text-xs mt-2 max-w-sm">
                  Upload your resume or paste the text, select the role, and click Analyze to receive deterministic ATS scoring across 7 dimensions.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center py-20 t-card rounded-2xl"
              >
                <div
                  className="w-14 h-14 border-2 border-t-transparent rounded-full animate-spin mb-4"
                  style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
                />
                <p className="t-text font-medium text-sm">Parsing document & computing ATS metrics...</p>
                <p className="t-muted text-xs mt-1">Evaluating 7 scoring dimensions and keyword match</p>
              </motion.div>
            )}

            {analysis && !loading && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* ── Overall Score Card ── */}
                <div className="t-card rounded-2xl p-6 text-center border" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="t-muted">
                      {analysis.isJobSpecific ? '🎯 Target Job Match' : '📋 General Resume Evaluation'}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: `${SCORE_COLOR(analysis.atsScore)}15`,
                        color: SCORE_COLOR(analysis.atsScore),
                        border: `1px solid ${SCORE_COLOR(analysis.atsScore)}40`,
                      }}
                    >
                      {analysis.scoreLabel || (analysis.atsScore >= 75 ? 'Strong Match' : analysis.atsScore >= 50 ? 'Moderate' : 'Low Match')}
                    </span>
                  </div>

                  <div className="relative inline-flex items-center justify-center w-28 h-28 mb-3">
                    <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(128,128,128,0.15)" strokeWidth="9" />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={SCORE_COLOR(analysis.atsScore)}
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - analysis.atsScore / 100) }}
                        transition={{ duration: 1.0, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold t-text">{analysis.atsScore}</span>
                      <span className="text-[10px] t-muted">/100</span>
                    </div>
                  </div>

                  <p className="text-xs font-medium t-text max-w-md mx-auto leading-relaxed">
                    {analysis.summary}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[11px] t-muted border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                    <span>Target: <strong>{analysis.targetRole}</strong></span>
                    <span>•</span>
                    <span>Words: <strong>{analysis.wordCount || 0}</strong></span>
                    <span>•</span>
                    <span>Est. Pages: <strong>{analysis.pagesEstimate || 1}</strong></span>
                    {analysis.aiAnalyzed && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">✓ AI Qualitative Review</span>
                      </>
                    )}
                  </div>
                </div>

                {/* ── 7 Configurable Scoring Dimensions ── */}
                {analysis.scoringDimensions && (
                  <div className="t-card rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xs font-bold uppercase tracking-wider t-text">ATS Scoring Dimensions</h3>
                      <span className="text-[11px] t-muted">Total: 100 points</span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(analysis.scoringDimensions).map(([key, dim]) => {
                        const pct = Math.round((dim.score / dim.maxScore) * 100);
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium t-text">{dim.label} <span className="text-[10px] t-muted">({dim.weight})</span></span>
                              <span className="font-semibold" style={{ color: SCORE_COLOR(pct) }}>
                                {dim.score} / {dim.maxScore}
                              </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden bg-neutral-800">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: SCORE_COLOR(pct) }}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8 }}
                              />
                            </div>
                            <p className="text-[11px] t-muted leading-tight">{dim.feedback}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Skills Analysis (Required vs Preferred) ── */}
                {analysis.skillsAnalysis && (
                  <div className="t-card rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider t-text mb-3">Skills Alignment</h3>

                    {/* Required Skills */}
                    <div className="mb-3.5">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-semibold text-emerald-400">
                          ✓ Required Skills Matched ({analysis.skillsAnalysis.requiredMatched?.length || 0})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.skillsAnalysis.requiredMatched?.length > 0 ? (
                          analysis.skillsAnalysis.requiredMatched.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs t-muted italic">No required skills demonstrated in text</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Required Skills */}
                    {analysis.skillsAnalysis.requiredMissing?.length > 0 && (
                      <div className="mb-3.5">
                        <span className="text-xs font-semibold text-rose-400 mb-1.5 block">
                          ✗ Missing Required Skills ({analysis.skillsAnalysis.requiredMissing.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.skillsAnalysis.requiredMissing.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded-md text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferred Skills (if any) */}
                    {(analysis.skillsAnalysis.preferredMatched?.length > 0 || analysis.skillsAnalysis.preferredMissing?.length > 0) && (
                      <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                        <span className="text-[11px] font-semibold text-cyan-400 block mb-1">
                          Preferred / Nice-to-Have Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.skillsAnalysis.preferredMatched?.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-300">
                              ✓ {s}
                            </span>
                          ))}
                          {analysis.skillsAnalysis.preferredMissing?.map((s) => (
                            <span key={s} className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400">
                              - {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Detailed Actionable Recommendations ── */}
                {analysis.detailedImprovements?.length > 0 ? (
                  <div className="t-card rounded-2xl p-5 border space-y-3" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      ⚡ Actionable Improvements
                    </h3>
                    <div className="space-y-3">
                      {analysis.detailedImprovements.map((imp, i) => (
                        <div key={i} className="p-3 rounded-xl border text-xs space-y-1.5" style={{ background: 'rgba(128,128,128,0.04)', borderColor: 'var(--border)' }}>
                          <p className="font-semibold text-amber-300">⚠️ {imp.problem}</p>
                          <p className="text-[11px] t-muted"><strong className="text-neutral-300">Why it matters:</strong> {imp.whyItMatters}</p>
                          <p className="text-[11px] text-neutral-200"><strong className="text-cyan-400">How to fix:</strong> {imp.improvement}</p>
                          {imp.exampleRewrite && (
                            <div className="p-2 rounded bg-neutral-900 border border-neutral-700 text-[11px] text-emerald-300 font-mono mt-1">
                              💡 Example: {imp.exampleRewrite}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : analysis.improvements?.length > 0 ? (
                  <div className="t-card rounded-2xl p-5 border" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">⚡ Areas to Improve</h3>
                    <ul className="space-y-1 text-xs t-muted">
                      {analysis.improvements.map((imp, i) => (
                        <li key={i}>• {typeof imp === 'string' ? imp : imp.problem}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {/* ── AI Qualitative Review & Bullet Suggestions (if available) ── */}
                {analysis.bulletPointSuggestions?.length > 0 && (
                  <div className="t-card rounded-2xl p-5 border space-y-3" style={{ borderColor: 'var(--border)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      🤖 AI Bullet Point Rewrites
                    </h3>
                    <div className="space-y-2.5">
                      {analysis.bulletPointSuggestions.map((bp, i) => (
                        <div key={i} className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-1">
                          <p className="text-neutral-400 italic">Original: "{bp.originalBullet}"</p>
                          <p className="text-emerald-400 font-medium">✨ Rewrite: "{bp.suggestedRewrite}"</p>
                          <p className="text-[11px] t-muted">Reason: {bp.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Limitations Note */}
                <p className="text-[10px] t-muted text-center pt-2 italic">
                  {analysis.limitationsNote || 'ATS scores are calculated deterministically to estimate parsing compatibility and keyword alignment.'}
                </p>

                {/* Re-analyze Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAnalysis(null);
                    setDocFile(null);
                    setFileName('');
                    setResumeText('');
                  }}
                  className="w-full py-2.5 rounded-xl text-xs btn-outline"
                >
                  ↩ Scan Another Resume
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
