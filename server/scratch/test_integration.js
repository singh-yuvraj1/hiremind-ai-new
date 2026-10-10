/**
 * server/scratch/test_integration.js — HireMind AI
 * Comprehensive Automated Verification Suite for 14 Role & Technology Configurations.
 *
 * Checks:
 * 1. Frontend: HTML + CSS + JavaScript
 * 2. Frontend: React + TypeScript + Tailwind CSS
 * 3. Backend: JavaScript + Node.js + Express.js + MongoDB
 * 4. Backend: Python + FastAPI + PostgreSQL
 * 5. Backend: Java + Spring Boot + MySQL
 * 6. Backend: Modern C++ Fundamentals
 * 7. Full Stack: React + Node.js + Express.js + MongoDB (MERN)
 * 8. Full Stack: React + Spring Boot + PostgreSQL
 * 9. AI / ML: Python + Scikit-Learn
 * 10. AI / ML: PyTorch + Deep Learning
 * 11. Data Scientist: Python + Pandas + Statistics
 * 12. Data Analyst: SQL + Power BI
 * 13. Data Analyst: Excel + Tableau
 * 14. HR / Behavioral: Behavioral Screening & STAR Leadership
 */

const axios    = require('axios');
const jwt      = require('jsonwebtoken');
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const User     = require('../models/User');

dotenv.config({ path: __dirname + '/../.env' });

const BASE_URL = 'http://127.0.0.1:5000/api/interviews/questions';

const TEST_CONFIGS = [
  {
    name: '1. Frontend Developer: HTML + CSS + JavaScript',
    role: 'frontend',
    technologies: 'html,css,javascript',
    difficulty: 'easy',
    count: 3,
    expectedKeywords: ['html', 'css', 'javascript', 'dom', 'box model', 'closure', 'semantic'],
    disallowedKeywords: ['angular', 'spring', 'pytorch'],
  },
  {
    name: '2. Frontend Developer: React + TypeScript + Tailwind CSS',
    role: 'frontend',
    technologies: 'react,typescript,tailwind',
    difficulty: 'medium',
    count: 3,
    expectedKeywords: ['react', 'typescript', 'tailwind', 'virtual dom', 'type', 'utility'],
    disallowedKeywords: ['angular', 'django', 'spring'],
  },
  {
    name: '3. Backend Developer: JavaScript + Node.js + Express.js + MongoDB',
    role: 'backend',
    technologies: 'javascript,nodejs,expressjs,mongodb',
    difficulty: 'medium',
    count: 3,
    expectedKeywords: ['node', 'express', 'event loop', 'middleware', 'mongo', 'stream'],
    disallowedKeywords: ['fastapi', 'spring', 'pytorch'],
  },
  {
    name: '4. Backend Developer: Python + FastAPI + PostgreSQL',
    role: 'backend',
    technologies: 'python,fastapi,postgresql',
    difficulty: 'medium',
    count: 3,
    expectedKeywords: ['python', 'fastapi', 'postgresql', 'pydantic', 'acid', 'asgi'],
    disallowedKeywords: ['spring boot', 'express', 'angular'],
  },
  {
    name: '5. Backend Developer: Java + Spring Boot + MySQL',
    role: 'backend',
    technologies: 'java,spring_boot,mysql',
    difficulty: 'medium',
    count: 3,
    expectedKeywords: ['java', 'spring', 'boot', 'ioc', 'jvm', 'concurrency'],
    disallowedKeywords: ['fastapi', 'django', 'express'],
  },
  {
    name: '6. Backend Developer: Modern C++ Fundamentals',
    role: 'backend',
    technologies: 'cpp',
    difficulty: 'medium',
    count: 2,
    expectedKeywords: ['c++', 'raii', 'smart pointer', 'stl', 'pointer', 'memory'],
    disallowedKeywords: ['spring', 'react', 'fastapi'],
  },
  {
    name: '7. Full Stack Developer: React + Node.js + Express.js + MongoDB (MERN)',
    role: 'fullstack',
    technologies: 'react,nodejs,expressjs,mongodb',
    difficulty: 'easy',
    count: 3,
    expectedKeywords: ['mern', 'react', 'express', 'node', 'mongo', 'lifecycle', 'api'],
    disallowedKeywords: ['spring boot', 'pytorch', 'angular'],
  },
  {
    name: '8. Full Stack Developer: React + Spring Boot + PostgreSQL',
    role: 'fullstack',
    technologies: 'react,spring_boot,postgresql',
    difficulty: 'medium',
    count: 3,
    expectedKeywords: ['spring', 'react', 'postgresql', 'enterprise', 'jpa', 'jwt'],
    disallowedKeywords: ['mongodb', 'express', 'vue'],
  },
  {
    name: '9. AI / ML Engineer: Python + Scikit-Learn',
    role: 'aiml',
    technologies: 'python,scikit_learn,machine_learning',
    difficulty: 'easy',
    count: 2,
    expectedKeywords: ['scikit', 'pipeline', 'supervised', 'learning', 'leakage', 'bias'],
    disallowedKeywords: ['spring', 'angular', 'excel'],
  },
  {
    name: '10. AI / ML Engineer: PyTorch + Deep Learning',
    role: 'aiml',
    technologies: 'python,pytorch,deep_learning',
    difficulty: 'medium',
    count: 2,
    expectedKeywords: ['pytorch', 'autograd', 'tensor', 'gradient', 'loop', 'neural'],
    disallowedKeywords: ['django', 'spring', 'excel'],
  },
  {
    name: '11. Data Scientist: Python + Pandas + Statistics',
    role: 'data_scientist',
    technologies: 'python,pandas,statistics',
    difficulty: 'easy',
    count: 3,
    expectedKeywords: ['pandas', 'missing', 'outlier', 'statistics', 'testing', 'iqr', 'hypothesis'],
    disallowedKeywords: ['spring', 'react', 'tailwind'],
  },
  {
    name: '12. Data Analyst: SQL + Power BI',
    role: 'data_analyst',
    technologies: 'sql,power_bi',
    difficulty: 'medium',
    count: 2,
    expectedKeywords: ['sql', 'power bi', 'dax', 'star schema', 'calculate', 'dimension'],
    disallowedKeywords: ['pytorch', 'spring', 'angular'],
  },
  {
    name: '13. Data Analyst: Excel + Tableau',
    role: 'data_analyst',
    technologies: 'excel,tableau',
    difficulty: 'medium',
    count: 2,
    expectedKeywords: ['tableau', 'lod', 'excel', 'xlookup', 'pivot', 'kpi'],
    disallowedKeywords: ['spring', 'fastapi', 'cpp'],
  },
  {
    name: '14. HR / Behavioral Interview: STAR & Leadership',
    role: 'hr',
    technologies: 'self_intro,leadership,conflict_resolution',
    difficulty: 'easy',
    count: 3,
    expectedKeywords: ['yourself', 'star', 'conflict', 'leadership', 'initiative', 'strength'],
    disallowedKeywords: ['function', 'class', 'database', 'sql', 'pointer'],
  },
];

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('   HIREMIND AI — AUTOMATED 14-CONFIGURATION VERIFICATION SUITE');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hiremind';
  await mongoose.connect(uri);

  let user = await User.findOne({});
  if (!user) {
    user = await User.create({
      name: 'Test Interviewer',
      email: 'test_interviewer@example.com',
      password: 'password123',
    });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'what_i_will_not_tell_you_2026', { expiresIn: '1d' });
  const authHeaders = { Authorization: `Bearer ${token}` };

  let passed = 0;
  let failed = 0;

  for (const cfg of TEST_CONFIGS) {
    try {
      const url = `${BASE_URL}?role=${cfg.role}&technologies=${cfg.technologies}&difficulty=${cfg.difficulty}&count=${cfg.count}`;
      const res = await axios.get(url, { headers: authHeaders, timeout: 8000 });

      if (res.status !== 200 || !res.data.success) {
        throw new Error(`Invalid status: ${res.status}`);
      }

      const questions = res.data.questions || [];
      if (questions.length === 0) {
        throw new Error('Received empty questions array.');
      }

      const combinedText = questions.join(' ').toLowerCase();

      // Check expected keywords
      const matchedExpected = cfg.expectedKeywords.filter(kw => combinedText.includes(kw.toLowerCase()));
      const hasDisallowed = cfg.disallowedKeywords.some(kw => combinedText.includes(kw.toLowerCase()));

      if (matchedExpected.length === 0) {
        throw new Error(`Questions did not contain expected tech keywords (${cfg.expectedKeywords.join(', ')}). Text: ${combinedText}`);
      }

      if (hasDisallowed) {
        throw new Error(`Found disallowed cross-technology contamination in questions! Text: ${combinedText}`);
      }

      console.log(`✅ PASS: ${cfg.name}`);
      console.log(`   • Role: ${res.data.role} | Techs: [${res.data.technologies?.join(', ') || res.data.technology}]`);
      console.log(`   • Returned ${questions.length} questions (Source: ${res.data.source})`);
      console.log(`   • Sample Q: "${questions[0].substring(0, 75)}..."\n`);
      passed++;

    } catch (err) {
      console.error(`❌ FAIL: ${cfg.name}`);
      console.error(`   • Error: ${err.message || err.code || 'Unknown error'}`);
      if (err.response?.data) console.error(`   • Server Response:`, err.response.data);
      console.error('');
      failed++;
    }
  }

  await mongoose.disconnect();


  console.log('═══════════════════════════════════════════════════════════════════');
  console.log(`   TEST RUN RESULTS: ${passed}/${TEST_CONFIGS.length} Passed, ${failed} Failed`);
  console.log('═══════════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
