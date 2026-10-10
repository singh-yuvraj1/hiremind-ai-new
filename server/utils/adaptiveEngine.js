/**
 * server/utils/adaptiveEngine.js — HireMind AI
 * Adaptive Difficulty & Assessment Flow Progression Engine
 */

const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

/**
 * Computes next adaptive difficulty based on assessment type and recent performance.
 *
 * @param {string} currentDifficulty - 'easy' | 'medium' | 'hard'
 * @param {Object} performanceMetrics - { score: 0-100, testCasesPassedPct?: number, isObjective?: boolean }
 * @param {string} roundType - 'tech_fundamentals' | 'dsa_coding' | 'hr_intro' | etc.
 * @returns {string} - 'easy' | 'medium' | 'hard'
 */
function getNextDifficulty(currentDifficulty = 'medium', performanceMetrics = {}, roundType = 'tech_fundamentals') {
  // Fixed difficulty rounds (e.g. basic HR screening or baseline placement test) don't oscillate wildly
  if (roundType === 'hr_intro') {
    return currentDifficulty;
  }

  const currentIndex = DIFFICULTY_LEVELS.indexOf(currentDifficulty.toLowerCase());
  const validIndex = currentIndex >= 0 ? currentIndex : 1; // Default to 'medium'

  let score = typeof performanceMetrics.score === 'number' ? performanceMetrics.score : 70;

  // If DSA round, weigh test cases heavily
  if (roundType === 'dsa_coding' && typeof performanceMetrics.testCasesPassedPct === 'number') {
    score = performanceMetrics.testCasesPassedPct * 100;
  }

  // Adaptive threshold transitions
  if (score >= 80) {
    // Step up difficulty if not already at highest
    const nextIndex = Math.min(DIFFICULTY_LEVELS.length - 1, validIndex + 1);
    return DIFFICULTY_LEVELS[nextIndex];
  } else if (score < 50) {
    // Step down difficulty if struggling
    const nextIndex = Math.max(0, validIndex - 1);
    return DIFFICULTY_LEVELS[nextIndex];
  }

  // Maintain current difficulty level for balanced confidence
  return DIFFICULTY_LEVELS[validIndex];
}

/**
 * Calculates adaptive trajectory summary for post-interview analytics
 *
 * @param {Array} perQuestionFeedback - Array of question results with scores & difficulty
 * @returns {Object} - { initialDifficulty, finalDifficulty, peakDifficulty, adaptabilityScore }
 */
function analyzeAdaptiveTrajectory(perQuestionFeedback = []) {
  if (!Array.isArray(perQuestionFeedback) || perQuestionFeedback.length === 0) {
    return {
      initialDifficulty: 'medium',
      finalDifficulty:   'medium',
      peakDifficulty:    'medium',
      adaptabilityScore: 70,
    };
  }

  const difficulties = perQuestionFeedback.map(q => q.difficulty || 'medium');
  const scores       = perQuestionFeedback.map(q => typeof q.score === 'number' ? q.score : 70);

  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const initialDifficulty = difficulties[0];
  const finalDifficulty   = difficulties[difficulties.length - 1];

  let peakDifficulty = 'easy';
  if (difficulties.includes('hard')) peakDifficulty = 'hard';
  else if (difficulties.includes('medium')) peakDifficulty = 'medium';

  return {
    initialDifficulty,
    finalDifficulty,
    peakDifficulty,
    adaptabilityScore: Math.round(avgScore),
  };
}

module.exports = {
  DIFFICULTY_LEVELS,
  getNextDifficulty,
  analyzeAdaptiveTrajectory,
};
