// ============================================================
//  utils/aiEvaluator.js  —  HireMind AI
//  Reusable AI evaluation engine with structured prompt,
//  safe JSON parsing, and intelligent rule-based fallback.
// ============================================================

const axios = require('axios');

/* ──────────────────────────────────────────────────────────
   CONSTANTS
────────────────────────────────────────────────────────── */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL          = 'mistralai/mistral-7b-instruct:free';
const TIMEOUT_MS     = 50000;

const TECH_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'golang', 'rust',
  'react', 'vue', 'angular', 'node', 'express', 'fastapi', 'django',
  'database', 'api', 'rest', 'graphql', 'grpc',
  'algorithm', 'data structure', 'complexity',
  'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'elasticsearch',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform',
  'microservice', 'event-driven', 'cqrs', 'message queue', 'kafka',
  'cache', 'cdn', 'load balancer', 'rate limit', 'circuit breaker',
  'authentication', 'jwt', 'oauth', 'encryption', 'ssl', 'tls',
  'cicd', 'devops', 'git', 'testing', 'tdd', 'agile', 'scrum',
  'index', 'sharding', 'replication', 'consensus', 'raft', 'paxos',
];

const STRUCTURE_INDICATORS = [
  'first', 'second', 'third', 'finally', 'in conclusion', 'to summarize',
  'step', 'because', 'therefore', 'as a result', 'for example',
  'for instance', 'such as', 'specifically', 'in my experience',
  'at my previous', 'we built', 'i implemented', 'i designed', 'the reason is',
];

/* ──────────────────────────────────────────────────────────
   RULE-BASED SCORING  (fast, no external API needed)
────────────────────────────────────────────────────────── */

/**
 * Score a single answer deterministically.
 * @param {string} question
 * @param {string} answer
 * @returns {{ score: number, feedback: string, strengths: string[], weaknesses: string[], suggestions: string[] }}
 */
const scoreAnswer = (question, answer) => {
  const ans  = (answer || '').trim();
  const aLow = ans.toLowerCase();
  const wc   = ans.split(/\s+/).filter(Boolean).length;

  const strengths   = [];
  const weaknesses  = [];
  const suggestions = [];

  // Empty / too short
  if (wc === 0)  return { score: 0,  feedback: 'No answer provided.',      strengths, weaknesses: ['No answer provided'],        suggestions: ['Provide a meaningful answer'] };
  if (wc < 4)    return { score: 5,  feedback: 'Answer is far too brief.', strengths, weaknesses: ['Extremely short answer'],     suggestions: ['Write at least 2–3 sentences'] };
  if (wc < 10)   return { score: 15, feedback: 'Too short.',               strengths, weaknesses: ['Answer lacks depth'],         suggestions: ['Expand with explanation and examples'] };

  // Signals
  const techHits    = TECH_KEYWORDS.filter((k) => aLow.includes(k)).length;
  const hasStructure = STRUCTURE_INDICATORS.some((s) => aLow.includes(s));
  const hasExample   = /for example|for instance|such as|in my|at my|we built|i built|i implemented|i once|once i|when i|there was a time/.test(aLow);
  const hasMetrics   = /\d+%|\d+ (times|seconds|ms|days|users|requests|million|thousand)/.test(aLow);

  let score = 0;

  if (wc < 30)       score = 25;
  else if (wc < 60)  score = 40;
  else if (wc < 100) score = 55;
  else if (wc < 150) score = 65;
  else               score = 72;

  // Bonuses
  if (techHits >= 1) { score += Math.min(techHits * 3, 12); strengths.push(`Uses ${techHits} relevant technical term${techHits > 1 ? 's' : ''}`); }
  if (hasStructure)  { score += 6;  strengths.push('Well-structured and logical flow'); }
  if (hasExample)    { score += 7;  strengths.push('Includes a concrete real-world example'); }
  if (hasMetrics)    { score += 5;  strengths.push('Uses quantified metrics / numbers'); }

  // Penalties / suggestions
  if (wc < 60)         { weaknesses.push('Answer is too brief for this topic'); suggestions.push('Add more depth — aim for 80–120 words'); }
  if (!hasExample)     { weaknesses.push('Missing real-world example');          suggestions.push('Use STAR method: Situation, Task, Action, Result'); }
  if (!hasStructure)   {                                                          suggestions.push('Structure your answer: state the concept, explain why, give example'); }
  if (techHits === 0)  { weaknesses.push('No technical terminology used');       suggestions.push('Include relevant technical terms to demonstrate expertise'); }

  score = Math.max(0, Math.min(100, Math.round(score)));
  const feedback = score >= 80 ? 'Excellent answer.' : score >= 65 ? 'Strong answer.' : score >= 45 ? 'Good attempt — needs more depth.' : 'Needs significant improvement.';

  return { score, feedback, strengths, weaknesses, suggestions };
};

/**
 * Rule-based evaluation of a full Q&A list.
 * @param {Array<{question: string, answer: string}>} qaList
 * @param {{ confidence?: number, posture?: number, eyeContact?: number }} postureData
 * @returns {object} Full evaluation result
 */
const ruleBasedEvaluation = (qaList, postureData = {}) => {
  const perQ = qaList.map(({ question, answer }) => scoreAnswer(question, answer));

  const avg = perQ.length
    ? Math.round(perQ.reduce((sum, q) => sum + q.score, 0) / perQ.length)
    : 0;

  const allStrengths   = [...new Set(perQ.flatMap((q) => q.strengths))].slice(0, 5);
  const allWeaknesses  = [...new Set(perQ.flatMap((q) => q.weaknesses))].slice(0, 4);
  const allSuggestions = [...new Set(perQ.flatMap((q) => q.suggestions))].slice(0, 4);

  if (!allStrengths.length)   allStrengths.push('Completed all interview questions');
  if (!allSuggestions.length) allSuggestions.push('Practice using the STAR method for behavioral questions');

  const summaryText = avg >= 80
    ? `Outstanding performance (${avg}/100)! You demonstrated strong technical knowledge with clear, structured responses.`
    : avg >= 65
      ? `Good performance (${avg}/100). You showed solid understanding but can improve depth and use of real examples.`
      : avg >= 45
        ? `Decent attempt (${avg}/100). Focus on structuring answers and adding concrete technical examples.`
        : `Keep practising (${avg}/100). Work on expanding answers, using technical terminology, and the STAR method.`;

  return {
    overallScore:          avg,
    communication:         Math.min(100, Math.round(avg * 0.85 + 12)),
    confidence:            Math.min(100, postureData.confidence   ?? 62),
    answerQuality:         avg,
    posture:               Math.min(100, Math.round(((postureData.posture ?? 60) + (postureData.eyeContact ?? 55)) / 2)),
    strengths:             allStrengths,
    weaknesses:            allWeaknesses,
    suggestions:           allSuggestions,
    aiEvaluated:           false,
    summary:               summaryText,
    perQuestionFeedback:   perQ.map((q, i) => ({ questionIndex: i, ...q })),
  };
};

/* ──────────────────────────────────────────────────────────
   AI PROMPT BUILDER
────────────────────────────────────────────────────────── */

const buildPrompt = (qaList, jobRole) => `
You are a senior technical interviewer evaluating a job candidate for a "${jobRole}" role.
Evaluate every answer critically and return ONLY a single valid JSON object — no markdown fences, no extra text.

INTERVIEW TRANSCRIPT:
${qaList.map((q, i) => `\nQ${i + 1}: ${q.question}\nCandidate Answer: ${q.answer || '(no answer provided)'}`).join('\n')}

RETURN THIS EXACT JSON (fill every field — DO NOT skip any):
{
  "overallScore": <integer 0-100>,
  "communication": <integer 0-100>,
  "confidence": <integer 0-100>,
  "answerQuality": <integer 0-100>,
  "posture": 60,
  "strengths": ["<strength_1>", "<strength_2>", "<strength_3>"],
  "weaknesses": ["<weakness_1>", "<weakness_2>"],
  "suggestions": ["<suggestion_1>", "<suggestion_2>", "<suggestion_3>"],
  "summary": "<2–3 sentence honest, specific assessment>",
  "perQuestionFeedback": [
    ${qaList.map((_, i) => `{
      "questionIndex": ${i},
      "score": <0-100>,
      "feedback": "<50-word specific feedback for Q${i + 1}>",
      "strengths": ["<one strength>"],
      "weaknesses": ["<one weakness>"],
      "suggestions": ["<one actionable improvement>"]
    }`).join(',\n    ')}
  ]
}
`.trim();

/* ──────────────────────────────────────────────────────────
   MAIN EXPORTED FUNCTION
────────────────────────────────────────────────────────── */

/**
 * Evaluate a list of Q&A pairs using AI (with rule-based fallback).
 *
 * @param {Array<{question: string, answer: string}>} qaList
 * @param {string} jobRole
 * @param {{ confidence?: number, posture?: number, eyeContact?: number }} [postureData]
 * @returns {Promise<object>} Evaluation result
 */
const evaluateInterview = async (qaList, jobRole = 'General', postureData = {}) => {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.length < 20 || apiKey === 'your_openrouter_api_key_here') {
    console.log('[aiEvaluator] No API key — using rule-based evaluation.');
    return ruleBasedEvaluation(qaList, postureData);
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model:    MODEL,
        messages: [
          {
            role:    'system',
            content: 'You are an expert technical interview evaluator. Respond with valid JSON only. Never include markdown code fences or any text outside the JSON object.',
          },
          {
            role:    'user',
            content: buildPrompt(qaList, jobRole),
          },
        ],
        temperature: 0.1,
        max_tokens:  2500,
      },
      {
        headers: {
          Authorization:  `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer':  process.env.CLIENT_URL || 'http://localhost:5000',
          'X-Title':       'HireMind AI',
        },
        timeout: TIMEOUT_MS,
      }
    );

    const raw     = response.data?.choices?.[0]?.message?.content || '';
    const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
    const match   = cleaned.match(/\{[\s\S]*\}/);

    if (!match) throw new Error('AI response contained no parseable JSON');

    const parsed = JSON.parse(match[0]);

    // Merge real posture sensor data (override AI guess)
    parsed.posture    = Math.min(100, Math.round(((postureData.posture ?? 60) + (postureData.eyeContact ?? 55)) / 2));
    parsed.confidence = Math.min(100, postureData.confidence ?? parsed.confidence ?? 65);

    // Clamp all scores
    ['overallScore', 'communication', 'answerQuality', 'posture', 'confidence'].forEach((k) => {
      if (typeof parsed[k] === 'number') {
        parsed[k] = Math.max(0, Math.min(100, Math.round(parsed[k])));
      }
    });

    if (Array.isArray(parsed.perQuestionFeedback)) {
      parsed.perQuestionFeedback = parsed.perQuestionFeedback.map((q) => ({
        ...q,
        score: Math.max(0, Math.min(100, Math.round(q.score ?? 0))),
      }));
    }

    parsed.aiEvaluated = true;
    console.log(`[aiEvaluator] AI evaluation complete. overallScore=${parsed.overallScore}`);
    return parsed;

  } catch (err) {
    console.warn('[aiEvaluator] AI call failed → falling back to rule-based.', err.message);
    return ruleBasedEvaluation(qaList, postureData);
  }
};

module.exports = { evaluateInterview, ruleBasedEvaluation, scoreAnswer };
