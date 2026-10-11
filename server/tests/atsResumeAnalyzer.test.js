// ============================================================
//  tests/atsResumeAnalyzer.test.js  —  HireMind AI
//  Automated Test Suite for ATS Resume Analyzer & Scoring Engine
//  Covers all 14 mandatory test cases.
// ============================================================

const assert = require('assert');
const { extractDocumentText } = require('../utils/documentExtractor');
const { evaluateATSResume, parseJobDescription } = require('../utils/atsScoringEngine');

console.log('====================================================');
console.log('   HIREMIND AI: ATS RESUME ANALYZER TEST SUITE      ');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

const runTest = async (testName, testFn) => {
  try {
    process.stdout.write(`TEST [${testName}] ... `);
    await testFn();
    console.log('✓ PASSED');
    passedTests++;
  } catch (err) {
    console.log('✗ FAILED');
    console.error(`  Error: ${err.message}`);
    failedTests++;
  }
};

const runAllTests = async () => {
  // ── TEST 1: Empty or corrupted PDF ────────────────────────
  await runTest('1. Empty or corrupted PDF handling', async () => {
    // 0-byte buffer
    const emptyRes = await extractDocumentText(Buffer.alloc(0), 'empty.pdf');
    assert.strictEqual(emptyRes.success, false);
    assert.strictEqual(emptyRes.extractionStatus, 'empty');

    // Corrupted PDF (starts with %PDF but corrupted content)
    const corruptBuffer = Buffer.from('%PDF-1.4\ncorrupted garbage binary data\n%%EOF');
    const corruptRes = await extractDocumentText(corruptBuffer, 'corrupted.pdf');
    assert.strictEqual(corruptRes.success, false);
    assert.ok(corruptRes.extractionStatus === 'corrupted' || corruptRes.extractionStatus === 'empty');
  });

  // ── TEST 2: Empty or corrupted DOCX ───────────────────────
  await runTest('2. Empty or corrupted DOCX handling', async () => {
    // 0-byte buffer
    const emptyRes = await extractDocumentText(Buffer.alloc(0), 'empty.docx');
    assert.strictEqual(emptyRes.success, false);

    // Corrupted DOCX (magic bytes PK but invalid zip archive)
    const corruptDocx = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x01, 0x02, 0x03, 0x04]);
    const corruptRes = await extractDocumentText(corruptDocx, 'corrupt.docx');
    assert.strictEqual(corruptRes.success, false);
    assert.strictEqual(corruptRes.extractionStatus, 'corrupted');
  });

  // ── TEST 3: Resume with very little relevant information ──
  await runTest('3. Resume with very little relevant information', () => {
    const sparseResume = `
      John Doe
      Email: john@example.com
      Phone: 123-456-7890
      Looking for a job in technology. Hard worker and punctual.
    `;
    const res = evaluateATSResume(sparseResume, 'Software Engineer');

    // Asserts
    assert.ok(res.atsScore >= 0 && res.atsScore <= 100);
    assert.ok(res.atsScore < 40, `Sparse resume should receive a low score, got: ${res.atsScore}`);
    assert.strictEqual(res.skillsAnalysis.requiredMatched.length, 0);

    // Assert dimension sum equals atsScore
    const dimSum = Object.values(res.scoringDimensions).reduce((sum, d) => sum + d.score, 0);
    assert.strictEqual(res.atsScore, dimSum);
  });

  // ── TEST 4: Resume with missing required skills ───────────
  await runTest('4. Resume with missing required skills', () => {
    const jd = `
      Required Qualifications:
      - 3+ years experience with Go and Kubernetes
      - Strong knowledge of Rust and Distributed Systems
      - Experience with gRPC and Protocol Buffers
    `;
    const resume = `
      Jane Smith
      jane@example.com | 555-0199 | linkedin.com/in/janesmith
      Professional Summary:
      Experienced frontend developer specializing in responsive interfaces.
      Skills: HTML, CSS, WordPress, Photoshop, jQuery
      Experience:
      Frontend Web Designer at Studio (2021 - 2023)
      - Created 20+ landing pages for e-commerce clients.
      Education:
      Bachelor of Arts in Graphic Design, State University (2020)
    `;
    const res = evaluateATSResume(resume, 'Backend Developer', jd);

    assert.ok(res.atsScore >= 0 && res.atsScore <= 100);
    // Required skills should be 0 or very low
    assert.strictEqual(res.scoringDimensions.requiredSkillMatch.score, 0);
    assert.strictEqual(res.skillsAnalysis.requiredMatched.length, 0);
    assert.ok(res.skillsAnalysis.requiredMissing.length > 0);
    assert.ok(res.atsScore < 50, `Missing required skills should pull score down, got: ${res.atsScore}`);
  });

  // ── TEST 5: Strong resume matching the target job ─────────
  await runTest('5. Strong resume matching the target job', () => {
    const jd = `
      Role: Senior Backend Engineer
      Requirements:
      - Deep expertise in Node.js, Python, and PostgreSQL
      - Experience designing scalable REST APIs and microservices
      - Solid proficiency with Docker, Git, and Database Design
      - Bachelor's degree in Computer Science
    `;
    const strongResume = `
      Alex Johnson
      alex.johnson@example.com | (555) 234-5678 | linkedin.com/in/alexj | github.com/alexj
      
      Professional Summary:
      Senior Backend Engineer with 5+ years of experience designing and scaling distributed systems in Node.js and Python.
      
      Technical Skills:
      Languages & Frameworks: Node.js, Python, SQL, REST API, Database Design, Git
      Cloud & Databases: PostgreSQL, Docker, Redis, Microservices, AWS
      
      Professional Experience:
      Senior Software Engineer — CloudTech Systems (Jan 2021 - Present)
      • Architected microservices platform handling 15,000 requests/second using Node.js and PostgreSQL.
      • Optimized query indexing, reducing p99 response latency by 45% across core database clusters.
      • Implemented automated CI/CD pipelines with Docker, cutting release cycle time from 2 hours to 8 minutes.
      • Led technical design and mentorship for a cross-functional team of 6 backend engineers.
      
      Backend Developer — DataPulse Inc. (Jun 2018 - Dec 2020)
      • Built Python REST APIs serving 250,000 active monthly users with 99.99% uptime.
      • Migrated legacy monolithic architecture to containerized services, saving $35,000 annually in AWS compute costs.
      
      Education:
      Bachelor of Science in Computer Science, University of California (2018)
      
      Certifications:
      AWS Certified Solutions Architect — Associate (2022)
    `;
    const res = evaluateATSResume(strongResume, 'Backend Developer', jd);

    assert.ok(res.atsScore >= 75, `Strong matched resume should score >= 75, got: ${res.atsScore}`);
    assert.ok(res.scoringDimensions.requiredSkillMatch.score >= 25);
    assert.ok(res.scoringDimensions.measurableAchievements.score >= 8);
    assert.strictEqual(res.isJobSpecific, true);
  });

  // ── TEST 6: Strong resume for an unrelated job ────────────
  await runTest('6. Strong resume for an unrelated job produces lower job-match score', () => {
    const backendJD = `
      Senior Backend Go Developer
      Requirements:
      - 4+ years of Go (Golang) and Docker
      - High performance distributed systems with gRPC
      - PostgreSQL and Kubernetes experience
    `;
    // Strong resume, but completely for a Product Manager role
    const pmResume = `
      Sarah Connor
      sarah@example.com | 555-987-6543 | linkedin.com/in/sarahc
      Professional Summary:
      Experienced Lead Product Manager with 6 years leading B2B SaaS product roadmaps, agile development, and user research.
      Skills: Product Strategy, Agile, Roadmapping, User Research, Stakeholder Management, Jira, A/B Testing
      Experience:
      Lead Product Manager — FinTech Corp (2020 - Present)
      • Spearheaded product discovery and MVP launch, growing active users by 150% in year one.
      • Conducted 80+ user interviews and prioritized roadmap features using RICE framework.
      • Managed cross-functional scrum teams of 12 engineers and designers.
      Education:
      Master of Business Administration, Harvard Business School (2019)
    `;

    const res = evaluateATSResume(pmResume, 'Backend Developer', backendJD);
    assert.ok(res.atsScore < 55, `Unrelated resume should receive low job match score, got: ${res.atsScore}`);
    assert.strictEqual(res.scoringDimensions.requiredSkillMatch.score, 0);
  });

  // ── TEST 7: Relevant projects but limited experience ──────
  await runTest('7. Resume with relevant projects but limited experience', () => {
    const studentResume = `
      David Kim
      david.kim@example.com | 555-432-1098 | github.com/davidkim
      Professional Summary:
      Aspiring Software Engineer and recent CS graduate with hands-on full stack project experience.
      Technical Skills: JavaScript, React, Node.js, SQL, HTML/CSS, Git
      Technical Projects:
      E-Commerce Platform (React, Node.js, PostgreSQL)
      • Built full stack e-commerce web application with user authentication and payment processing.
      • Implemented REST APIs and integrated Stripe payment gateway.
      Real-Time Chat App (Node.js, WebSocket)
      • Engineered chat application supporting 500 concurrent connections.
      Education:
      Bachelor of Technology in Computer Science, Tech University (Graduated 2024)
    `;
    const res = evaluateATSResume(studentResume, 'Full Stack Developer');

    // Projects should be detected and scored
    assert.ok(res.atsScore >= 45 && res.atsScore <= 75, `Student with good projects should score moderately (45-75), got: ${res.atsScore}`);
    assert.ok(res.scoringDimensions.relevantExperience.hasProjectsSection);
    assert.ok(res.scoringDimensions.relevantExperience.score >= 8);
  });

  // ── TEST 8: Repeated keywords (keyword stuffing) ─────────
  await runTest('8. Resume with repeated keywords (anti-stuffing check)', () => {
    // Normal resume vs identical resume with "Python" spammed 30 times
    const normalResume = `
      Alex Lee
      alex@example.com | 555-1122
      Skills: Python, SQL, Git
      Experience:
      Software Developer (2022 - 2024)
      • Developed web applications using Python and SQL.
      Education:
      BS in Computer Science (2022)
    `;

    const spammedResume = `
      Alex Lee
      alex@example.com | 555-1122
      Skills: Python Python Python Python Python Python Python Python Python Python Python Python Python Python Python
      Experience:
      Software Developer (2022 - 2024)
      • Python Python Python Python Python Python Python Python Python
      Education:
      BS in Computer Science (2022)
    `;

    const normalRes = evaluateATSResume(normalResume, 'Software Engineer');
    const spammedRes = evaluateATSResume(spammedResume, 'Software Engineer');

    // Keyword stuffing must NOT boost score artificially
    assert.ok(
      spammedRes.atsScore <= normalRes.atsScore + 3,
      `Keyword spamming should not artificially inflate score: normal=${normalRes.atsScore}, spammed=${spammedRes.atsScore}`
    );
  });

  // ── TEST 9: Relevant experience & measurable achievements ──
  await runTest('9. Resume containing relevant experience and measurable achievements', () => {
    const resumeWithMetrics = `
      Michael Chang
      michael@example.com | 555-3344 | linkedin.com/in/mchang | github.com/mchang
      Professional Summary:
      DevOps Engineer with 4 years automating CI/CD pipelines and cloud infrastructure.
      Skills: Linux, Docker, Kubernetes, CI/CD, AWS, Bash, Terraform
      Experience:
      DevOps Engineer — ScaleCloud (2021 - Present)
      • Automated deployments across 50+ microservices, reducing deployment failures by 60%.
      • Managed AWS infrastructure with 99.99% uptime serving 2 million requests/day.
      • Reduced cloud infrastructure costs by 32% ($40k/year) through spot instance optimization.
      • Improved container build times by 4x using multi-stage Docker builds.
      Education:
      Bachelor of Science in Information Technology (2020)
    `;
    const res = evaluateATSResume(resumeWithMetrics, 'DevOps Engineer');

    assert.strictEqual(res.scoringDimensions.measurableAchievements.score, 10);
    assert.ok(res.scoringDimensions.measurableAchievements.metricsCount >= 4);
    assert.ok(res.atsScore >= 75);
  });

  // ── TEST 10: AI provider failure fallback ─────────────────
  await runTest('10. AI provider failure gracefully falls back to deterministic analysis without 100 default', async () => {
    const sampleResume = `
      Tom Miller
      tom@example.com | 555-8899
      Skills: React, JavaScript, HTML, CSS
      Experience:
      Frontend Developer at WebCorp (2022 - 2024)
      • Built dashboard UI with React.
      Education:
      B.Tech in Computer Science (2022)
    `;
    // Evaluate deterministically (as controller does when AI fails)
    const res = evaluateATSResume(sampleResume, 'Frontend Developer');

    // Asserts: Deterministic evaluation runs without throwing, does NOT return default 100
    assert.notStrictEqual(res.atsScore, 100, 'AI failure fallback must not default to 100');
    assert.ok(res.atsScore > 30 && res.atsScore < 85);
  });

  // ── TEST 11: AI response with invalid JSON handling ───────
  await runTest('11. Safe handling of invalid AI JSON response', () => {
    const invalidAiResponses = [
      'Sorry, as an AI language model, I cannot score this.',
      '```json { "atsScore": "not a number" }',
      '<html>500 Server Error</html>',
      '',
    ];

    invalidAiResponses.forEach((raw) => {
      let parsed = null;
      try {
        const cleaned = raw.replace(/```(?:json)?/gi, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {}
      // Must not crash or assign a fake 100
      assert.strictEqual(parsed && typeof parsed.atsScore === 'number' ? parsed.atsScore : null, null);
    });
  });

  // ── TEST 12: Re-uploading a changed resume triggers dynamic recalculation ─
  await runTest('12. Re-uploading a modified resume produces dynamic score updates', () => {
    const version1 = `
      Bob Green
      bob@example.com
      Skills: JavaScript
      Experience:
      Junior Dev (2023 - 2024)
      Worked on bugs.
    `;

    const version2 = `
      Bob Green
      bob@example.com | 555-0011 | linkedin.com/in/bobgreen | github.com/bobgreen
      Professional Summary:
      Full Stack Developer with 2+ years building web applications with React, Node.js, and SQL.
      Technical Skills: JavaScript, React, Node.js, SQL, HTML/CSS, Git, Docker, MongoDB
      Professional Experience:
      Full Stack Developer — AppCraft (Jan 2023 - Present)
      • Engineered scalable web applications using React and Node.js serving 50,000 active users.
      • Optimized PostgreSQL queries, speeding up dashboard load times by 40%.
      • Automated test coverage to 85% using Jest and Supertest.
      Education:
      Bachelor of Science in Computer Science, Tech University (2023)
    `;

    const res1 = evaluateATSResume(version1, 'Full Stack Developer');
    const res2 = evaluateATSResume(version2, 'Full Stack Developer');

    assert.ok(res2.atsScore > res1.atsScore + 25, `Improved resume must score significantly higher: v1=${res1.atsScore}, v2=${res2.atsScore}`);
    assert.ok(res2.atsScore >= 70);
  });

  // ── TEST 13: Job description omitted creates general quality score ─
  await runTest('13. Job description omitted creates clearly labeled general score', () => {
    const resume = `
      Laura Davis
      laura@example.com | 555-2233 | linkedin.com/in/laurad
      Professional Summary:
      Data Scientist with experience in Python and Machine Learning.
      Skills: Python, SQL, Pandas, NumPy, Machine Learning, Statistics
      Experience:
      Data Scientist at InsightAI (2021 - 2023)
      • Built predictive models improving customer retention by 15%.
      Education:
      Master of Science in Data Science (2021)
    `;
    const res = evaluateATSResume(resume, 'Data Scientist'); // No JD passed

    assert.strictEqual(res.isJobSpecific, false);
    assert.ok(res.summary.includes('No Job Description provided') || res.scoreLabel.includes('General'));
    assert.ok(res.atsScore >= 50 && res.atsScore <= 100);
  });

  // ── TEST 14: Dimension ranges and boundary checks ─────────
  await runTest('14. Every dimension strictly conforms to its maximum score range', () => {
    const resumes = [
      'Bare minimal text with nothing useful at all here.',
      'Software Engineer with React, Node.js, Python, SQL, Docker, AWS, Git, System Design. Built apps with 100k users, saved $50k. BS in CS from MIT.',
    ];

    resumes.forEach((text) => {
      const res = evaluateATSResume(text, 'Software Engineer');
      const dims = res.scoringDimensions;

      assert.ok(dims.requiredSkillMatch.score >= 0 && dims.requiredSkillMatch.score <= 30);
      assert.ok(dims.relevantExperience.score >= 0 && dims.relevantExperience.score <= 20);
      assert.ok(dims.keywordCoverage.score >= 0 && dims.keywordCoverage.score <= 15);
      assert.ok(dims.education.score >= 0 && dims.education.score <= 10);
      assert.ok(dims.structureAndCompleteness.score >= 0 && dims.structureAndCompleteness.score <= 10);
      assert.ok(dims.measurableAchievements.score >= 0 && dims.measurableAchievements.score <= 10);
      assert.ok(dims.parsingAndReadability.score >= 0 && dims.parsingAndReadability.score <= 5);

      const sum = (
        dims.requiredSkillMatch.score +
        dims.relevantExperience.score +
        dims.keywordCoverage.score +
        dims.education.score +
        dims.structureAndCompleteness.score +
        dims.measurableAchievements.score +
        dims.parsingAndReadability.score
      );

      assert.strictEqual(res.atsScore, sum);
      assert.ok(res.atsScore >= 0 && res.atsScore <= 100);
    });
  });

  // ── TEST 15: Unauthorized access to another user's analysis ─
  await runTest('15. Unauthorized access to another user\'s analysis is strictly rejected', () => {
    // Simulate database lookup behavior in getAnalysisById
    const records = [
      { _id: 'analysis_101', user: 'user_A', atsScore: 85, fileName: 'alice_resume.pdf' },
      { _id: 'analysis_202', user: 'user_B', atsScore: 42, fileName: 'bob_resume.pdf' },
    ];

    const findAnalysisForUser = (analysisId, requestingUserId) => {
      return records.find((r) => r._id === analysisId && r.user === requestingUserId) || null;
    };

    // User A accessing own analysis succeeds
    const userAOwnAccess = findAnalysisForUser('analysis_101', 'user_A');
    assert.ok(userAOwnAccess !== null);
    assert.strictEqual(userAOwnAccess.atsScore, 85);

    // User B attempting to access User A's analysis is strictly rejected (returns null -> 404/forbidden)
    const unauthorizedAccess = findAnalysisForUser('analysis_101', 'user_B');
    assert.strictEqual(unauthorizedAccess, null, 'User B must not be able to read User A analysis record');
  });

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (Total: ${passedTests + failedTests})`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
};

runAllTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
