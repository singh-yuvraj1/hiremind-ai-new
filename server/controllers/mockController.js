const MockTest = require('../models/MockTest');

const questionBanks = {
  aptitude: [
    { q: "A train travels 360 km in 4 hours. Speed in km/h?", opts: ["80", "90", "100", "72"], ans: 1 },
    { q: "If 12 workers finish a task in 8 days, how many days for 16 workers?", opts: ["4", "6", "8", "10"], ans: 1 },
    { q: "What is 15% of 480?", opts: ["60", "72", "80", "84"], ans: 1 },
    { q: "Shopkeeper sells at 20% profit. Cost price is 250. Selling price?", opts: ["280", "300", "320", "350"], ans: 1 },
    { q: "Find next: 2, 6, 18, 54, ?", opts: ["108", "162", "144", "216"], ans: 1 },
    { q: "What is 25% of 200?", opts: ["40", "50", "60", "45"], ans: 1 },
    { q: "A car covers 200 km in 4 hours. Speed in km/h?", opts: ["40", "50", "55", "45"], ans: 1 },
    { q: "If 3x = 18, what is x?", opts: ["4", "6", "5", "8"], ans: 1 },
    { q: "Simple interest on 1000 at 5% for 2 years?", opts: ["100", "150", "200", "50"], ans: 0 },
    { q: "Find next: 1, 4, 9, 16, ?", opts: ["20", "25", "36", "30"], ans: 1 },
    { q: "A man walks at 5 km/h. Time to walk 15 km?", opts: ["2h", "3h", "4h", "2.5h"], ans: 1 },
    { q: "What is 40% of 500?", opts: ["150", "200", "250", "180"], ans: 1 },
    { q: "Average of 10, 20, 30, 40, 50?", opts: ["25", "30", "35", "28"], ans: 1 },
    { q: "If A:B = 2:3 and B:C = 3:4, then A:C = ?", opts: ["2:4", "1:2", "3:4", "2:3"], ans: 1 },
    { q: "Compound interest on 1000 at 10% for 2 years?", opts: ["210", "200", "220", "190"], ans: 0 },
  ],
  dsa: [
    { q: "Time complexity of binary search?", opts: ["O(n)", "O(log n)", "O(n^2)", "O(1)"], ans: 1 },
    { q: "Which data structure uses LIFO?", opts: ["Queue", "Stack", "Deque", "Heap"], ans: 1 },
    { q: "Worst case time complexity of QuickSort?", opts: ["O(n log n)", "O(log n)", "O(n^2)", "O(n)"], ans: 2 },
    { q: "Inorder traversal of BST gives:", opts: ["Descending", "Ascending", "Random", "Level order"], ans: 1 },
    { q: "Space complexity of Merge Sort?", opts: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], ans: 2 },
    { q: "Which is NOT a linear data structure?", opts: ["Array", "Queue", "Tree", "Stack"], ans: 2 },
    { q: "Best case time of insertion sort?", opts: ["O(n^2)", "O(n log n)", "O(n)", "O(log n)"], ans: 2 },
    { q: "Time to access element in hash table (average)?", opts: ["O(n)", "O(log n)", "O(1)", "O(n^2)"], ans: 2 },
    { q: "DFS uses which data structure?", opts: ["Queue", "Stack", "Heap", "Array"], ans: 1 },
    { q: "BFS uses which data structure?", opts: ["Stack", "Queue", "Heap", "Linked list"], ans: 1 },
    { q: "Time complexity to insert at head of linked list?", opts: ["O(n)", "O(log n)", "O(1)", "O(n^2)"], ans: 2 },
    { q: "Which sorting algorithm is stable?", opts: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], ans: 2 },
    { q: "What is a heap?", opts: ["Linear DS", "Complete binary tree with heap property", "BST", "Hash table"], ans: 1 },
    { q: "What is a linked list?", opts: ["Contiguous memory", "Nodes linked by pointers", "Same as array", "Hash table"], ans: 1 },
    { q: "Postfix notation of A+B*C?", opts: ["A+BC*", "ABC*+", "A+BC", "AB+C*"], ans: 1 },
  ],
  programming: [
    { q: "In JavaScript, typeof null returns?", opts: ["null", "undefined", "object", "string"], ans: 2 },
    { q: "Which is NOT a JavaScript data type?", opts: ["String", "Symbol", "Boolean", "Float"], ans: 3 },
    { q: "Which HTTP method is idempotent?", opts: ["POST", "PATCH", "PUT", "None"], ans: 2 },
    { q: "What does JSON stand for?", opts: ["JavaScript Object Naming", "JavaScript Object Notation", "Java Standard Object Network", "JavaScript Ordered Node"], ans: 1 },
    { q: "Which is used to declare a constant in JavaScript?", opts: ["var", "let", "const", "static"], ans: 2 },
    { q: "What is a callback function?", opts: ["Returns a value", "Passed as argument to another function", "Async function", "Arrow function"], ans: 1 },
    { q: "Which of these is immutable in Python?", opts: ["List", "Dict", "Tuple", "Set"], ans: 2 },
    { q: "What does npm stand for?", opts: ["Node Package Module", "Node Package Manager", "New Project Manager", "Network Package Module"], ans: 1 },
    { q: "Git command to push to remote?", opts: ["git add", "git commit", "git push", "git merge"], ans: 2 },
    { q: "Which is a valid HTTP status for Not Found?", opts: ["200", "301", "404", "500"], ans: 2 },
    { q: "What is SQL injection?", opts: ["A database query", "A security vulnerability", "A design pattern", "A sorting algorithm"], ans: 1 },
    { q: "Python anonymous functions use?", opts: ["def", "func", "lambda", "anon"], ans: 2 },
    { q: "What does 'use strict' do in JavaScript?", opts: ["Enable ES6", "Strict type checking", "Prevent certain bad syntax", "Enable async"], ans: 2 },
    { q: "REST stands for?", opts: ["Remote Execution State Transfer", "Representational State Transfer", "Real-time Event Tracking", "Resource Entity Service"], ans: 1 },
    { q: "What is the difference between == and === in JS?", opts: ["No difference", "=== checks type too", "== checks type", "Both check type"], ans: 1 },
  ],
  behavioral: [
    { q: "STAR method stands for?", opts: ["Skill Task Action Result", "Situation Task Action Result", "Strategy Target Approach Review", "Story Theme Attitude Response"], ans: 1 },
    { q: "Best response to 'What is your weakness?'", opts: ["Say you have none", "Real weakness + how improving", "A strength as weakness", "Refuse"], ans: 1 },
    { q: "SWOT stands for?", opts: ["Skills Work Objectives Targets", "Strengths Weaknesses Opportunities Threats", "Strategy Workflow Options Timeline", "None"], ans: 1 },
    { q: "In behavioral interviews you should:", opts: ["Speak theoretically", "Give specific past examples", "Keep answers under 30s", "Avoid personal stories"], ans: 1 },
    { q: "When asked Tell me about yourself, you should:", opts: ["Recite full resume", "Talk about hobbies only", "Brief professional summary for role", "Talk about family"], ans: 2 },
    { q: "Elevator pitch length is usually:", opts: ["5-10 minutes", "30-60 seconds", "2-3 minutes", "10 seconds"], ans: 1 },
    { q: "Salary negotiation tip:", opts: ["Accept first offer", "Ask for much higher", "Research market rate first", "Avoid discussing"], ans: 2 },
    { q: "Best time to ask your own questions:", opts: ["Beginning", "End", "Never", "During their question"], ans: 1 },
    { q: "Thank you email after interview should be sent:", opts: ["1 week later", "Before interview", "Within 24 hours", "Not needed"], ans: 2 },
    { q: "When describing conflict at work, you should:", opts: ["Blame the other person", "Say you had no conflicts", "Explain situation and resolution", "Avoid topic"], ans: 2 },
    { q: "2-minute rule for interviews means:", opts: ["Ask questions every 2 min", "Keep each answer under 2 min", "Think 2 min before answering", "Interview lasts 2 min"], ans: 1 },
    { q: "If asked an illegal interview question, you can:", opts: ["Must answer it", "Decline politely", "Walk out immediately", "File lawsuit on spot"], ans: 1 },
  ],
};

const pickRandom = (type, count = 10) => {
  const pool = questionBanks[type] || questionBanks.aptitude;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length)).map(item => ({
    question: item.q,
    options:  item.opts,
    correct:  item.ans,
  }));
};

const getMockQuestions = async (req, res) => {
  try {
    const { type = 'aptitude', count = 10 } = req.query;
    const questions = pickRandom(type, parseInt(count));
    res.json({ success: true, questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const submitMockTest = async (req, res) => {
  try {
    const { type, difficulty, questions, userAnswers, timeTaken } = req.body;

    if (!questions || !userAnswers) {
      return res.status(400).json({ success: false, message: 'Questions and answers required' });
    }

    let correct = 0;
    const gradedQs = questions.map((q, i) => {
      const isRight = userAnswers[i] === q.correct;
      if (isRight) correct++;
      return {
        question: q.question,
        options:  q.options,
        correct:  q.correct,
        userAns:  userAnswers[i] ?? -1,
        isRight,
      };
    });

    const accuracy = Math.round((correct / questions.length) * 100);

    const analysis = {
      accuracy,
      strongTopics: accuracy >= 70 ? ['Core concepts', 'Problem solving'] : [],
      weakTopics:   accuracy < 50  ? ['Fundamental concepts', 'Practice more'] : [],
      suggestion:
        accuracy >= 80 ? 'Excellent! Strong knowledge in this area.'
        : accuracy >= 60 ? 'Good. Review the questions you got wrong.'
        : accuracy >= 40 ? 'Average. Focus on core concepts more.'
        : 'Needs practice. Go through basics and try again.',
    };

    const test = await MockTest.create({
      user:       req.user._id,
      type,
      difficulty: difficulty || 'medium',
      questions:  gradedQs,
      score:      correct,
      totalQ:     questions.length,
      timeTaken:  timeTaken || 0,
      analysis,
    });

    // ── Increment daily usage ──────────────────────────────────────
    try {
      const User = require('../models/User');
      if (req.userDoc) {
        req.userDoc.dailyUsage.tests = (req.userDoc.dailyUsage.tests || 0) + 1;
        req.userDoc.stats.totalMockTests = (req.userDoc.stats.totalMockTests || 0) + 1;
        await req.userDoc.save();
      } else {
        await User.findByIdAndUpdate(req.user._id, {
          $inc: { 'dailyUsage.tests': 1, 'stats.totalMockTests': 1 },
        });
      }
    } catch (usageErr) {
      console.error('[mockController] Usage update failed:', usageErr.message);
    }

    res.status(201).json({ success: true, test, score: correct, total: questions.length, accuracy });
  } catch (err) {
    console.error('submitMockTest error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMockHistory = async (req, res) => {
  try {
    const tests = await MockTest.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(15);
    res.json({ success: true, tests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMockQuestions, submitMockTest, getMockHistory };
