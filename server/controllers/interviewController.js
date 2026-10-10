// ============================================================
//  controllers/interviewController.js  —  HireMind AI
//  UPGRADED: MongoDB Question Bank + Taxonomy + Adaptive RAG
// ============================================================

const axios            = require('axios');
const InterviewSession = require('../models/InterviewSession');
const Question         = require('../models/Question');
const User             = require('../models/User');
const { ragEvaluateSession } = require('../utils/ragEvaluator');
const { analyzeAdaptiveTrajectory } = require('../utils/adaptiveEngine');

/* ════════════════════════════════════════════════════════════════════
   SPECIALIZED DOMAIN FALLBACK QUESTION BANK (Multi-Field)
   ════════════════════════════════════════════════════════════════════ */

const QB = {
  hr: {
    easy: [
      'Tell me about yourself, your background, and what motivates you in your career.',
      'Why are you interested in this position and our organization?',
      'What are your greatest professional strengths and your biggest area of improvement?',
      'Describe your ideal work environment and team collaboration style.',
    ],
    medium: [
      'Describe a situation where you had a disagreement with a coworker or manager. How did you resolve it?',
      'Tell me about a time you had to meet a tight deadline under shifting priorities.',
      'Describe a time you took initiative or led a project without formal authority.',
      'Where do you see your career progression over the next 3 to 5 years?',
    ],
    hard: [
      'Tell me about a major failure or mistake you made. How did you take ownership and remediate it?',
      'How do you manage severe workplace stress and prevent burnout while maintaining delivery quality?',
      'Describe a time you had to make a high-stakes decision with incomplete or ambiguous data.',
    ],
  },

  frontend: {
    easy: [
      'What is the difference between HTML, CSS, and JavaScript in modern web development?',
      'What is the DOM (Document Object Model) and how do browsers parse it?',
      'Explain the CSS Box Model (margin, border, padding, content).',
      'What is responsive web design and how do media queries work?',
    ],
    medium: [
      'Explain the React Virtual DOM, reconciliation, and why component keys matter.',
      'What are React Hooks? Explain the difference between useState, useEffect, and useCallback.',
      'What is a JavaScript closure and how does lexical scoping work?',
      'Explain CSS Flexbox vs CSS Grid and when to use each.',
      'What is CORS and how do browsers handle preflight OPTIONS requests?',
    ],
    hard: [
      'How does the browser Critical Rendering Path work, and how do you optimize Core Web Vitals (LCP, INP, CLS)?',
      'Explain bundle splitting, dynamic imports, and memoization in large React codebases.',
      'How would you architect a micro-frontend application with shared design systems and state?',
    ],
  },

  fullstack: {
    easy: [
      'Explain the request-response lifecycle from browser URL input to rendered DOM.',
      'What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?',
      'What is REST and what are standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)?',
    ],
    medium: [
      'Explain the complete JWT authentication and authorization flow from frontend to backend.',
      'How do you prevent web security vulnerabilities like XSS, CSRF, and SQL Injection?',
      'When designing a data model, how do you decide between PostgreSQL and MongoDB?',
    ],
    hard: [
      'Design an end-to-end real-time notification system supporting 100k concurrent WebSocket connections.',
      'How would you architect a multi-tenant SaaS application with isolated databases vs shared schemas?',
    ],
  },

  backend_nodejs: {
    easy: [
      'How does the Node.js Event Loop work, and why is it single-threaded and non-blocking?',
      'What is middleware in Express.js and how does the next() function chain work?',
      'What is the difference between synchronous and asynchronous code in Node.js?',
    ],
    medium: [
      'Explain microtasks (process.nextTick, Promises) vs macrotasks (setTimeout, setImmediate) in Node.js.',
      'What are Node.js Streams and Buffers, and how do you handle stream backpressure?',
      'How do you implement JWT authentication with refresh tokens and secure httpOnly cookies in Express?',
    ],
    hard: [
      'Design a distributed rate limiter in Node.js across multiple instances using Redis and Lua scripts.',
      'How do you manage memory leaks, garbage collection pauses, and CPU-intensive tasks using Worker Threads?',
    ],
  },

  backend_python: {
    easy: [
      'What is the Global Interpreter Lock (GIL) in CPython and how does it affect multi-threading?',
      'Explain Python data structures: lists, tuples, sets, and dictionaries, including their time complexities.',
      'What are Python list comprehensions and generator expressions?',
    ],
    medium: [
      'How do Python generators work with the yield keyword, and what are their memory advantages?',
      'Explain Python decorators and how to write a custom decorator with functools.wraps.',
      'How does asynchronous programming work in Python using asyncio, async, and await?',
    ],
    hard: [
      'How do you structure high-throughput asynchronous database access in FastAPI using SQLAlchemy 2.0 and connection pools?',
      'Explain Python Metaclasses, dunder methods (__new__ vs __init__), and descriptor protocols.',
    ],
  },

  backend_java: {
    easy: [
      'Explain the JVM memory model: Heap, Stack, and Metaspace.',
      'What are the core principles of OOP in Java: Encapsulation, Inheritance, Polymorphism, Abstraction?',
      'What is the difference between ArrayList, LinkedList, and HashMap in Java Collections?',
    ],
    medium: [
      'How does multithreading work in Java? Compare synchronized, volatile, ReentrantLock, and AtomicInteger.',
      'Explain Garbage Collection in Java and how Young and Old Generations work (G1GC / ZGC).',
      'What is Dependency Injection and Inversion of Control (IoC) in Spring Boot?',
    ],
    hard: [
      'Design a resilient Spring Boot microservice using Resilience4j Circuit Breakers and distributed tracing.',
      'How do Java 21 Virtual Threads (Project Loom) work and how do they change high-concurrency throughput?',
    ],
  },

  backend_cpp: {
    easy: [
      'What is RAII (Resource Acquisition Is Initialization) in C++ and why is it fundamental?',
      'Explain the difference between stack and heap memory allocation in C++ (new/delete vs malloc/free).',
      'What are references vs pointers in C++?',
    ],
    medium: [
      'Explain smart pointers in modern C++: std::unique_ptr, std::shared_ptr, and std::weak_ptr.',
      'What are rvalue references (&&) and how does std::move implement move semantics?',
      'Explain virtual functions, vtables, and runtime polymorphism in C++.',
    ],
    hard: [
      'How do you build a high-performance Linux network server in C++ using non-blocking sockets and epoll edge-triggered mode?',
      'Explain memory order models (std::memory_order_relaxed, acquire, release, seq_cst) in lock-free C++ programming.',
    ],
  },

  aiml: {
    easy: [
      'What is the difference between Supervised, Unsupervised, and Reinforcement Learning?',
      'Explain the Bias-Variance tradeoff and how regularization (L1 Lasso vs L2 Ridge) prevents overfitting.',
      'What are activation functions in neural networks (ReLU, Sigmoid, Softmax) and why is non-linearity essential?',
    ],
    medium: [
      'Explain Convolutional Neural Networks (CNNs) vs Recurrent Neural Networks (RNNs) and their architectures.',
      'How does the Self-Attention mechanism work in Transformers (Queries, Keys, Values)?',
      'How does Retrieval-Augmented Generation (RAG) work with dense vector embeddings and vector databases?',
    ],
    hard: [
      'Design an enterprise RAG system with hybrid search (dense + sparse BM25), reranking, and hallucination guardrails.',
      'Explain Reinforcement Learning from Human Feedback (RLHF), Direct Preference Optimization (DPO), and LoRA quantization.',
    ],
  },

  data_scientist: {
    easy: [
      'What is the difference between Type I and Type II errors in hypothesis testing?',
      'Explain Linear Regression vs Logistic Regression assumptions and evaluation metrics.',
      'How do you clean raw datasets, handle missing values (imputation), and detect outliers?',
    ],
    medium: [
      'How do you design a statistically valid A/B test (Null Hypothesis, p-value, Statistical Power, Sample Size)?',
      'How do you handle severe class imbalance in classification problems (SMOTE, class weights, PR-AUC vs ROC-AUC)?',
      'Explain Decision Trees vs Random Forests (Bagging) vs Gradient Boosting (XGBoost / LightGBM).',
    ],
    hard: [
      'Design an end-to-end churn prediction pipeline addressing feature drift (PSI), model calibration, and business ROI.',
      'Explain Principal Component Analysis (PCA) dimensionality reduction and mathematical eigenvalue decomposition.',
    ],
  },

  data_analyst: {
    easy: [
      'Explain the difference between INNER JOIN, LEFT JOIN, FULL OUTER JOIN, and CROSS JOIN in SQL.',
      'What are aggregate functions in SQL (COUNT, SUM, AVG, MIN, MAX) and how does GROUP BY work with HAVING?',
      'What are primary keys, foreign keys, and unique indexes in relational database design?',
    ],
    medium: [
      'How do SQL Window Functions work? Compare ROW_NUMBER(), RANK(), and DENSE_RANK() with tie handling.',
      'How do you compute Month-over-Month (MoM) revenue growth and 7-day rolling averages using SQL LAG() and window frames?',
      'What is the difference between Star Schema and Snowflake Schema in Data Warehousing?',
    ],
    hard: [
      'How do you design an executive SaaS dashboard in Power BI / Tableau tracking MRR, Churn Rate, LTV, CAC, and LTV/CAC ratio?',
      'How do you conduct cohort retention analysis to identify root causes of customer drop-off?',
    ],
  },

  backend: {
    easy: [
      'What is a REST API and what are HTTP methods?',
      'What is middleware in web backends?',
      'What is the difference between SQL and NoSQL databases?',
    ],
    medium: [
      'Explain asynchronous concurrency and event-driven architecture.',
      'What is JWT authentication and how does it work?',
      'Explain database indexing and why B-Trees are preferred.',
    ],
    hard: [
      'Design a scalable backend architecture for 1 million concurrent users.',
      'Explain CQRS, Event Sourcing, and Distributed Transactions across microservices.',
    ],
  },
};

/* ════════════════════════════════════════════════════════════════════
   CANONICAL TECH NORMALIZATION HELPER
   ════════════════════════════════════════════════════════════════════ */

const TECH_ALIAS_MAP = {
  'html': 'html', 'html5': 'html',
  'css': 'css', 'css3': 'css',
  'javascript': 'javascript', 'js': 'javascript',
  'typescript': 'typescript', 'ts': 'typescript',
  'tailwind': 'tailwind', 'tailwindcss': 'tailwind', 'tailwind css': 'tailwind',
  'bootstrap': 'bootstrap',
  'sass': 'sass', 'scss': 'sass',
  'react': 'react', 'reactjs': 'react', 'react.js': 'react',
  'angular': 'angular',
  'vue': 'vue', 'vuejs': 'vue', 'vue.js': 'vue',
  'nextjs': 'nextjs', 'next.js': 'nextjs', 'next': 'nextjs',
  'vite': 'vite', 'webpack': 'webpack', 'git': 'git', 'github': 'git',
  'testing': 'testing',
  'nodejs': 'nodejs', 'node.js': 'nodejs', 'node': 'nodejs',
  'expressjs': 'expressjs', 'express.js': 'expressjs', 'express': 'expressjs',
  'nestjs': 'nestjs', 'nest.js': 'nestjs', 'nest': 'nestjs',
  'python': 'python',
  'flask': 'flask', 'django': 'django', 'fastapi': 'fastapi',
  'java': 'java', 'spring': 'spring_boot', 'spring_boot': 'spring_boot', 'spring boot': 'spring_boot',
  'cpp': 'cpp', 'c++': 'cpp', 'cplusplus': 'cpp', 'stl': 'cpp',
  'csharp': 'csharp', 'c#': 'csharp', 'dotnet': 'csharp', '.net': 'csharp', 'aspnet': 'csharp', 'asp.net': 'csharp',
  'mongodb': 'mongodb', 'mongo': 'mongodb',
  'mysql': 'mysql', 'postgresql': 'postgresql', 'postgres': 'postgresql',
  'sqlserver': 'sqlserver', 'sql server': 'sqlserver', 'mssql': 'sqlserver',
  'redis': 'redis',
  'numpy': 'numpy', 'pandas': 'pandas',
  'scikit_learn': 'scikit_learn', 'scikit-learn': 'scikit_learn', 'sklearn': 'scikit_learn',
  'pytorch': 'pytorch', 'tensorflow': 'tensorflow', 'tf': 'tensorflow',
  'machine_learning': 'machine_learning', 'ml': 'machine_learning',
  'deep_learning': 'deep_learning', 'dl': 'deep_learning',
  'nlp': 'nlp', 'computer_vision': 'computer_vision', 'cv': 'computer_vision',
  'genai': 'genai', 'generative_ai': 'genai', 'generative ai': 'genai',
  'llm': 'llm', 'llms': 'llm', 'rag': 'rag', 'ai_agents': 'ai_agents', 'agents': 'ai_agents',
  'vector_db': 'vector_db', 'vector_databases': 'vector_db', 'vectordb': 'vector_db',
  'sql': 'sql', 'power_bi': 'power_bi', 'powerbi': 'power_bi',
  'tableau': 'tableau', 'excel': 'excel',
  'statistics': 'statistics', 'stats': 'statistics', 'probability': 'probability',
  'ab_testing': 'ab_testing', 'a/b testing': 'ab_testing', 'experimental_design': 'ab_testing',
  'self_intro': 'self_intro', 'self introduction': 'self_intro',
  'strengths_weaknesses': 'strengths_weaknesses', 'career_goals': 'career_goals',
  'teamwork': 'teamwork', 'leadership': 'leadership', 'conflict_resolution': 'conflict_resolution',
  'problem_solving': 'problem_solving', 'situational': 'situational',
};

const normalizeTechList = (rawInput) => {
  if (!rawInput) return [];
  let items = [];
  if (Array.isArray(rawInput)) {
    items = rawInput;
  } else if (typeof rawInput === 'string') {
    if (rawInput.startsWith('[') && rawInput.endsWith(']')) {
      try { items = JSON.parse(rawInput); } catch { items = rawInput.split(','); }
    } else {
      items = rawInput.split(',');
    }
  }
  const cleanList = [];
  for (const item of items) {
    const s = (item || '').toString().trim().toLowerCase();
    if (!s) continue;
    const mapped = TECH_ALIAS_MAP[s] || s.replace(/[^a-z0-9_]/g, '');
    if (mapped && !cleanList.includes(mapped)) {
      cleanList.push(mapped);
    }
  }
  return cleanList;
};

/* ════════════════════════════════════════════════════════════════════
   NORMALIZE ROLE & TECHNOLOGY TO DOMAIN KEYS
   ════════════════════════════════════════════════════════════════════ */

const resolveDomainKey = (role = '', technology = '', category = '', techList = []) => {
  const normRole = (role || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  const normCat  = (category || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  const allTechs = [...techList, technology].map(t => (t || '').toLowerCase()).join(' ');

  if (normRole.includes('hr') || normRole.includes('behavioral') || normCat === 'hr' || normCat === 'behavioral') {
    return 'hr';
  }
  if (normRole.includes('front')) return 'frontend';
  if (normRole.includes('full'))  return 'fullstack';
  if (normRole.includes('aiml') || normRole.includes('ai_ml') || normRole.includes('ml_') || normRole.includes('ai_') || normRole.includes('machine_learning')) {
    return 'aiml';
  }
  if (normRole.includes('data_sci') || normRole.includes('datascience')) {
    return 'data_scientist';
  }
  if (normRole.includes('data_ana') || normRole.includes('dataanalyst') || normRole.includes('analyst')) {
    return 'data_analyst';
  }

  // Backend developer with technology track
  if (normRole.includes('back') || normRole.includes('server') || normRole.includes('dev')) {
    if (allTechs.includes('python') || allTechs.includes('django') || allTechs.includes('fastapi')) return 'backend_python';
    if (allTechs.includes('java') || allTechs.includes('spring')) return 'backend_java';
    if (allTechs.includes('cpp') || allTechs.includes('c++') || allTechs.includes('cplusplus')) return 'backend_cpp';
    return 'backend_nodejs';
  }

  return 'backend_nodejs';
};

const pickQuestions = (role, technology, category, difficulty, count, techList = []) => {
  const domain = resolveDomainKey(role, technology, category, techList);
  const diff   = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';
  const pool   = QB[domain]?.[diff] || QB[domain]?.medium || QB.backend_nodejs?.[diff] || QB.backend.medium;
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
  "answerQuality": <0-100 number>,
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

    // Merge realistic webcam posture data from RAG processor
    parsed.posture      = ragResult.posture    ?? Math.round((postureData?.posture ?? 30) * 0.8);
    parsed.dressing     = ragResult.dressing   ?? 65;
    parsed.aiEvaluated  = true;
    parsed.ragEvaluated = false;
    parsed.technicalScore   = parsed.answerQuality ?? parsed.overallScore ?? 0;
    parsed.dynamicFeedback  = ragResult.dynamicFeedback ?? [];

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

    ['overallScore', 'communication', 'answerQuality', 'posture'].forEach(k => {
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
 * GET /api/interviews/questions
 * Query parameters supported:
 * - role / roleId: Target role identifier ('frontend', 'backend', 'fullstack', 'aiml', 'data_scientist', 'data_analyst', 'hr')
 * - technologies / technology / tech: Specific technologies (comma-separated or array)
 * - topic: Specific topic within the category
 * - difficulty: 'easy' | 'medium' | 'hard' | 'adaptive' (default: 'medium')
 * - count: 1–20 (default: 5)
 */
const getInterviewQuestions = async (req, res) => {
  try {
    const {
      role         = 'backend',
      roleId,
      jobRole,
      technology   = '',
      technologies = '',
      tech         = '',
      category     = 'technical',
      roundType,
      fieldId,
      topic,
      difficulty   = 'medium',
      count        = '5',
    } = req.query;

    const parsedCount = Math.min(Math.max(parseInt(count, 10) || 5, 1), 20);
    const validDiff   = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : (difficulty === 'adaptive' ? 'medium' : 'medium');
    const rawRole     = roleId || role || jobRole || 'backend';
    const normRole    = rawRole.toLowerCase().replace(/[^a-z0-9_]/g, '');

    // Canonical role mapping
    let canonicalRole = 'backend';
    if (normRole.includes('full')) canonicalRole = 'fullstack';
    else if (normRole.includes('front')) canonicalRole = 'frontend';
    else if (normRole.includes('aiml') || normRole.includes('ai_ml') || normRole.includes('machine') || normRole.includes('ml_') || normRole.includes('ai_')) canonicalRole = 'aiml';
    else if (normRole.includes('data_sci') || normRole.includes('datascience')) canonicalRole = 'data_scientist';
    else if (normRole.includes('data_ana') || normRole.includes('dataanalyst') || normRole.includes('analyst')) canonicalRole = 'data_analyst';
    else if (normRole.includes('hr') || normRole.includes('behavioral')) canonicalRole = 'hr';
    else if (normRole.includes('back') || normRole.includes('server')) canonicalRole = 'backend';

const FRONTEND_FRAMEWORKS = ['react', 'angular', 'vue', 'nextjs'];
const BACKEND_GROUPS = [
  ['nodejs', 'expressjs', 'nestjs'],
  ['python', 'fastapi', 'django', 'flask'],
  ['java', 'spring_boot', 'spring'],
  ['cpp'],
  ['csharp', 'aspnet', 'dotnet'],
];
const DB_GROUPS = ['mongodb', 'postgresql', 'mysql', 'sqlserver'];
const BI_GROUPS = ['power_bi', 'tableau', 'excel'];

    // Parse selected technologies
    const selectedTechs = normalizeTechList(technologies || technology || tech);

    // ── 1. Attempt MongoDB Query First ────────────────────────────────
    let dbQuestions = [];
    try {
      const query = {
        isActive: true,
        $or: [
          { role: canonicalRole },
          { roleId: normRole },
          { roleId: `${canonicalRole}_developer` },
          { roleId: `${canonicalRole}_engineer` },
        ],
      };

      if (difficulty !== 'adaptive') {
        query.difficulty = validDiff;
      }

      // Strict technology stack matching
      if (selectedTechs.length > 0) {
        query.$and = [
          {
            $or: [
              { technology: { $in: selectedTechs } },
              { tags: { $in: selectedTechs } },
            ],
          },
        ];

        // Compute mutually exclusive technology exclusions to prevent cross-contamination
        const exclusions = [];

        // 1. Frontend Frameworks
        const selectedFrontend = FRONTEND_FRAMEWORKS.filter(t => selectedTechs.includes(t));
        if (selectedFrontend.length > 0) {
          const notSelectedFE = FRONTEND_FRAMEWORKS.filter(t => !selectedTechs.includes(t));
          exclusions.push(...notSelectedFE);
        }

        // 2. Backend Frameworks & Languages
        const selectedBackendGroup = BACKEND_GROUPS.find(grp => grp.some(t => selectedTechs.includes(t)));
        if (selectedBackendGroup) {
          BACKEND_GROUPS.forEach(grp => {
            if (grp !== selectedBackendGroup) {
              exclusions.push(...grp);
            }
          });
        }

        // 3. Databases
        const selectedDBs = DB_GROUPS.filter(t => selectedTechs.includes(t));
        if (selectedDBs.length > 0) {
          const notSelectedDB = DB_GROUPS.filter(t => !selectedTechs.includes(t));
          exclusions.push(...notSelectedDB);
        }

        // 4. BI Tools
        const selectedBI = BI_GROUPS.filter(t => selectedTechs.includes(t));
        if (selectedBI.length > 0) {
          const notSelectedBI = BI_GROUPS.filter(t => !selectedTechs.includes(t));
          exclusions.push(...notSelectedBI);
        }

        if (exclusions.length > 0) {
          query.$and.push({
            technology: { $nin: exclusions },
            tags: { $nin: exclusions },
          });
        }
      }

      if (topic) {
        query.topic = new RegExp(topic, 'i');
      }

      let results = await Question.find(query).limit(parsedCount * 3).lean();

      // If strict difficulty returned fewer questions, broaden difficulty within the exact chosen stack
      if ((!results || results.length < parsedCount) && query.difficulty) {
        delete query.difficulty;
        results = await Question.find(query).limit(parsedCount * 3).lean();
      }

      if (results && results.length > 0) {
        const shuffled = [...results].sort(() => 0.5 - Math.random());
        dbQuestions = shuffled.slice(0, parsedCount).map(q => q.question);
      }
    } catch (dbErr) {
      console.warn('[getInterviewQuestions] MongoDB query warning:', dbErr.message);
    }

    // ── 2. Blend with Domain Fallback if needed ────────────────────────
    let finalQuestions = [...dbQuestions];
    if (finalQuestions.length < parsedCount) {
      const fallbackQuestions = pickQuestions(canonicalRole, selectedTechs[0] || '', category, validDiff, parsedCount, selectedTechs);
      for (const fq of fallbackQuestions) {
        if (!finalQuestions.includes(fq) && finalQuestions.length < parsedCount) {
          finalQuestions.push(fq);
        }
      }
    }

    if (!finalQuestions.length) {
      return res.status(404).json({
        success: false,
        message: `No questions found for role "${canonicalRole}" (${selectedTechs.join(', ') || 'general'}) at difficulty "${validDiff}".`,
      });
    }

    res.json({
      success: true,
      questions: finalQuestions,
      count: finalQuestions.length,
      difficulty: validDiff,
      role: canonicalRole,
      technologies: selectedTechs,
      technology: selectedTechs[0] || undefined,
      category,
      source: dbQuestions.length >= parsedCount ? 'mongodb' : dbQuestions.length > 0 ? 'hybrid' : 'bank',
    });
  } catch (err) {
    console.error('[getInterviewQuestions] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
  }
};

/**
 * POST /api/interviews
 * Body: { jobRole, role, technology, technologies, difficulty, questions[], answers[], postureData, duration, ... }
 */
const saveInterviewSession = async (req, res) => {
  try {
    const {
      jobRole        = 'General',
      role           = 'backend',
      technology     = '',
      technologies   = [],
      difficulty     = 'medium',
      questions      = [],
      answers        = [],
      postureData    = {},
      duration       = 0,
      tabSwitches    = 0,
      cheatingEvents = [],
      status         = 'completed',
      category       = 'general',
      aiCharacter    = 'shubham',
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

    // ── Compute Adaptive Difficulty Trajectory ───────────────────────
    const adaptiveTrajectory = analyzeAdaptiveTrajectory(evaluation.perQuestionFeedback || []);
    evaluation.adaptiveTrajectory = adaptiveTrajectory;

    // Normalize tech list
    const techArray = normalizeTechList(technologies || technology);

    // ── Persist session ──────────────────────────────────────────────
    const session = await InterviewSession.create({
      user:       req.user._id,
      jobRole,
      role,
      technology: technology || techArray[0] || '',
      technologies: techArray,
      category,
      difficulty,
      aiCharacter,
      questions:  qaList,
      feedback: {
        communication:    evaluation.communication    ?? 50,
        answerQuality:    evaluation.answerQuality    ?? 50,
        posture:          evaluation.posture          ?? 35,
        dressing:         evaluation.dressing         ?? 65,
        technicalScore:   evaluation.technicalScore   ?? evaluation.answerQuality ?? 50,
        overallScore:     evaluation.overallScore     ?? 50,
        suggestions:      evaluation.suggestions      ?? [],
        strengths:        evaluation.strengths        ?? [],
        weaknesses:       evaluation.weaknesses       ?? [],
        dynamicFeedback:  evaluation.dynamicFeedback  ?? [],
        summary:          evaluation.summary          ?? '',
        aiEvaluated:      evaluation.aiEvaluated      ?? false,
        ragEvaluated:     evaluation.ragEvaluated      ?? false,
        matchedConcepts:  evaluation.matchedConcepts  ?? [],
        missingConcepts:  evaluation.missingConcepts  ?? [],
        perQuestionFeedback: evaluation.perQuestionFeedback ?? [],
        adaptiveTrajectory:  evaluation.adaptiveTrajectory ?? {},
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

/**
 * GET /api/interviews/taxonomy
 * Returns complete Multi-Field Career Taxonomy, Roles, Rounds, and Strategies
 */
const getTaxonomy = (req, res) => {
  try {
    const { CAREER_FIELDS, INTERVIEW_ROUNDS, EVALUATION_STRATEGIES } = require('../config/taxonomy');
    res.json({
      success: true,
      careerFields: CAREER_FIELDS,
      interviewRounds: INTERVIEW_ROUNDS,
      evaluationStrategies: EVALUATION_STRATEGIES,
    });
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
  getTaxonomy,
};
