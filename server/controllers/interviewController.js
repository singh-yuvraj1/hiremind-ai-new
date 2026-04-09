// ============================================================
//  controllers/interviewController.js  —  HireMind AI
//  UPGRADED: RAG-based evaluation + usage tracking
// ============================================================

const axios            = require('axios');
const InterviewSession = require('../models/InterviewSession');
const User             = require('../models/User');
const { ragEvaluateSession } = require('../utils/ragEvaluator');

/* ════════════════════════════════════════════════════════════════════
   QUESTION BANK
   ════════════════════════════════════════════════════════════════════ */

const QB = {
  hr: {
    easy: [
      'Tell me about yourself.',
      'Why do you want this job?',
      'What are your hobbies outside work?',
      'Describe your ideal work environment.',
      'How would your friends describe you?',
    ],
    medium: [
      'What is your biggest weakness and how are you working on it?',
      'Where do you see yourself in 5 years?',
      'How do you handle tight deadlines?',
      'Describe a time you resolved a conflict at work.',
      'Tell me about a time you showed leadership.',
    ],
    hard: [
      'Tell me about a significant failure and what you learned from it.',
      'How would you handle a disagreement with your manager?',
      'Describe a time you had to influence others without authority.',
      'Tell me about a time you made a difficult decision with limited data.',
    ],
  },

  frontend: {
    easy: [
      'What is the difference between HTML, CSS, and JavaScript?',
      'What is the DOM?',
      'Explain the box model in CSS.',
      'What is responsive design?',
    ],
    medium: [
      'Explain how React Virtual DOM works and why it is fast.',
      'What are React hooks? Explain useState and useEffect.',
      'What is the difference between controlled and uncontrolled components?',
      'Explain CSS Flexbox vs Grid.',
      'What is CORS and how do you handle it?',
    ],
    hard: [
      'How would you architect a large-scale React application?',
      'Explain code splitting, lazy loading, and memoization in React.',
      'How does browser rendering pipeline work (Critical Rendering Path)?',
      'How do you optimize a slow React application?',
    ],
  },

  backend: {
    easy: [
      'What is a REST API and what are HTTP methods?',
      'What is middleware in Express.js?',
      'What is the difference between SQL and NoSQL databases?',
    ],
    medium: [
      'Explain the Node.js event loop in detail.',
      'What is JWT authentication and how does it work?',
      'Explain database indexing and why it matters.',
      'What is rate limiting and why is it important?',
    ],
    hard: [
      'Design a scalable backend system for 1 million users.',
      'Explain CQRS, Event Sourcing, and Microservices patterns.',
      'How would you handle distributed transactions across services?',
    ],
  },

  fullstack: {
    easy: [
      'What is the MERN stack and what does each part do?',
      'What is CORS and why do we need it?',
    ],
    medium: [
      'Explain the complete authentication flow from frontend to backend.',
      'How do you prevent XSS and CSRF attacks?',
      'What is the difference between SSR, SSG, and CSR?',
    ],
    hard: [
      'Design a complete SaaS architecture with auth, billing, and multi-tenancy.',
      'How would you implement real-time features (WebSockets vs SSE vs Polling)?',
    ],
  },

  dsa: {
    easy: [
      'What is Big O notation? Give examples of O(1), O(n), O(n²).',
      'What is the difference between an Array and a Linked List?',
      'Explain what a Stack and a Queue are with examples.',
    ],
    medium: [
      'Explain BFS vs DFS with use cases and time complexity.',
      'What is dynamic programming? Give an example with explanation.',
      'Explain binary search and when to use it.',
      'How does a hash map work internally?',
    ],
    hard: [
      "Explain Dijkstra's algorithm and its time complexity.",
      'Solve: Find the longest palindromic substring. Explain your approach.',
      'Design an LRU Cache with O(1) get and put operations.',
    ],
  },

  amazon: {
    easy: [
      'Tell me about a time you demonstrated customer obsession.',
      'What does "Think Big" mean to you?',
    ],
    medium: [
      'Tell me about a time you made a data-driven decision under uncertainty.',
      'Describe a time you had to earn trust from a skeptical stakeholder.',
      'Tell me about a time you delivered results under resource constraints.',
    ],
    hard: [
      "Design Amazon's product recommendation system at scale.",
      'Design a scalable checkout and payment processing system.',
      'How would you handle a critical production outage with millions of affected users?',
    ],
  },

  system_design: {
    easy: [
      'What is vertical vs horizontal scaling?',
      'Explain Load Balancing and its algorithms.',
    ],
    medium: [
      'Design a URL shortener like bit.ly.',
      'Design a notification system that sends emails, SMS, and push notifications.',
      'How would you design a rate limiter?',
    ],
    hard: [
      'Design Twitter/X at scale — timelines, tweets, follows.',
      'Design a distributed file storage system like Amazon S3.',
      'Design a real-time collaborative document editor like Google Docs.',
    ],
  },

  // Additional categories with fallback
  technical: {
    easy:   ['What is the difference between HTML, CSS, and JavaScript?', 'What is a REST API?', 'What is Git and why is it used?'],
    medium: ['Explain the Node.js event loop.', 'What is JWT authentication?', 'Explain database indexing.'],
    hard:   ['Design a scalable backend system.', 'How would you architect a large React application?'],
  },

  behavioral: {
    easy:   ['Tell me about yourself.', 'Why do you want this job?'],
    medium: ['Describe a time you resolved a conflict.', 'Tell me about a failure and what you learned.'],
    hard:   ['How would you handle a disagreement with your manager?', 'Describe a time you led without authority.'],
  },

  google: {
    easy:   ['Tell me about a project you are most proud of.', 'How do you stay updated with new technologies?'],
    medium: ['Explain how you would design a search autocomplete system.', 'How do you handle ambiguous requirements?'],
    hard:   ['Design a distributed cache system.', 'How would you improve Google Search ranking?'],
  },
};

/* ════════════════════════════════════════════════════════════════════
   PICK QUESTIONS
   ════════════════════════════════════════════════════════════════════ */

const pickQuestions = (role, difficulty, count) => {
  const normalised = (role || 'backend').toLowerCase().replace(/[^a-z_]/g, '');
  const pool = QB[normalised]?.[difficulty] || QB.backend[difficulty] || QB.backend.medium;
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

/* ════════════════════════════════════════════════════════════════════
   AI EVALUATION  —  RAG first, AI second, rule-based fallback
   ════════════════════════════════════════════════════════════════════ */

const AI_EVAL_PROMPT = (qaList, jobRole) => `
You are an expert technical interviewer evaluating a candidate for a "${jobRole}" role.

Evaluate each answer below on a scale of 0–100 and return ONLY a single valid JSON object. No markdown, no explanation outside the JSON.

INTERVIEW TRANSCRIPT:
${qaList.map((q, i) => `
Q${i + 1}: ${q.question}
Candidate Answer: ${q.answer || '(no answer provided)'}
`).join('\n')}

Return this EXACT JSON structure:
{
  "overallScore": <0-100 number>,
  "communication": <0-100 number>,
  "confidence": <0-100 number>,
  "answerQuality": <0-100 number>,
  "posture": 60,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "summary": "<2-3 sentence honest assessment>",
  "perQuestionFeedback": [
    ${qaList.map((_, i) => `{
      "questionIndex": ${i},
      "score": <0-100>,
      "feedback": "<specific feedback for Q${i + 1}>",
      "matchedConcepts": ["<concept>"],
      "missingConcepts": ["<concept>"],
      "suggestions": ["<improvement>"]
    }`).join(',\n    ')}
  ]
}
`.trim();

const evaluateWithAI = async (qaList, jobRole, postureData = {}) => {
  // 1. Try RAG evaluation first (always works, no API needed)
  const ragResult = ragEvaluateSession(qaList, jobRole, postureData);

  // 2. Try AI evaluation if key is available
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.length < 20 || apiKey === 'your_openrouter_api_key_here') {
    console.log('[Interview] No valid API key → using RAG evaluation');
    return ragResult;
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert technical interview evaluator. You ALWAYS respond with valid JSON only. Never add markdown code fences or extra text.',
          },
          { role: 'user', content: AI_EVAL_PROMPT(qaList, jobRole) },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      },
      {
        headers: {
          Authorization:  `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title':      'HireMind AI',
        },
        timeout: 50000,
      }
    );

    const raw     = response.data?.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
    const match   = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('AI returned no parseable JSON');

    const parsed = JSON.parse(match[0]);

    // Merge real posture data
    parsed.posture    = Math.round(((postureData?.posture ?? 60) + (postureData?.eyeContact ?? 55)) / 2);
    parsed.confidence = postureData?.confidence ?? parsed.confidence ?? 65;
    parsed.aiEvaluated = true;
    parsed.ragEvaluated = false;

    // Merge RAG concept data into per-question feedback
    if (Array.isArray(parsed.perQuestionFeedback) && Array.isArray(ragResult.perQuestionFeedback)) {
      parsed.perQuestionFeedback = parsed.perQuestionFeedback.map((q, i) => ({
        ...q,
        matchedConcepts: ragResult.perQuestionFeedback[i]?.matchedConcepts || [],
        missingConcepts: ragResult.perQuestionFeedback[i]?.missingConcepts || [],
        ragUsed:         ragResult.perQuestionFeedback[i]?.ragUsed || false,
        score: Math.max(0, Math.min(100, Math.round(q.score ?? 0))),
      }));
    }

    // Also add overall concept data from RAG
    parsed.matchedConcepts = ragResult.matchedConcepts || [];
    parsed.missingConcepts = ragResult.missingConcepts || [];

    // Clamp scores
    ['overallScore', 'communication', 'confidence', 'answerQuality', 'posture'].forEach(k => {
      if (typeof parsed[k] === 'number') {
        parsed[k] = Math.max(0, Math.min(100, Math.round(parsed[k])));
      }
    });

    return parsed;

  } catch (err) {
    console.warn('[Interview] AI evaluation failed → using RAG evaluation.', err.message);
    return ragResult;
  }
};

/* ════════════════════════════════════════════════════════════════════
   HELPER — update user stats (running weighted average) + usage
   ════════════════════════════════════════════════════════════════════ */

const updateUserStats = async (userId, evaluation, userDoc = null) => {
  try {
    const user = userDoc || await User.findById(userId);
    if (!user) return;

    const prev  = user.stats.totalInterviews || 0;
    const total = prev + 1;

    const wa = (field, newVal) =>
      Math.round(((user.stats[field] || 0) * prev + newVal) / total);

    user.stats.totalInterviews  = total;
    user.stats.avgScore         = wa('avgScore',        evaluation.overallScore  ?? 0);
    user.stats.avgCommunication = wa('avgCommunication', evaluation.communication ?? 0);
    user.stats.avgConfidence    = wa('avgConfidence',    evaluation.confidence    ?? 0);
    user.stats.avgAnswerQuality = wa('avgAnswerQuality', evaluation.answerQuality ?? 0);
    user.stats.avgPosture       = wa('avgPosture',       evaluation.posture       ?? 0);
    user.stats.bestScore        = Math.max(user.stats.bestScore || 0, evaluation.overallScore ?? 0);
    user.stats.lastPracticed    = new Date();

    // Increment daily usage counter
    user.dailyUsage.interviews = (user.dailyUsage.interviews || 0) + 1;

    await user.save();
  } catch (statsErr) {
    console.error('[Interview] Failed to update user stats:', statsErr.message);
  }
};

/* ════════════════════════════════════════════════════════════════════
   CONTROLLERS
   ════════════════════════════════════════════════════════════════════ */

/**
 * GET /api/interviews/questions?role=backend&difficulty=medium&count=5
 */
const getInterviewQuestions = async (req, res) => {
  try {
    const { role = 'backend', difficulty = 'medium', count = '5' } = req.query;

    const parsedCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 20);
    const questions   = pickQuestions(role, difficulty, parsedCount);

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: `No questions found for role "${role}" at difficulty "${difficulty}". Try: hr, frontend, backend, fullstack, dsa, amazon, system_design`,
      });
    }

    res.json({ success: true, questions, count: questions.length });
  } catch (err) {
    console.error('[getInterviewQuestions] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
  }
};

/**
 * POST /api/interviews
 * Body: { jobRole, difficulty, questions[], answers[], postureData, duration, ... }
 */
const saveInterviewSession = async (req, res) => {
  try {
    const {
      jobRole       = 'General',
      difficulty    = 'medium',
      questions     = [],
      answers       = [],
      postureData   = {},
      duration      = 0,
      tabSwitches   = 0,
      cheatingEvents = [],
      status        = 'completed',
      category      = 'general',
      aiCharacter   = 'shubham',
    } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one question is required.' });
    }

    const qaList = questions.map((q, i) => ({
      question: typeof q === 'string' ? q : q.question || '',
      answer:   (answers[i] || '').toString().trim(),
    }));

    // ── RAG + AI Evaluation ──────────────────────────────────────────
    const evaluation = await evaluateWithAI(qaList, jobRole, postureData);

    // ── Persist session ──────────────────────────────────────────────
    const session = await InterviewSession.create({
      user:       req.user._id,
      jobRole,
      category,
      difficulty,
      aiCharacter,
      questions:  qaList,
      feedback: {
        communication:  evaluation.communication  ?? 60,
        confidence:     evaluation.confidence     ?? 60,
        answerQuality:  evaluation.answerQuality  ?? 60,
        posture:        evaluation.posture        ?? 60,
        overallScore:   evaluation.overallScore   ?? 60,
        suggestions:    evaluation.suggestions    ?? [],
        strengths:      evaluation.strengths      ?? [],
        summary:        evaluation.summary        ?? '',
        aiEvaluated:    evaluation.aiEvaluated    ?? false,
        ragEvaluated:   evaluation.ragEvaluated   ?? false,
        matchedConcepts: evaluation.matchedConcepts ?? [],
        missingConcepts: evaluation.missingConcepts ?? [],
      },
      duration,
      tabSwitches,
      cheatingEvents,
      status,
    });

    // ── Update stats + usage (uses userDoc from limiter if available) ──
    await updateUserStats(req.user._id, evaluation, req.userDoc || null);

    res.status(201).json({
      success: true,
      session,
      evaluation,
      message: 'Interview session saved successfully.',
    });
  } catch (err) {
    console.error('[saveInterviewSession] Error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to save interview session.' });
  }
};

/**
 * GET /api/interviews — fetch all sessions (paginated)
 */
const getUserSessions = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const skip  = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      InterviewSession.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InterviewSession.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      sessions,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[getUserSessions] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch sessions.' });
  }
};

/**
 * GET /api/interviews/:id
 */
const getSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({
      _id:  req.params.id,
      user: req.user._id,
    }).lean();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or access denied.' });
    }

    res.json({ success: true, session });
  } catch (err) {
    console.error('[getSession] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch session.' });
  }
};

/**
 * DELETE /api/interviews/:id
 */
const deleteSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOneAndDelete({
      _id:  req.params.id,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or access denied.' });
    }

    res.json({ success: true, message: 'Session deleted.' });
  } catch (err) {
    console.error('[deleteSession] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete session.' });
  }
};

/**
 * GET /api/interviews/available-roles
 */
const getAvailableRoles = (req, res) => {
  try {
    const roles = Object.entries(QB).map(([role, diffs]) => ({
      role,
      difficulties: Object.keys(diffs),
      questionCounts: Object.fromEntries(
        Object.entries(diffs).map(([d, qs]) => [d, qs.length])
      ),
    }));
    res.json({ success: true, roles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getInterviewQuestions,
  saveInterviewSession,
  getUserSessions,
  getSession,
  deleteSession,
  getAvailableRoles,
};
