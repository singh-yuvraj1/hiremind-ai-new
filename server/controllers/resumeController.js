// ============================================================
//  controllers/resumeController.js  —  HireMind AI
//  Complete, Robust ATS Resume Analysis:
//    • Multi-format extraction: PDF, DOCX, TXT via documentExtractor
//    • Scanned PDF & empty document detection
//    • Transparent 7-dimension deterministic ATS scoring (0-100)
//    • Comprehensive Job Description matching (Required vs Preferred)
//    • AI-powered qualitative review (OpenRouter) with safe schema fallback
//    • Analysis persistence per authenticated user with history
// ============================================================

const axios                       = require('axios');
const User                        = require('../models/User');
const ResumeAnalysis              = require('../models/ResumeAnalysis');
const { extractDocumentText }     = require('../utils/documentExtractor');
const { evaluateATSResume, ROLE_SKILL_PROFILES } = require('../utils/atsScoringEngine');

/* ── AI-powered qualitative review helper ───────────────────────── */

const aiQualitativeReview = async (resumeText, targetRole, jobDescription, deterministicResult, apiKey) => {
  const isJobSpecific = deterministicResult.isJobSpecific;
  const prompt = `You are a senior technical recruiter and ATS career advisor. Provide a constructive, professional qualitative review of this resume for the role: "${targetRole}".

CRITICAL INSTRUCTIONS:
1. Base your evaluation strictly on evidence present in the candidate's actual resume text.
2. DO NOT invent or assume credentials, metrics, employers, or skills that are not supported.
3. Suggest 2-3 actionable bullet point improvements with realistic rewrites.
4. If metrics are missing, explain how the candidate can measure their own work rather than making up false percentages.
5. Respond with valid raw JSON only — no markdown code blocks, no backticks, no extra text.

${isJobSpecific ? `TARGET JOB DESCRIPTION:\n${jobDescription.slice(0, 1500)}\n\n` : ''}
RESUME TEXT:
${resumeText.slice(0, 3500)}

EXPECTED JSON STRUCTURE:
{
  "qualitativeSummary": "<2-3 sentence honest recruiter assessment of candidate's presentation and fit>",
  "strengths": ["<specific strength based on actual resume text>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<constructive weakness observed>", "<weakness 2>", "<weakness 3>"],
  "bulletPointSuggestions": [
    {
      "originalBullet": "<phrase or duty from the resume>",
      "suggestedRewrite": "<action-verb-driven rewrite without fabricated metrics>",
      "reason": "<why this improves ATS and recruiter impact>"
    }
  ],
  "recommendedProjects": ["<relevant project idea tailored to target role/JD>"]
}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'mistralai/mistral-7b-instruct:free',
      messages: [
        { role: 'system', content: 'You are an expert ATS technical resume reviewer. You ALWAYS output valid JSON only. Never use markdown code fences.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1500,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5000',
        'X-Title': 'HireMind AI',
      },
      timeout: 35000,
    }
  );

  const raw = response.data?.choices?.[0]?.message?.content || '';
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('AI returned no parseable JSON.');

  return JSON.parse(match[0]);
};

/* ════════════════════════════════════════════════════════════════════
   CONTROLLER: POST /api/resume/analyze
   Accepts: multipart/form-data (file: resume + targetRole + jobDescription)
         OR application/json    (resumeText + targetRole + jobDescription)
   ════════════════════════════════════════════════════════════════════ */

const analyzeResume = async (req, res) => {
  try {
    let resumeText = '';
    let fileName   = 'Pasted Resume Text';
    let fileType   = 'text';
    let extractionInfo = null;

    // ── 1. Document Extraction & Validation ─────────────────────────
    if (req.file) {
      const extracted = await extractDocumentText(req.file.buffer, req.file.originalname);
      if (!extracted.success) {
        return res.status(400).json({
          success: false,
          extractionStatus: extracted.extractionStatus,
          message: extracted.error || 'Failed to extract text from the uploaded document.',
        });
      }

      resumeText     = extracted.text;
      fileName       = extracted.fileName;
      fileType       = extracted.fileType;
      extractionInfo = {
        pageCount:     extracted.pageCount,
        fileSizeBytes: extracted.fileSizeBytes,
        charCount:     extracted.charCount,
        wordCount:     extracted.wordCount,
        status:        extracted.extractionStatus,
      };
      console.log(`[Resume] Document extracted — ${extracted.wordCount} words (${extracted.fileType}).`);
    } else if (req.body.resumeText) {
      const raw = (req.body.resumeText || '').trim();
      if (raw.length < 50) {
        return res.status(400).json({
          success: false,
          extractionStatus: 'empty',
          message: 'Resume text is too brief (minimum 50 characters required for ATS evaluation).',
        });
      }

      resumeText = raw;
      const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
      extractionInfo = {
        pageCount:     Math.max(1, Math.ceil(wordCount / 350)),
        fileSizeBytes: Buffer.byteLength(resumeText, 'utf8'),
        charCount:     resumeText.length,
        wordCount,
        status:        'success',
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF (.pdf), Word (.docx), or plain text (.txt) file, or paste your resume text.',
      });
    }

    const targetRole     = (req.body.targetRole || 'Software Engineer').trim();
    const jobDescription = (req.body.jobDescription || req.body.jobDescriptionText || '').trim();

    // ── 2. Real Deterministic ATS-Style Scoring ─────────────────────
    const evaluation = evaluateATSResume(resumeText, targetRole, jobDescription);
    evaluation.fileName           = fileName;
    evaluation.fileType           = fileType;
    evaluation.extractionMetadata = extractionInfo;

    // ── 3. AI Qualitative Review (Optional Enhancement) ─────────────
    const apiKey = process.env.OPENROUTER_API_KEY;
    const hasValidKey = apiKey && apiKey.length > 20 && apiKey !== 'your_openrouter_api_key_here';

    if (hasValidKey) {
      try {
        const aiReview = await aiQualitativeReview(resumeText, targetRole, jobDescription, evaluation, apiKey);
        evaluation.aiAnalyzed = true;
        if (aiReview.qualitativeSummary) {
          evaluation.aiSummary = aiReview.qualitativeSummary;
        }
        if (Array.isArray(aiReview.bulletPointSuggestions) && aiReview.bulletPointSuggestions.length) {
          evaluation.bulletPointSuggestions = aiReview.bulletPointSuggestions;
        }
        if (Array.isArray(aiReview.recommendedProjects) && aiReview.recommendedProjects.length) {
          evaluation.recommendedProjects = aiReview.recommendedProjects;
        }
        if (Array.isArray(aiReview.strengths) && aiReview.strengths.length) {
          evaluation.strengths = [...new Set([...evaluation.strengths, ...aiReview.strengths])].slice(0, 5);
        }
        console.log('[Resume] AI qualitative review merged successfully.');
      } catch (aiErr) {
        console.warn('[Resume] AI qualitative review failed (using deterministic output):', aiErr.message);
        evaluation.aiAnalyzed = false;
        evaluation.aiNote = 'AI qualitative suggestions unavailable; deterministic ATS evaluation completed.';
      }
    } else {
      evaluation.aiAnalyzed = false;
    }

    // ── 4. Persist Analysis to Database ─────────────────────────────
    let analysisId = null;
    if (req.user?._id) {
      try {
        const record = await ResumeAnalysis.create({
          user:                 req.user._id,
          fileName,
          fileType,
          targetRole,
          jobDescription,
          isJobSpecific:        evaluation.isJobSpecific,
          atsScore:             evaluation.atsScore,
          scoreLabel:           evaluation.scoreLabel,
          summary:              evaluation.summary,
          scoringDimensions:    evaluation.scoringDimensions,
          skillsAnalysis:       evaluation.skillsAnalysis,
          keywords:             evaluation.keywords,
          sections:             evaluation.sections,
          strengths:            evaluation.strengths,
          improvements:         evaluation.improvements,
          detailedImprovements: evaluation.detailedImprovements,
          wordCount:            evaluation.wordCount,
          aiAnalyzed:           evaluation.aiAnalyzed,
          extractionMetadata:   extractionInfo,
        });

        analysisId = record._id;

        // Update user profile summary
        await User.findByIdAndUpdate(req.user._id, {
          'resumeData.rawText':      resumeText.slice(0, 5000),
          'resumeData.atsScore':     evaluation.atsScore,
          'resumeData.lastAnalyzed': new Date(),
          $inc: { 'dailyUsage.resumeChecks': 1 },
        });
      } catch (dbErr) {
        console.error('[Resume] Database persistence error:', dbErr.message);
      }
    }

    // ── 5. Respond ─────────────────────────────────────────────────
    res.json({
      success:    true,
      analysisId,
      uploadType: fileType,
      targetRole,
      isJobSpecific: evaluation.isJobSpecific,
      analysis:   evaluation,
    });

  } catch (err) {
    console.error('[analyzeResume] Error:', err.message);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'An unexpected error occurred during resume analysis.',
    });
  }
};

/* ════════════════════════════════════════════════════════════════════
   CONTROLLER: GET /api/resume/last
   ════════════════════════════════════════════════════════════════════ */

const getLastAnalysis = async (req, res) => {
  try {
    const lastDoc = await ResumeAnalysis.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (lastDoc) {
      return res.json({ success: true, analysis: lastDoc });
    }

    // Fallback to user document resumeData if no ResumeAnalysis record yet
    const user = await User.findById(req.user._id).select('resumeData');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, resumeData: user.resumeData });
  } catch (err) {
    console.error('[getLastAnalysis] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch last analysis.' });
  }
};

/* ════════════════════════════════════════════════════════════════════
   CONTROLLER: GET /api/resume/history
   ════════════════════════════════════════════════════════════════════ */

const getAnalysisHistory = async (req, res) => {
  try {
    const list = await ResumeAnalysis.find({ user: req.user._id })
      .select('fileName fileType targetRole isJobSpecific atsScore scoreLabel summary createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, history: list });
  } catch (err) {
    console.error('[getAnalysisHistory] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch analysis history.' });
  }
};

/* ════════════════════════════════════════════════════════════════════
   CONTROLLER: GET /api/resume/:id
   ════════════════════════════════════════════════════════════════════ */

const getAnalysisById = async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({ _id: req.params.id, user: req.user._id });
    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found or you do not have permission to access it.',
      });
    }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('[getAnalysisById] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch resume analysis.' });
  }
};

module.exports = {
  analyzeResume,
  getLastAnalysis,
  getAnalysisHistory,
  getAnalysisById,
};
