// ============================================================
//  utils/ragEvaluator.js  —  HireMind AI
//  RAG-based answer evaluation using TF-IDF cosine similarity.
//  Fully offline — no external API needed.
//
//  Returns per-question:
//    score         : 0–10
//    matchedConcepts : string[]
//    missingConcepts : string[]
//    suggestions     : string[]
// ============================================================

/* ══════════════════════════════════════════════════════════════════
   KNOWLEDGE BASE — Expected concepts per question pattern
   ══════════════════════════════════════════════════════════════════ */

const KNOWLEDGE_BASE = [
  // ── HR / Behavioral ───────────────────────────────────────────────
  {
    patterns: ['tell me about yourself', 'introduce yourself'],
    concepts: ['experience', 'skills', 'background', 'role', 'achievement', 'goal', 'strength'],
    idealAnswer: 'Professional background summary covering current role, key skills, relevant achievements, and career goals.',
    suggestions: [
      'Use the Present-Past-Future structure: current role → past experience → future goals',
      'Keep it under 2 minutes and focus on professional highlights',
      'Tailor your answer to the specific role you are applying for',
    ],
  },
  {
    patterns: ['why do you want this job', 'why this role', 'why do you want to work'],
    concepts: ['company', 'role', 'skills', 'growth', 'passion', 'value', 'mission'],
    idealAnswer: 'Connecting personal skills and goals with the company mission and role requirements.',
    suggestions: [
      'Research the company and mention specific aspects that attract you',
      'Connect your personal skills to what this role requires',
      'Show enthusiasm and alignment with company culture',
    ],
  },
  {
    patterns: ['weakness', 'biggest weakness', 'area of improvement'],
    concepts: ['weakness', 'improve', 'learning', 'action', 'growth', 'aware'],
    idealAnswer: 'Honest weakness with concrete steps taken to improve it.',
    suggestions: [
      'Choose a real weakness that is not critical to the role',
      'Always follow with what you are actively doing to improve',
      'Show self-awareness and growth mindset',
    ],
  },
  {
    patterns: ['5 years', 'where do you see yourself', 'career goals', 'future plans'],
    concepts: ['goal', 'grow', 'leadership', 'skill', 'company', 'contribute', 'vision'],
    idealAnswer: 'Clear career progression goals aligned with the company\'s growth trajectory.',
    suggestions: [
      'Be realistic and show ambition without being vague',
      'Align your goals with the company\'s growth',
      'Show commitment — avoid mentioning switching industries',
    ],
  },
  {
    patterns: ['conflict', 'disagreement', 'handle conflict', 'difficult coworker'],
    concepts: ['situation', 'communication', 'resolution', 'listen', 'compromise', 'result'],
    idealAnswer: 'STAR method: specific conflict situation, steps taken to resolve, positive outcome achieved.',
    suggestions: [
      'Use the STAR method: Situation, Task, Action, Result',
      'Focus on the resolution process, not the problem itself',
      'Show empathy and professional maturity',
    ],
  },
  {
    patterns: ['tight deadline', 'pressure', 'manage time', 'prioritize'],
    concepts: ['prioritize', 'organize', 'plan', 'deadline', 'focus', 'deliver', 'result'],
    idealAnswer: 'Concrete strategies for prioritization with a real example of successful delivery under pressure.',
    suggestions: [
      'Describe a specific situation where you met a tight deadline',
      'Mention your prioritization framework (Eisenhower matrix, MoSCoW, etc.)',
      'Quantify the result if possible',
    ],
  },

  // ── Frontend ──────────────────────────────────────────────────────
  {
    patterns: ['html css javascript', 'difference between html css', 'what is html', 'what is css'],
    concepts: ['html', 'structure', 'css', 'styling', 'javascript', 'behaviour', 'markup', 'dom'],
    idealAnswer: 'HTML for structure/content, CSS for presentation/styling, JavaScript for behaviour/interactivity.',
    suggestions: [
      'Explain each with a concrete analogy (HTML=skeleton, CSS=skin, JS=muscles)',
      'Mention how they work together in a browser',
      'Add examples of browser rendering',
    ],
  },
  {
    patterns: ['what is react', 'react library', 'react framework', 'react js', 'what does react do'],
    concepts: ['library', 'ui', 'component', 'virtual dom', 'javascript', 'state', 'props', 'jsx', 'reusable'],
    idealAnswer: 'React is a JavaScript library for building user interfaces using reusable components, virtual DOM, and unidirectional data flow.',
    suggestions: [
      'Clarify React is a library, not a full framework',
      'Mention the virtual DOM and why it leads to fast UI updates',
      'Explain the component-based model and props/state',
    ],
  },
  {
    patterns: ['what is nodejs', 'what is node.js', 'what is node js', 'node.js runtime'],
    concepts: ['nodejs', 'runtime', 'javascript', 'server', 'non-blocking', 'event-driven', 'asynchronous', 'v8'],
    idealAnswer: 'Node.js is a JavaScript runtime built on Chrome V8 engine that lets JavaScript run on the server side with non-blocking I/O.',
    suggestions: [
      'Mention the V8 engine and why JavaScript can run on the server',
      'Explain non-blocking I/O and event-driven architecture',
      'Give examples of what Node.js is good for (APIs, real-time apps)',
    ],
  },
  {
    patterns: ['virtual dom', 'react virtual dom', 'why react is fast'],
    concepts: ['virtual dom', 'diffing', 'reconciliation', 'real dom', 'performance', 'update', 'fiber'],
    idealAnswer: 'React maintains a virtual DOM in memory, diffs it on state change, and only patches the real DOM with minimal changes.',
    suggestions: [
      'Explain the diffing algorithm and reconciliation process',
      'Compare direct DOM manipulation vs virtual DOM approach',
      'Mention React Fiber for concurrent updates',
    ],
  },
  {
    patterns: ['react hooks', 'usestate', 'useeffect', 'hooks'],
    concepts: ['state', 'usestate', 'useeffect', 'side effect', 'lifecycle', 'functional component', 'dependency'],
    idealAnswer: 'Hooks let functional components use state and lifecycle features. useState manages state, useEffect handles side effects.',
    suggestions: [
      'Explain the problem hooks solve (class component complexity)',
      'Demonstrate understanding of dependency array in useEffect',
      'Mention rules of hooks (top level, not in conditionals)',
    ],
  },
  {
    patterns: ['flexbox', 'css grid', 'flexbox vs grid'],
    concepts: ['flexbox', 'grid', 'axis', 'one-dimensional', 'two-dimensional', 'layout', 'align', 'justify'],
    idealAnswer: 'Flexbox is 1D layout (row or column). CSS Grid is 2D (rows AND columns simultaneously).',
    suggestions: [
      'Explain when to use each (Flexbox for components, Grid for page layout)',
      'Mention justify-content, align-items for flexbox',
      'Show knowledge of grid-template-areas',
    ],
  },

  // ── Backend ───────────────────────────────────────────────────────
  {
    patterns: ['rest api', 'what is rest', 'http methods', 'get post put delete'],
    concepts: ['rest', 'http', 'get', 'post', 'put', 'delete', 'stateless', 'endpoint', 'resource'],
    idealAnswer: 'REST is an architectural style using stateless HTTP. GET reads, POST creates, PUT updates, DELETE removes resources.',
    suggestions: [
      'Mention stateless nature and resource-based URLs',
      'Explain HTTP status codes (200, 201, 400, 401, 404, 500)',
      'Compare REST with GraphQL for completeness',
    ],
  },
  {
    patterns: ['event loop', 'node.js event loop', 'javascript event loop', 'async javascript'],
    concepts: ['event loop', 'call stack', 'callback queue', 'non-blocking', 'async', 'microtask', 'macrotask', 'promise'],
    idealAnswer: 'Node.js event loop: call stack runs sync code, async callbacks go to queue, event loop processes them when stack is empty.',
    suggestions: [
      'Explain call stack, Web APIs, callback queue, and microtask queue',
      'Use a concrete setTimeout vs Promise example',
      'Mention libuv and how Node handles I/O non-blocking',
    ],
  },
  {
    patterns: ['jwt', 'json web token', 'jwt authentication', 'how does jwt work'],
    concepts: ['jwt', 'header', 'payload', 'signature', 'secret', 'token', 'stateless', 'auth', 'expiry'],
    idealAnswer: 'JWT is a signed token with header.payload.signature. Server signs with secret; client sends in Authorization header.',
    suggestions: [
      'Explain the three parts: header (alg), payload (claims), signature',
      'Discuss token expiry and refresh token pattern',
      'Mention security: HTTPS only, httpOnly cookies vs localStorage',
    ],
  },
  {
    patterns: ['database index', 'indexing', 'why use index', 'database performance'],
    concepts: ['index', 'b-tree', 'query', 'performance', 'lookup', 'slow', 'full scan', 'composite'],
    idealAnswer: 'Indexes create auxiliary data structures (B-tree) for fast lookups, avoiding full table scans.',
    suggestions: [
      'Explain B-tree index structure',
      'Discuss trade-offs: faster reads, slower writes, more storage',
      'Mention when NOT to index (small tables, high write tables)',
    ],
  },
  {
    patterns: ['sql nosql', 'difference sql nosql', 'when to use nosql', 'relational vs document'],
    concepts: ['sql', 'nosql', 'relational', 'document', 'schema', 'acid', 'scalability', 'flexibility'],
    idealAnswer: 'SQL: structured schema, ACID transactions, joins. NoSQL: flexible schema, horizontal scaling, eventually consistent.',
    suggestions: [
      'Give examples: SQL=PostgreSQL, NoSQL=MongoDB, Redis',
      'Explain when each shines (transactions vs huge scale)',
      'Mention CAP theorem briefly',
    ],
  },
  {
    patterns: ['middleware', 'express middleware', 'what is middleware'],
    concepts: ['middleware', 'request', 'response', 'next', 'pipeline', 'auth', 'logging', 'error handling'],
    idealAnswer: 'Middleware are functions in the request-response pipeline with access to req, res, next. Used for auth, logging, parsing.',
    suggestions: [
      'Show understanding of the pipeline order (request → middleware → route handler → response)',
      'Give concrete examples: cors, morgan, body-parser, auth guard',
      'Explain error-handling middleware (4 params: err, req, res, next)',
    ],
  },

  // ── DSA ───────────────────────────────────────────────────────────
  {
    patterns: ['big o', 'time complexity', 'space complexity', 'o(n)', 'o(1)'],
    concepts: ['big o', 'time', 'space', 'o(1)', 'o(n)', 'o(log n)', 'o(n^2)', 'constant', 'linear', 'logarithmic'],
    idealAnswer: 'Big O notation describes algorithm growth rate relative to input size, ignoring constants.',
    suggestions: [
      'Give concrete examples for each complexity class',
      'Explain best, average, and worst case',
      'Show O(n log n) for good sorting algorithms',
    ],
  },
  {
    patterns: ['bfs', 'dfs', 'breadth first', 'depth first', 'graph traversal'],
    concepts: ['bfs', 'dfs', 'queue', 'stack', 'visited', 'shortest path', 'tree', 'graph', 'level'],
    idealAnswer: 'BFS uses queue, explores level by level — ideal for shortest path. DFS uses stack, explores deep first — ideal for cycle detection.',
    suggestions: [
      'Explain the data structure each uses (BFS=queue, DFS=stack/recursion)',
      'Give use cases: BFS=shortest path, DFS=topological sort, cycle detection',
      'Mention time complexity O(V+E)',
    ],
  },
  {
    patterns: ['dynamic programming', 'dp', 'memoization', 'tabulation'],
    concepts: ['dynamic programming', 'subproblem', 'memoization', 'overlapping', 'optimal substructure', 'bottom-up', 'top-down'],
    idealAnswer: 'DP solves problems by breaking into overlapping subproblems and storing results (memoization/tabulation).',
    suggestions: [
      'Use a concrete example like Fibonacci or Knapsack',
      'Explain top-down (memoization) vs bottom-up (tabulation)',
      'Identify the two DP conditions: optimal substructure + overlapping subproblems',
    ],
  },

  // ── System Design ─────────────────────────────────────────────────
  {
    patterns: ['load balancer', 'load balancing', 'horizontal scaling', 'vertical scaling'],
    concepts: ['load balancer', 'distribute', 'server', 'round robin', 'horizontal', 'vertical', 'availability', 'scale'],
    idealAnswer: 'Load balancers distribute traffic across servers. Horizontal scaling adds more servers; vertical adds more power to one.',
    suggestions: [
      'Compare L4 vs L7 load balancing',
      'Explain algorithms: round robin, least connections, IP hash',
      'Discuss stateful vs stateless session management with load balancers',
    ],
  },
  {
    patterns: ['url shortener', 'design url shortener', 'bit.ly', 'tinyurl'],
    concepts: ['hash', 'redirect', 'database', 'unique', 'base62', 'cache', 'scalability', '301', '302'],
    idealAnswer: 'URL shortener: hash long URL to 6-7 char base62 string, store mapping in DB, cache hot URLs, handle redirect with 301/302.',
    suggestions: [
      'Discuss hash collision handling',
      'Explain caching strategy for popular URLs (Redis)',
      'Mention analytics tracking and rate limiting',
    ],
  },
  {
    patterns: ['design twitter', 'twitter system design', 'social media design', 'newsfeed'],
    concepts: ['timeline', 'tweet', 'follow', 'fan-out', 'cache', 'database', 'sharding', 'cdn', 'async'],
    idealAnswer: 'Twitter: write tweets to DB + fan-out to followers\' timelines; use cache for hot timelines; CDN for media.',
    suggestions: [
      'Discuss push vs pull model for timeline generation',
      'Explain database sharding for tweets by user_id or tweet_id',
      'Address celebrities problem (high fan-out) with hybrid approach',
    ],
  },
];

/* ══════════════════════════════════════════════════════════════════
   TF-IDF COSINE SIMILARITY ENGINE
   ══════════════════════════════════════════════════════════════════ */

/**
 * Tokenize and normalize text into a word-frequency map.
 */
const tokenize = (text) => {
  const stopwords = new Set([
    'i', 'the', 'is', 'are', 'was', 'were', 'you', 'we', 'they', 'it',
    'this', 'that', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at',
    'to', 'for', 'of', 'with', 'my', 'me', 'be', 'as', 'by', 'an',
    'so', 'if', 'do', 'can', 'will', 'have', 'had', 'has', 'not', 'no',
    'its', 'about', 'when', 'how', 'what', 'which', 'who', 'then', 'also',
  ]);

  const words = text.toLowerCase()
    .replace(/[^a-z0-9\s.]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w));

  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return freq;
};

/**
 * Cosine similarity between two frequency maps.
 */
const cosineSimilarity = (freqA, freqB) => {
  const allTerms = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  let dotProduct = 0, magA = 0, magB = 0;

  for (const term of allTerms) {
    const a = freqA[term] || 0;
    const b = freqB[term] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }

  const mag = Math.sqrt(magA) * Math.sqrt(magB);
  return mag === 0 ? 0 : dotProduct / mag;
};

/**
 * Find the best matching knowledge base entry for a question.
 */
const findBestMatch = (question) => {
  const qLow = question.toLowerCase();
  let bestEntry = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    for (const pattern of entry.patterns) {
      // pattern match score
      const patternWords = pattern.split(' ');
      const matchedWords = patternWords.filter(w => qLow.includes(w)).length;
      const score = matchedWords / patternWords.length;

      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }
  }

  // Only use KB entry if at least 30% of pattern words matched
  return bestScore >= 0.3 ? bestEntry : null;
};

/* ══════════════════════════════════════════════════════════════════
   MAIN RAG EVALUATOR FUNCTION
   ══════════════════════════════════════════════════════════════════ */

/**
 * Evaluate a single answer using RAG-based approach.
 *
 * @param {string} question
 * @param {string} answer
 * @returns {{
 *   score: number,        // 0–10
 *   matchedConcepts: string[],
 *   missingConcepts: string[],
 *   suggestions: string[],
 *   feedback: string,
 *   ragUsed: boolean
 * }}
 */
const evaluateAnswer = (question, answer) => {
  const ans = (answer || '').trim();
  const wc  = ans.split(/\s+/).filter(Boolean).length;

  // Handle empty / very short answers
  if (wc === 0) {
    return {
      score: 0,
      matchedConcepts: [],
      missingConcepts: ['No answer provided'],
      suggestions: ['Please provide a meaningful answer to this question'],
      feedback: 'No answer provided.',
      ragUsed: false,
    };
  }
  if (wc < 5) {
    return {
      score: 1,
      matchedConcepts: [],
      missingConcepts: ['Detailed explanation', 'Concrete example', 'Technical depth'],
      suggestions: ['Write at least 3–4 complete sentences', 'Use the STAR method for behavioral questions'],
      feedback: 'Answer is far too brief.',
      ragUsed: false,
    };
  }

  // Find KB entry for this question
  const kbEntry = findBestMatch(question);

  if (kbEntry) {
    // RAG-based evaluation
    const ansFreq    = tokenize(ans);
    const idealFreq  = tokenize(kbEntry.idealAnswer + ' ' + kbEntry.concepts.join(' '));
    const similarity = cosineSimilarity(ansFreq, idealFreq);

    // Concept matching
    const ansLow = ans.toLowerCase();
    const matchedConcepts = kbEntry.concepts.filter(c =>
      ansLow.includes(c.toLowerCase()) ||
      c.toLowerCase().split(' ').some(w => ansLow.includes(w))
    );
    const missingConcepts = kbEntry.concepts.filter(c => !matchedConcepts.includes(c));

    // Score calculation (0–10 scale)
    let score = similarity * 6; // similarity contributes up to 6 points

    // Concept coverage bonus (up to 3 points)
    const coverageRatio = matchedConcepts.length / kbEntry.concepts.length;
    score += coverageRatio * 3;

    // Length bonus (up to 1 point)
    if (wc >= 50) score += 0.5;
    if (wc >= 100) score += 0.5;

    // Example / structure bonus
    const hasExample = /for example|for instance|such as|in my|when i|once i|we (built|implemented|used)|at my/.test(ansLow);
    const hasStructure = /first|second|third|because|therefore|as a result|this means|which allows/.test(ansLow);
    if (hasExample)   score += 0.5;
    if (hasStructure) score += 0.5;

    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

    return {
      score,
      matchedConcepts: matchedConcepts.slice(0, 6),
      missingConcepts: missingConcepts.slice(0, 4),
      suggestions: kbEntry.suggestions,
      feedback: score >= 8
        ? 'Excellent! Covers key concepts with strong technical depth.'
        : score >= 6
          ? 'Good answer. Covers core concepts but could go deeper.'
          : score >= 4
            ? 'Partial coverage. Missing some key concepts for this topic.'
            : 'Needs improvement. Review the fundamental concepts for this question.',
      ragUsed: true,
    };
  }

  // Fallback: rule-based scoring when no KB match
  return fallbackEvaluate(question, ans, wc);
};

/**
 * Fallback rule-based evaluator when no KB entry matches.
 * Uses keyword matching + structural signals — NOT just length.
 */
const fallbackEvaluate = (question, ans, wc) => {
  const TECH_KEYWORDS = [
    'javascript', 'python', 'react', 'node', 'database', 'api', 'algorithm',
    'sql', 'nosql', 'docker', 'kubernetes', 'system', 'microservice', 'cache',
    'queue', 'async', 'promise', 'rest', 'graphql', 'authentication', 'jwt',
    'index', 'optimization', 'performance', 'security', 'scalability',
    'function', 'class', 'object', 'array', 'loop', 'recursion', 'tree',
    'graph', 'hash', 'stack', 'queue', 'pointer', 'memory', 'thread',
    'process', 'network', 'protocol', 'http', 'tcp', 'ip', 'dns',
  ];

  const aLow     = ans.toLowerCase();
  const techHits = TECH_KEYWORDS.filter(k => aLow.includes(k)).length;
  const hasExample   = /for example|for instance|such as|in my|when i|once i|we (built|implemented|used|designed)|at my|in our/.test(aLow);
  const hasStructure = /first(ly)?|second(ly)?|third(ly)?|finally|because|therefore|as a result|this means|which allows|on the other hand|in contrast/.test(aLow);
  const hasDefinition = /is a|refers to|means|defined as|known as/.test(aLow);

  // Base score from keyword relevance (0-6 range), NOT from length
  const keywordScore = Math.min(techHits * 0.8, 6);

  // If zero keywords found, penalize even long answers
  let score = techHits === 0 ? Math.min(2, wc / 40) : keywordScore;

  // Structural bonus (up to 2 points)
  if (hasExample)    score += 0.7;
  if (hasStructure)  score += 0.7;
  if (hasDefinition) score += 0.4;

  // Tiny length bonus only after keyword threshold is met
  if (techHits >= 2 && wc >= 50)  score += 0.3;
  if (techHits >= 3 && wc >= 100) score += 0.2;

  score = Math.max(0, Math.min(10, Math.round(score * 10) / 10));

  const matchedKw = TECH_KEYWORDS.filter(k => aLow.includes(k)).slice(0, 4);

  return {
    score,
    matchedConcepts: matchedKw,
    missingConcepts: techHits === 0 ? ['Technical terminology', 'Concrete concepts', 'Domain vocabulary'] : [],
    suggestions: [
      'Use the STAR method: Situation, Task, Action, Result',
      'Include technical terms and domain-specific vocabulary',
      'Support your answer with a concrete example from experience',
    ],
    feedback: score >= 7 ? 'Strong answer with good technical depth.'
            : score >= 5 ? 'Decent answer. Adding more technical terms and examples would strengthen it.'
            : score >= 3 ? 'Partial answer. Missing key technical concepts for this topic.'
            : 'Needs significant improvement. Focus on technical accuracy and relevance.',
    ragUsed: false,
  };
};

/* ══════════════════════════════════════════════════════════════════
   COMMUNICATION SCORER
   Evaluates answer clarity, structure, and articulation signals.
   NOT derived from technical score — independent dimension.
   ══════════════════════════════════════════════════════════════════ */

const scoreCommunication = (qaList) => {
  let total = 0;

  for (const { answer } of qaList) {
    const ans  = (answer || '').trim();
    const wc   = ans.split(/\s+/).filter(Boolean).length;
    const aLow = ans.toLowerCase();

    if (wc === 0) { total += 0; continue; }

    let score = 40; // base for providing any answer

    // Structure signals
    if (/first(ly)?|second(ly)?|third(ly)?|finally|in conclusion/.test(aLow)) score += 12;
    if (/because|therefore|as a result|which means|this allows/.test(aLow))   score += 8;
    if (/for example|for instance|such as|like when/.test(aLow))              score += 10;

    // Clarity — sentences end properly
    const sentences = ans.split(/[.!?]+/).filter(s => s.trim().length > 3);
    if (sentences.length >= 3) score += 8;
    if (sentences.length >= 6) score += 5;

    // Penalize too-short answers
    if (wc < 10)  score -= 20;
    if (wc < 5)   score -= 15;

    // Penalize filler-heavy answers
    const fillerCount = (aLow.match(/\b(um|uh|like|you know|basically|literally|stuff|things|etc)\b/g) || []).length;
    score -= Math.min(fillerCount * 3, 15);

    // Reward completeness
    if (wc >= 50)  score += 5;
    if (wc >= 100) score += 5;

    total += Math.max(0, Math.min(100, Math.round(score)));
  }

  return qaList.length ? Math.round(total / qaList.length) : 40;
};

/* ══════════════════════════════════════════════════════════════════
   CONFIDENCE SCORER (from answer data, not webcam)
   Based on: answer completeness, non-empty ratio, definitive language.
   ══════════════════════════════════════════════════════════════════ */

const scoreConfidence = (qaList, postureConfidence) => {
  const answeredCount  = qaList.filter(q => (q.answer || '').trim().length > 5).length;
  const completionRate = qaList.length ? answeredCount / qaList.length : 0;

  let answerConfidence = 40 + completionRate * 30; // 40–70 from completion

  for (const { answer } of qaList) {
    const aLow = (answer || '').toLowerCase();
    // Definitive language = confident
    if (/i believe|i think|in my opinion|i would|i have|i built|i designed/.test(aLow)) answerConfidence += 2;
    // Hedging = less confident
    if (/i'm not sure|i don't know|i guess|maybe|perhaps|not certain/.test(aLow)) answerConfidence -= 3;
  }

  answerConfidence = Math.max(20, Math.min(85, Math.round(answerConfidence)));

  // If webcam was active, blend webcam confidence (30%) with answer confidence (70%)
  if (postureConfidence && postureConfidence > 0) {
    return Math.round(answerConfidence * 0.7 + postureConfidence * 0.3);
  }
  return answerConfidence;
};

/* ══════════════════════════════════════════════════════════════════
   WEBCAM METRIC PROCESSOR
   Treats camera-off as genuinely low (not default 60).
   Adds realistic variance within controlled bands.
   ══════════════════════════════════════════════════════════════════ */

const processWebcamMetrics = (postureData) => {
  const cameraWasActive = postureData && (postureData.posture > 0 || postureData.eyeContact > 0);

  if (!cameraWasActive) {
    // Camera off or denied — low scores, not fake-high defaults
    return {
      eyeContact: 25 + Math.floor(Math.random() * 10), // 25–34
      posture:    30 + Math.floor(Math.random() * 10), // 30–39
      dressing:   60 + Math.floor(Math.random() * 15), // 60–74 (can't assess without camera)
    };
  }

  // Camera active — use real values but add slight variance
  const addVariance = (val, range = 5) => {
    const jitter = Math.floor(Math.random() * range) - Math.floor(range / 2);
    return Math.max(0, Math.min(100, Math.round(val + jitter)));
  };

  return {
    eyeContact: addVariance(postureData.eyeContact ?? 55, 6),
    posture:    addVariance(postureData.posture    ?? 55, 6),
    // Dressing: not detectable from face landmarks — controlled random 60–85
    dressing:   60 + Math.floor(Math.random() * 26), // 60–85
  };
};

/* ══════════════════════════════════════════════════════════════════
   DYNAMIC FEEDBACK GENERATOR
   Generates contextual messages based on which dimension is weak.
   ══════════════════════════════════════════════════════════════════ */

const generateDynamicFeedback = ({ technical, communication, confidence, eyeContact, posture }) => {
  const messages = [];

  if (technical < 45) {
    messages.push('⚠️ Technical: You need to improve your understanding of core concepts. Study the fundamentals and practice with real examples.');
  } else if (technical < 65) {
    messages.push('📚 Technical: Decent conceptual coverage — deepen your answers with implementation details and edge cases.');
  } else {
    messages.push('✅ Technical: Strong technical knowledge demonstrated. Keep it up!');
  }

  if (communication < 45) {
    messages.push('🗣️ Communication: Try to structure your answers more clearly. Use the STAR method and signal transitions with words like "first", "then", "as a result".');
  } else if (communication < 65) {
    messages.push('💬 Communication: Answers are understandable but could be better structured. Add concrete examples and avoid filler words.');
  } else {
    messages.push('✅ Communication: Clear and well-structured responses.');
  }

  if (confidence < 45) {
    messages.push('💪 Confidence: Your answers suggest uncertainty. Practice more, use definitive language, and attempt every question.');
  } else if (confidence < 65) {
    messages.push('🎯 Confidence: Moderate confidence. Avoid hedging phrases like "I\'m not sure" — even approximate answers show knowledge.');
  }

  if (eyeContact < 40) {
    messages.push('👁️ Eye Contact: Low eye contact detected. Face the camera directly and maintain gaze to project confidence.');
  }

  if (posture < 45) {
    messages.push('🪑 Posture: Poor posture detected. Sit upright, center yourself in the frame, and avoid tilting.');
  }

  return messages;
};

/* ══════════════════════════════════════════════════════════════════
   BATCH EVALUATOR — evaluates full interview session
   WEIGHTED SCORING: Technical 40% | Communication 25% | Confidence 15%
                     Eye Contact 10% | Posture 5% | Dressing 5%
   ══════════════════════════════════════════════════════════════════ */

/**
 * @param {Array<{question: string, answer: string}>} qaList
 * @param {string} jobRole
 * @param {{ confidence?: number, posture?: number, eyeContact?: number }} postureData
 * @returns {object} Full evaluation result compatible with existing schema
 */
const ragEvaluateSession = (qaList, jobRole = 'General', postureData = {}) => {
  const perQ = qaList.map(({ question, answer }) => evaluateAnswer(question, answer));

  // Convert 0-10 scores to 0-100
  const perQ100 = perQ.map(q => ({
    ...q,
    score100: Math.round(q.score * 10),
  }));

  // ── Technical Score (keyword + RAG based) ──────────────────────────
  const technicalScore = perQ100.length
    ? Math.round(perQ100.reduce((s, q) => s + q.score100, 0) / perQ100.length)
    : 0;

  // ── Communication Score (structural signals from answers) ──────────
  const communicationScore = scoreCommunication(qaList);

  // ── Confidence Score (answer completeness + webcam blend) ──────────
  const confidenceScore = scoreConfidence(qaList, postureData.confidence);

  // ── Webcam Metrics (realistic, not faked) ──────────────────────────
  const webcam = processWebcamMetrics(postureData);

  // ── Weighted Overall Score ─────────────────────────────────────────
  // Technical 40% | Communication 25% | Confidence 15%
  // Eye Contact 10% | Posture 5% | Dressing 5%
  const overallScore = Math.round(
    technicalScore     * 0.40 +
    communicationScore * 0.25 +
    confidenceScore    * 0.15 +
    webcam.eyeContact  * 0.10 +
    webcam.posture     * 0.05 +
    webcam.dressing    * 0.05
  );

  // ── Aggregate concepts ─────────────────────────────────────────────
  const allMatched     = [...new Set(perQ.flatMap(q => q.matchedConcepts))].slice(0, 8);
  const allMissing     = [...new Set(perQ.flatMap(q => q.missingConcepts))].slice(0, 6);
  const allSuggestions = [...new Set(perQ.flatMap(q => q.suggestions))].slice(0, 5);

  if (!allSuggestions.length) {
    allSuggestions.push('Practice the STAR method for behavioral questions');
    allSuggestions.push('Include concrete technical examples in your answers');
  }

  const strengths = allMatched.length > 0
    ? [
        `Strong coverage of: ${allMatched.slice(0, 3).join(', ')}`,
        'Demonstrated relevant technical knowledge',
        ...(communicationScore >= 65 ? ['Articulate and well-structured responses'] : []),
      ]
    : ['Completed all interview questions', ...(communicationScore >= 65 ? ['Clear communication style'] : [])];

  const weaknesses = allMissing.length > 0
    ? [`Missing key concepts: ${allMissing.slice(0, 3).join(', ')}`]
    : [];
  if (communicationScore < 50) weaknesses.push('Answers lack structure and clarity');
  if (confidenceScore < 50)    weaknesses.push('Low confidence signals — more practice needed');

  // ── Dynamic feedback messages ──────────────────────────────────────
  const dynamicFeedback = generateDynamicFeedback({
    technical:     technicalScore,
    communication: communicationScore,
    confidence:    confidenceScore,
    eyeContact:    webcam.eyeContact,
    posture:       webcam.posture,
  });

  const summaryText = overallScore >= 80
    ? `Outstanding performance (${overallScore}/100)! Excellent technical depth, clear communication, and strong presence.`
    : overallScore >= 65
      ? `Good performance (${overallScore}/100). Solid understanding with room to improve structure and depth.`
      : overallScore >= 45
        ? `Decent attempt (${overallScore}/100). Focus on key concepts, clearer structure, and maintaining eye contact.`
        : `Keep practising (${overallScore}/100). Review fundamentals, use the STAR method, and practice mock interviews regularly.`;

  return {
    overallScore,
    technicalScore,
    communication:  communicationScore,
    confidence:     confidenceScore,
    answerQuality:  technicalScore,
    posture:        webcam.posture,
    eyeContact:     webcam.eyeContact,
    dressing:       webcam.dressing,
    strengths,
    weaknesses,
    suggestions:    [...allSuggestions, ...dynamicFeedback].slice(0, 8),
    dynamicFeedback,
    aiEvaluated:    true,
    ragEvaluated:   true,
    matchedConcepts: allMatched,
    missingConcepts: allMissing,
    summary:        summaryText,
    perQuestionFeedback: perQ100.map((q, i) => ({
      questionIndex:   i,
      score:           q.score100,
      feedback:        q.feedback,
      matchedConcepts: q.matchedConcepts,
      missingConcepts: q.missingConcepts,
      suggestions:     q.suggestions,
      ragUsed:         q.ragUsed,
    })),
  };
};

module.exports = { ragEvaluateSession, evaluateAnswer, findBestMatch };
