// ============================================================
//  controllers/resumeController.js  —  HireMind AI
//  FIXED + UPGRADED:
//    • Accepts PDF upload (via multer memoryStorage + pdf-parse)
//    • Accepts plain-text body (backward-compatible)
//    • AI analysis (OpenRouter) with rule-based fallback
//    • ATS scoring, keyword matching, section analysis
//    • Saves last analysis to user profile
// ============================================================

const axios                              = require('axios');
const User                               = require('../models/User');
const { extractTextFromPDF }             = require('../utils/pdfParser');

/* ── ATS keyword lists ────────────────────────────────────────────── */

// Role-specific keyword sets — used by both rule-based fallback and AI prompt
const ROLE_KEYWORDS = {
  'Software Engineer':     ['algorithms', 'data structures', 'system design', 'java', 'python', 'c++', 'go', 'sql', 'rest api', 'microservices', 'git', 'testing', 'code review', 'ci/cd', 'linux', 'docker', 'design patterns', 'object-oriented', 'debugging', 'scalability'],
  'Frontend Developer':    ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css', 'tailwind', 'redux', 'webpack', 'vite', 'responsive design', 'accessibility', 'ui/ux', 'rest api', 'graphql', 'jest', 'cypress', 'performance optimization', 'sass'],
  'Backend Developer':     ['node.js', 'python', 'java', 'go', 'rest api', 'graphql', 'postgresql', 'mongodb', 'redis', 'microservices', 'docker', 'kubernetes', 'aws', 'authentication', 'sql', 'orm', 'message queue', 'kafka', 'rabbitmq', 'ci/cd'],
  'Full Stack Developer':  ['react', 'node.js', 'javascript', 'typescript', 'html', 'css', 'postgresql', 'mongodb', 'rest api', 'docker', 'git', 'aws', 'redux', 'express', 'graphql', 'authentication', 'deployment', 'webpack', 'testing', 'linux'],
  'Data Scientist':        ['python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'sql', 'jupyter', 'statistics', 'machine learning', 'data visualization', 'matplotlib', 'seaborn', 'feature engineering', 'regression', 'classification', 'nlp', 'deep learning', 'a/b testing', 'data cleaning'],
  'ML Engineer':           ['python', 'tensorflow', 'pytorch', 'scikit-learn', 'mlops', 'kubeflow', 'airflow', 'docker', 'kubernetes', 'aws sagemaker', 'model deployment', 'feature engineering', 'deep learning', 'transformer', 'hugging face', 'distributed training', 'gpu', 'ci/cd', 'data pipeline', 'monitoring'],
  'DevOps Engineer':       ['docker', 'kubernetes', 'terraform', 'ansible', 'aws', 'gcp', 'azure', 'ci/cd', 'jenkins', 'github actions', 'linux', 'bash', 'prometheus', 'grafana', 'nginx', 'helm', 'vault', 'monitoring', 'infrastructure as code', 'reliability'],
  'Product Manager':       ['product roadmap', 'user stories', 'agile', 'scrum', 'stakeholder management', 'okrs', 'kpis', 'a/b testing', 'user research', 'wireframes', 'jira', 'confluence', 'go-to-market', 'market analysis', 'prioritization', 'product strategy', 'data-driven', 'cross-functional', 'mvp', 'customer discovery'],
  'Mobile Developer':      ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android', 'xcode', 'android studio', 'rest api', 'firebase', 'push notifications', 'offline storage', 'app store', 'play store', 'ui/ux', 'performance', 'testing', 'ci/cd', 'typescript', 'dart'],
  'AI Engineer':           ['llm', 'langchain', 'openai', 'rag', 'vector database', 'embedding', 'fine-tuning', 'prompt engineering', 'python', 'hugging face', 'transformer', 'pytorch', 'fastapi', 'api integration', 'nlp', 'machine learning', 'mlops', 'docker', 'scalability', 'evaluation'],
};

// Soft skills are universal
const SOFT_KEYWORDS = [
  'leadership', 'teamwork', 'communication', 'problem-solving',
  'agile', 'scrum', 'collaboration', 'analytical', 'initiative',
  'time management', 'critical thinking',
];

/* ── Rule-based ATS analysis ──────────────────────────────────────── */

function ruleBasedResumeAnalysis(text, targetRole) {
  const t         = text.toLowerCase();
  const wordCount = text.trim().split(/\s+/).length;

  // ── Contact & Online Presence ──────────────────────────
  const hasEmail    = /@[a-z0-9.-]+\.[a-z]{2,}/.test(t);
  const hasPhone    = /\d{10}|\+?\d[\d\s\-().]{8,15}\d/.test(t);
  const hasLinkedIn = /linkedin\.com/.test(t);
  const hasGitHub   = /github\.com/.test(t);

  // ── Sections ───────────────────────────────────────────
  const hasExp      = /\b(experience|work history|professional history|internship|employment)\b/.test(t);
  const hasSkills   = /\b(skills|technical skills|technologies|proficiencies|expertise)\b/.test(t);
  const hasEdu      = /\b(education|university|college|degree|b\.?tech|bachelor|master|mba|phd)\b/.test(t);
  const hasAchiev   = /\b(achievement|award|won|prize|rank|certification|certified|publication)\b/.test(t);
  const hasSummary  = /\b(summary|objective|profile|about me|career objective)\b/.test(t);
  const hasProjects = /\b(projects|personal projects|open.?source|github\.com)\b/.test(t);

  // ── Role-specific keyword analysis ─────────────────────
  const roleKws    = ROLE_KEYWORDS[targetRole] || ROLE_KEYWORDS['Software Engineer'];
  const foundTech  = roleKws.filter((k) => t.includes(k.toLowerCase()));
  const missingTech = roleKws.filter((k) => !t.includes(k.toLowerCase()));
  // Show up to 8 most impactful missing keywords
  const missingTop = missingTech.slice(0, 8);
  const foundSoft  = SOFT_KEYWORDS.filter((k) => t.includes(k));

  // ── Keyword match ratio (role-aware score bonus) ────────
  const keywordMatchRatio = roleKws.length > 0 ? foundTech.length / roleKws.length : 0;

  // ── Quantified metrics ─────────────────────────────────
  const hasMetrics = /\d+\s*(%|percent|users|customers|requests|ms|seconds|million|k\s+users|x\s+faster|x\s+improvement)/.test(t);

  // ── Section scores (0–10) ──────────────────────────────
  const contactScore = (hasEmail ? 3 : 0) + (hasPhone ? 2 : 0) + (hasLinkedIn ? 3 : 0) + (hasGitHub ? 2 : 0);
  const summaryScore = hasSummary ? 7 : 3;
  const expScore     = hasExp     ? (wordCount > 300 ? 9 : 6) : 2;
  // Skills score is now role-aware based on keyword match ratio
  const skillsScore  = hasSkills
    ? (keywordMatchRatio >= 0.50 ? 9 : keywordMatchRatio >= 0.30 ? 7 : keywordMatchRatio >= 0.15 ? 5 : 3)
    : (keywordMatchRatio >= 0.20 ? 3 : 1);
  const eduScore     = hasEdu    ? 8 : 3;
  const achievScore  = hasAchiev ? (hasMetrics ? 9 : 7) : 3;

  // ── ATS score (weighted, role-aware) ───────────────────
  const raw = (
    contactScore  * 1.5 +
    summaryScore  * 1.5 +
    expScore      * 3   +
    skillsScore   * 3   +
    eduScore      * 1.5 +
    achievScore   * 1.5 +
    (hasProjects             ? 5  : 0) +
    (hasMetrics              ? 5  : 0) +
    (foundSoft.length >= 3   ? 5  : 0) +
    Math.round(keywordMatchRatio * 10)   // 0–10 bonus based on role keyword match
  );

  const atsScore = Math.min(100, Math.round(raw));

  // ── Strengths & Improvements ───────────────────────────
  const strengths = [];
  const improvements = [];

  if (foundTech.length >= 6) strengths.push(`Strong ${targetRole} keyword match (${foundTech.length}/${roleKws.length} role-specific skills found)`);
  else if (foundTech.length >= 3) strengths.push(`Moderate ${targetRole} keyword coverage (${foundTech.length}/${roleKws.length} skills found — add more)`);
  if (hasLinkedIn && hasGitHub) strengths.push('Both LinkedIn and GitHub profiles included — great for ATS');
  if (hasMetrics)   strengths.push('Uses quantified metrics — highly valued by ATS and recruiters');
  if (hasProjects)  strengths.push('Projects section demonstrates practical experience');
  if (hasAchiev)    strengths.push('Achievements section adds credibility');
  if (!strengths.length) strengths.push('Resume submitted successfully for analysis');

  if (!hasEmail)    improvements.push('Add a professional email address');
  if (!hasPhone)    improvements.push('Add a phone number');
  if (!hasLinkedIn) improvements.push('Add LinkedIn profile URL (linkedin.com/in/yourname)');
  if (!hasGitHub)   improvements.push('Add GitHub profile URL — critical for tech roles');
  if (!hasSummary)  improvements.push('Add a professional summary (3–4 lines) at the top');
  if (!hasExp)      improvements.push('Add a clear "Experience" or "Work History" section');
  if (!hasSkills)   improvements.push('Add a dedicated "Skills" section with categorised tools');
  if (!hasProjects) improvements.push('Add a "Projects" section with GitHub links or live URLs');
  if (!hasMetrics)  improvements.push('Quantify achievements: "Improved performance by 40%", "Served 10K+ users"');
  if (wordCount < 250) improvements.push('Resume is too brief. Aim for 400–700 words (1 page) or 700–1200 (2 pages)');
  if (missingTop.length >= 4) improvements.push(`Key ${targetRole} skills missing: ${missingTop.slice(0, 6).join(', ')}`);

  return {
    atsScore,
    sections: {
      contact:      { score: contactScore, feedback: contactScore >= 8 ? 'Excellent contact section.' : 'Add LinkedIn and GitHub for better ATS scores.' },
      summary:      { score: summaryScore, feedback: hasSummary ? 'Professional summary found — keep it under 4 lines.' : 'Missing summary/objective. Add one detailing your role, years of experience, and key strength.' },
      experience:   { score: expScore,     feedback: hasExp ? (wordCount > 300 ? 'Strong experience section with good detail.' : 'Experience found but seems brief — add bullet points with impact.') : 'No experience section found — add even internships or volunteer work.' },
      skills:       { score: skillsScore,  feedback: `Found ${foundTech.length}/${roleKws.length} ${targetRole} keywords. ${keywordMatchRatio < 0.4 ? `Missing role-critical skills: ${missingTop.slice(0, 4).join(', ')}.` : 'Good keyword coverage for this role.'}` },
      education:    { score: eduScore,     feedback: hasEdu ? 'Education section found.' : 'Add your education details (degree, institution, year).' },
      achievements: { score: achievScore,  feedback: hasAchiev ? (hasMetrics ? 'Excellent — achievements with numbers!' : 'Add numbers to your achievements for impact.') : 'No achievements found. Add awards, certifications, or ranked projects.' },
    },
    keywords: {
      found:   foundTech,
      missing: missingTop,
      soft:    foundSoft,
    },
    strengths,
    improvements,
    summary: `ATS Score: ${atsScore}/100 for ${targetRole}. ${atsScore >= 75 ? 'Strong resume — ready to pass most ATS filters.' : atsScore >= 55 ? 'Decent resume with room to improve. Focus on role-specific keywords and metrics.' : 'Needs significant improvement. Add role-specific keywords, quantified metrics, and missing sections.'}`,
    wordCount,
    pagesEstimate: Math.ceil(wordCount / 350),
  };
}

/* ── AI-based ATS analysis ────────────────────────────────────────── */

async function aiResumeAnalysis(text, targetRole, apiKey) {
  // Build role-specific required keywords hint for the AI
  const roleKws = ROLE_KEYWORDS[targetRole] || ROLE_KEYWORDS['Software Engineer'];
  const roleHint = roleKws.slice(0, 12).join(', ');

  const prompt = `You are an expert ATS resume analyzer and career coach. Analyze this resume strictly for the role: "${targetRole}".

CRITICAL: The ATS score must reflect how well this resume matches a "${targetRole}" role specifically.
Key skills required for ${targetRole}: ${roleHint}
Score the resume based on: how many of these role-specific skills are present, quality of experience, and overall ATS compatibility.
Two different resumes for different roles should get different scores.

RESUME (truncated to 4000 chars):
${text.slice(0, 4000)}

Respond ONLY with raw JSON — no markdown fences, no extra text:
{
  "atsScore": <0-100 integer reflecting match for ${targetRole} specifically>,
  "sections": {
    "contact":      { "score": <0-10>, "feedback": "<specific feedback>" },
    "summary":      { "score": <0-10>, "feedback": "<specific feedback>" },
    "experience":   { "score": <0-10>, "feedback": "<specific feedback for ${targetRole}>" },
    "skills":       { "score": <0-10>, "feedback": "<mention specific ${targetRole} skills found and missing>" },
    "education":    { "score": <0-10>, "feedback": "<specific feedback>" },
    "achievements": { "score": <0-10>, "feedback": "<specific feedback>" }
  },
  "keywords": {
    "found":   ["<${targetRole}-relevant keyword found in resume>"],
    "missing": ["<important ${targetRole} keyword missing from resume>"],
    "soft":    ["<soft skill found>"]
  },
  "strengths":    ["<strength specific to ${targetRole} role>", "<strength_2>", "<strength_3>"],
  "improvements": ["<improvement specific to ${targetRole} role>", "<improvement_2>", "<improvement_3>", "<improvement_4>"],
  "summary": "<2–3 sentence honest, role-specific assessment mentioning ${targetRole} fit explicitly>"
}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model:    'mistralai/mistral-7b-instruct:free',
      messages: [
        { role: 'system', content: 'You are an expert ATS resume analyzer. Always respond with valid JSON only. Never use markdown code blocks.' },
        { role: 'user',   content: prompt },
      ],
      temperature: 0.1,
      max_tokens:  2000,
    },
    {
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':  process.env.CLIENT_URL || 'http://localhost:5000',
        'X-Title':       'HireMind AI',
      },
      timeout: 45000,
    }
  );

  const raw     = response.data?.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  const match   = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI returned no parseable JSON');

  return JSON.parse(match[0]);
}

/* ════════════════════════════════════════════════════════════════════
   CONTROLLER: POST /api/resume/analyze
   Accepts: multipart/form-data (file=resume.pdf + targetRole)
         OR application/json   (resumeText + targetRole) [backward-compat]
   ════════════════════════════════════════════════════════════════════ */

const analyzeResume = async (req, res) => {
  try {
    let resumeText  = '';
    let uploadType  = 'text';

    // ── 1. Extract text from PDF upload OR use body text ──────────
    if (req.file) {
      // PDF uploaded via multer
      const parsed = await extractTextFromPDF(req.file.buffer);
      resumeText   = parsed.text;
      uploadType   = 'pdf';
      console.log(`[Resume] PDF parsed — ${parsed.wordCount} words, ${parsed.pages} page(s).`);
    } else if (req.body.resumeText) {
      // Plain-text body (backward compatible)
      resumeText = req.body.resumeText;
      uploadType  = 'text';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file (field: resume) or provide resumeText in the request body.',
      });
    }

    resumeText = resumeText.trim();
    if (resumeText.length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is too short. Please provide your full resume (minimum 50 characters).',
      });
    }

    const targetRole = (req.body.targetRole || 'Software Engineer').trim();

    // ── 2. Analyze ─────────────────────────────────────────────────
    const apiKey = process.env.OPENROUTER_API_KEY;
    let result;

    const hasValidKey = apiKey && apiKey.length > 20 && apiKey !== 'your_openrouter_api_key_here';

    if (hasValidKey) {
      try {
        result = await aiResumeAnalysis(resumeText, targetRole, apiKey);
        result.aiAnalyzed = true;
        console.log('[Resume] AI analysis complete. ATS Score:', result.atsScore);
      } catch (aiErr) {
        console.warn('[Resume] AI analysis failed → rule-based fallback:', aiErr.message);
        result = ruleBasedResumeAnalysis(resumeText, targetRole);
        result.aiAnalyzed = false;
      }
    } else {
      result = ruleBasedResumeAnalysis(resumeText, targetRole);
      result.aiAnalyzed = false;
    }

    // ── 3. Persist to user profile ─────────────────────────────────
    if (req.user?._id) {
      try {
        if (req.userDoc) {
          req.userDoc.resumeData.rawText      = resumeText.slice(0, 5000);
          req.userDoc.resumeData.atsScore     = result.atsScore;
          req.userDoc.resumeData.lastAnalyzed = new Date();
          req.userDoc.dailyUsage.resumeChecks = (req.userDoc.dailyUsage.resumeChecks || 0) + 1;
          await req.userDoc.save();
        } else {
          await User.findByIdAndUpdate(req.user._id, {
            'resumeData.rawText':      resumeText.slice(0, 5000),
            'resumeData.atsScore':     result.atsScore,
            'resumeData.lastAnalyzed': new Date(),
            $inc: { 'dailyUsage.resumeChecks': 1 },
          });
        }
      } catch (dbErr) {
        console.error('[Resume] Failed to update user profile:', dbErr.message);
      }
    }

    // ── 4. Respond ─────────────────────────────────────────────────
    res.json({
      success:    true,
      uploadType,
      targetRole,
      analysis:   result,
    });

  } catch (err) {
    console.error('[analyzeResume] Error:', err.message);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════════════════════════════════
   CONTROLLER: GET /api/resume/last
   ════════════════════════════════════════════════════════════════════ */

const getLastAnalysis = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('resumeData');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, resumeData: user.resumeData });
  } catch (err) {
    console.error('[getLastAnalysis] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch last analysis.' });
  }
};

module.exports = { analyzeResume, getLastAnalysis };
