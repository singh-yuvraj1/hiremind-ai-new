// ============================================================
//  utils/atsScoringEngine.js  —  HireMind AI
//  Deterministic, transparent ATS scoring engine.
//  7 Configurable Scoring Dimensions (Total: 100 points):
//    1. Required skill match:               30 points
//    2. Relevant experience & project evidence: 20 points
//    3. Job-description keyword coverage:    15 points
//    4. Education & relevant qualifications: 10 points
//    5. Resume structure & section completeness: 10 points
//    6. Evidence of measurable achievements: 10 points
//    7. Basic parsing and readability:        5 points
// ============================================================

/**
 * Standard Tech Domain Taxonomy for role-specific fallback
 */
const ROLE_SKILL_PROFILES = {
  'Software Engineer': {
    required: ['Data Structures', 'Algorithms', 'System Design', 'Git', 'SQL', 'Testing'],
    preferred: ['Docker', 'CI/CD', 'Linux', 'Microservices', 'REST API', 'Design Patterns'],
    keywords: ['oop', 'concurrency', 'debugging', 'scalability', 'refactoring', 'code review', 'unit test', 'integration test', 'agile', 'database', 'api', 'performance'],
  },
  'Frontend Developer': {
    required: ['JavaScript', 'HTML', 'CSS', 'React', 'TypeScript', 'Responsive Design'],
    preferred: ['Redux', 'Tailwind CSS', 'Next.js', 'Webpack', 'Vite', 'GraphQL', 'Jest'],
    keywords: ['dom', 'ui/ux', 'accessibility', 'wcag', 'cross-browser', 'state management', 'css3', 'html5', 'web performance', 'single page application'],
  },
  'Backend Developer': {
    required: ['Node.js', 'Python', 'SQL', 'REST API', 'Database Design', 'Git'],
    preferred: ['PostgreSQL', 'MongoDB', 'Docker', 'Redis', 'Microservices', 'AWS', 'Authentication'],
    keywords: ['jwt', 'oauth', 'orm', 'kafka', 'rabbitmq', 'caching', 'serverless', 'scalability', 'linux', 'ci/cd', 'concurrency', 'data modeling'],
  },
  'Full Stack Developer': {
    required: ['JavaScript', 'React', 'Node.js', 'SQL', 'HTML/CSS', 'Git'],
    preferred: ['TypeScript', 'MongoDB', 'PostgreSQL', 'Docker', 'REST API', 'AWS', 'Express'],
    keywords: ['full stack', 'frontend', 'backend', 'api integration', 'state management', 'orm', 'ci/cd', 'deployment', 'testing', 'responsive design'],
  },
  'Data Scientist': {
    required: ['Python', 'SQL', 'Pandas', 'NumPy', 'Machine Learning', 'Statistics'],
    preferred: ['Scikit-Learn', 'Data Visualization', 'Tableau', 'R', 'TensorFlow', 'A/B Testing'],
    keywords: ['eda', 'feature engineering', 'regression', 'classification', 'clustering', 'jupyter', 'hypothesis testing', 'predictive modeling', 'data cleaning'],
  },
  'ML Engineer': {
    required: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Model Deployment'],
    preferred: ['Docker', 'MLOps', 'Kubernetes', 'Hugging Face', 'AWS', 'FastAPI'],
    keywords: ['transformers', 'llm', 'computer vision', 'nlp', 'pipeline', 'distributed training', 'model serving', 'onnx', 'data engineering'],
  },
  'DevOps Engineer': {
    required: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Bash'],
    preferred: ['Terraform', 'Ansible', 'Prometheus', 'Grafana', 'GitLab', 'GitHub Actions'],
    keywords: ['infrastructure as code', 'iac', 'monitoring', 'helm', 'cloudformation', 'automation', 'security', 'high availability', 'networking', 'site reliability'],
  },
  'Product Manager': {
    required: ['Product Strategy', 'Agile', 'Roadmapping', 'User Research', 'Data Analysis', 'Stakeholder Management'],
    preferred: ['Jira', 'A/B Testing', 'OKRs', 'SQL', 'Wireframing', 'Scrum'],
    keywords: ['kpi', 'mvp', 'user stories', 'prioritization', 'customer discovery', 'cross-functional', 'go-to-market', 'market research', 'product lifecycle'],
  },
  'Mobile Developer': {
    required: ['Mobile Development', 'React Native', 'Flutter', 'iOS', 'Android', 'Git'],
    preferred: ['Swift', 'Kotlin', 'REST API', 'Firebase', 'State Management', 'App Store Deployment'],
    keywords: ['xcode', 'android studio', 'push notifications', 'offline storage', 'native modules', 'ui/ux', 'performance profiling'],
  },
  'AI Engineer': {
    required: ['Python', 'LLM', 'RAG', 'Prompt Engineering', 'Vector Database', 'API Integration'],
    preferred: ['LangChain', 'OpenAI', 'PyTorch', 'FastAPI', 'Embedding', 'Fine-Tuning'],
    keywords: ['vector search', 'pinecone', 'chroma', 'hugging face', 'transformers', 'agents', 'semantic search', 'mlops', 'evaluation'],
  },
};

/**
 * Common Skill Equivalents / Synonyms for ATS normalization
 */
const SKILL_EQUIVALENTS = {
  'react': ['react', 'react.js', 'reactjs'],
  'node.js': ['node.js', 'nodejs', 'node js', 'node'],
  'typescript': ['typescript', 'ts'],
  'javascript': ['javascript', 'js', 'es6', 'es6+'],
  'python': ['python', 'py'],
  'html/css': ['html', 'css', 'html5', 'css3'],
  'postgresql': ['postgresql', 'postgres', 'psql'],
  'mongodb': ['mongodb', 'mongo'],
  'aws': ['aws', 'amazon web services'],
  'gcp': ['gcp', 'google cloud', 'google cloud platform'],
  'docker': ['docker', 'containerization', 'containers'],
  'kubernetes': ['kubernetes', 'k8s'],
  'ci/cd': ['ci/cd', 'ci cd', 'continuous integration', 'continuous delivery', 'continuous deployment'],
  'machine learning': ['machine learning', 'ml'],
  'deep learning': ['deep learning', 'dl', 'neural networks'],
  'rest api': ['rest api', 'restful api', 'rest apis', 'restful apis', 'rest'],
  'graphql': ['graphql', 'gql'],
  'git': ['git', 'github', 'gitlab', 'version control'],
  'sql': ['sql', 'rdbms', 'relational database'],
  'vue': ['vue', 'vue.js', 'vuejs'],
  'next.js': ['next.js', 'nextjs', 'next js'],
  'tailwind css': ['tailwind', 'tailwind css', 'tailwindcss'],
  'data structures': ['data structures', 'dsa'],
  'algorithms': ['algorithms', 'algorithm design', 'dsa'],
  'system design': ['system design', 'distributed systems'],
  'llm': ['llm', 'llms', 'large language models', 'large language model'],
  'rag': ['rag', 'retrieval-augmented generation', 'retrieval augmented generation'],
};

/**
 * Normalize skill for case-insensitive and synonym matching.
 * @param {string} skill
 * @returns {string[]}
 */
const getSkillTokens = (skill) => {
  const clean = (skill || '').trim().toLowerCase();
  for (const [canonical, syns] of Object.entries(SKILL_EQUIVALENTS)) {
    if (syns.includes(clean) || canonical === clean) {
      return syns;
    }
  }
  return [clean];
};

/**
 * Check if a skill exists in a text block.
 * @param {string} textLower
 * @param {string} skill
 * @returns {boolean}
 */
const hasSkillMatch = (textLower, skill) => {
  const tokens = getSkillTokens(skill);
  return tokens.some((token) => {
    // Word boundary check
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`(^|[^a-z0-9_#+])${escaped}([^a-z0-9_#+]|$)`, 'i');
    return rx.test(textLower);
  });
};

/**
 * Extract requirements, preferred skills, and keywords from a Job Description text.
 * @param {string} jdText
 * @param {string} targetRole
 * @returns {{
 *   requiredSkills: string[],
 *   preferredSkills: string[],
 *   keywords: string[],
 *   experienceYearsRequirement: number | null,
 *   educationRequirement: string | null
 * }}
 */
const parseJobDescription = (jdText, targetRole = 'Software Engineer') => {
  if (!jdText || jdText.trim().length < 30) {
    const fallbackProfile = ROLE_SKILL_PROFILES[targetRole] || ROLE_SKILL_PROFILES['Software Engineer'];
    return {
      requiredSkills: [...fallbackProfile.required],
      preferredSkills: [...fallbackProfile.preferred],
      keywords: [...fallbackProfile.keywords],
      experienceYearsRequirement: null,
      educationRequirement: null,
      isJobSpecific: false,
    };
  }

  const cleanJD = jdText.toLowerCase();

  // Try to find sections
  const reqSectionMatch = jdText.match(/(?:requirements?|qualifications?|must have|what you(?:'ll| will)? bring|who you are|required skills?)[\s\S]*?(?:preferred|nice to have|plus|bonus|what we offer|benefits|$)/i);
  const prefSectionMatch = jdText.match(/(?:preferred|nice to have|bonus points|good to have|desired|optional)[\s\S]*?(?:what we offer|benefits|about us|responsibilities|$)/i);

  const reqText = reqSectionMatch ? reqSectionMatch[0].toLowerCase() : cleanJD;
  const prefText = prefSectionMatch ? prefSectionMatch[0].toLowerCase() : '';

  // Scan across our universal skill library
  const knownSkills = new Set();
  Object.values(ROLE_SKILL_PROFILES).forEach((p) => {
    p.required.forEach((s) => knownSkills.add(s));
    p.preferred.forEach((s) => knownSkills.add(s));
  });

  const foundRequired = [];
  const foundPreferred = [];

  knownSkills.forEach((skill) => {
    if (hasSkillMatch(cleanJD, skill)) {
      if (prefText && hasSkillMatch(prefText, skill) && !hasSkillMatch(reqText, skill)) {
        foundPreferred.push(skill);
      } else {
        foundRequired.push(skill);
      }
    }
  });

  // Extract years of experience requirement (e.g., "3+ years", "5-7 years")
  const expMatch = cleanJD.match(/(\d+)\s*(?:\+|-|\s*to\s*\d+)?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i);
  const experienceYearsRequirement = expMatch ? parseInt(expMatch[1], 10) : null;

  // Extract education requirement
  let educationRequirement = null;
  if (/master|m\.s\.|mtech|mba|phd/.test(cleanJD)) {
    educationRequirement = "Master's or advanced degree";
  } else if (/bachelor|b\.tech|b\.e\.|degree in computer science|degree/.test(cleanJD)) {
    educationRequirement = "Bachelor's degree in CS or related field";
  }

  // Extract relevant keywords
  const candidateKeywords = [
    'ci/cd', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'microservices', 'rest api', 'graphql',
    'sql', 'nosql', 'agile', 'scrum', 'git', 'testing', 'tdd', 'architecture', 'scalability',
    'performance', 'security', 'monitoring', 'cloud', 'linux', 'automation', 'leadership',
    'collaboration', 'problem solving', 'cross-functional', 'data structures', 'algorithms'
  ];
  const matchedKeywords = candidateKeywords.filter((k) => cleanJD.includes(k));

  // If too few required skills detected from raw text, backfill from target role
  const roleProfile = ROLE_SKILL_PROFILES[targetRole] || ROLE_SKILL_PROFILES['Software Engineer'];
  if (foundRequired.length < 3) {
    roleProfile.required.forEach((s) => {
      if (!foundRequired.includes(s) && foundRequired.length < 6) {
        foundRequired.push(s);
      }
    });
  }

  return {
    requiredSkills: foundRequired.length ? foundRequired : [...roleProfile.required],
    preferredSkills: foundPreferred.length ? foundPreferred : [...roleProfile.preferred],
    keywords: matchedKeywords.length >= 3 ? matchedKeywords : [...roleProfile.keywords],
    experienceYearsRequirement,
    educationRequirement,
    isJobSpecific: true,
  };
};

/**
 * Identify distinct sections and their content boundaries in a resume.
 * @param {string} text
 * @returns {{
 *   contactText: string,
 *   summaryText: string,
 *   experienceText: string,
 *   projectsText: string,
 *   skillsText: string,
 *   educationText: string,
 *   achievementsText: string
 * }}
 */
const extractResumeSections = (text) => {
  const lines = text.split('\n');
  const sections = {
    contactText: '',
    summaryText: '',
    experienceText: '',
    projectsText: '',
    skillsText: '',
    educationText: '',
    achievementsText: '',
  };

  let currentSection = 'contact';
  // Top 15 lines typically contain contact information
  sections.contactText = lines.slice(0, 15).join('\n');

  const headerPatterns = [
    { section: 'summary', regex: /^\s*(?:professional\s+summary|summary|profile|about\s+me|career\s+objective|objective)\b/i },
    { section: 'experience', regex: /^\s*(?:work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history|internships?)\b/i },
    { section: 'projects', regex: /^\s*(?:technical\s+projects|projects|personal\s+projects|key\s+projects|academic\s+projects)\b/i },
    { section: 'skills', regex: /^\s*(?:technical\s+skills|skills\s*(?:&|and)\s*technologies|skills|competencies|technologies|proficiencies)\b/i },
    { section: 'education', regex: /^\s*(?:education|academic\s+background|academic\s+qualifications|qualifications)\b/i },
    { section: 'achievements', regex: /^\s*(?:achievements|awards|certifications?|honors|publications|licenses)\b/i },
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length > 0 && trimmed.length < 50) {
      for (const { section, regex } of headerPatterns) {
        if (regex.test(trimmed)) {
          currentSection = section;
          break;
        }
      }
    }

    if (currentSection === 'summary') sections.summaryText += line + '\n';
    else if (currentSection === 'experience') sections.experienceText += line + '\n';
    else if (currentSection === 'projects') sections.projectsText += line + '\n';
    else if (currentSection === 'skills') sections.skillsText += line + '\n';
    else if (currentSection === 'education') sections.educationText += line + '\n';
    else if (currentSection === 'achievements') sections.achievementsText += line + '\n';
  }

  return sections;
};

/**
 * Score Dimension 1: Required Skill Match (0 – 30 points)
 */
const scoreRequiredSkills = (resumeTextLower, sections, requiredSkills) => {
  if (!requiredSkills || !requiredSkills.length) {
    return { score: 15, matched: [], missing: [], feedback: 'No specific required skills defined.' };
  }

  const matched = [];
  const missing = [];
  const evidenceLocations = {};

  requiredSkills.forEach((skill) => {
    if (hasSkillMatch(resumeTextLower, skill)) {
      matched.push(skill);

      // Identify supporting section
      const inSkills = hasSkillMatch(sections.skillsText.toLowerCase(), skill);
      const inExp = hasSkillMatch(sections.experienceText.toLowerCase(), skill);
      const inProj = hasSkillMatch(sections.projectsText.toLowerCase(), skill);

      const locations = [];
      if (inExp) locations.push('Experience');
      if (inProj) locations.push('Projects');
      if (inSkills) locations.push('Skills');
      if (!locations.length) locations.push('General text');

      evidenceLocations[skill] = locations;
    } else {
      missing.push(skill);
    }
  });

  const ratio = matched.length / requiredSkills.length;
  // Strictly between 0 and 30 points
  const rawScore = Math.round(ratio * 30);
  const score = Math.max(0, Math.min(30, rawScore));

  const feedback = matched.length === requiredSkills.length
    ? `Excellent coverage: Matched all ${matched.length}/${requiredSkills.length} required skills.`
    : matched.length > 0
      ? `Matched ${matched.length}/${requiredSkills.length} required skills. Missing: ${missing.slice(0, 4).join(', ')}.`
      : `Critical gap: None of the ${requiredSkills.length} required skills were found in the resume.`;

  return {
    score,
    maxScore: 30,
    matched,
    missing,
    evidenceLocations,
    ratio: Math.round(ratio * 100),
    feedback,
  };
};

/**
 * Score Dimension 2: Relevant Experience & Project Evidence (0 – 20 points)
 */
const scoreExperienceAndProjects = (resumeText, sections, matchedSkills) => {
  const textLower = resumeText.toLowerCase();
  const expLower = sections.experienceText.toLowerCase();
  const projLower = sections.projectsText.toLowerCase();

  const hasExpHeader = /\b(experience|work history|employment|internship)\b/i.test(resumeText);
  const hasProjHeader = /\b(projects|personal projects|technical projects|github\.com)\b/i.test(resumeText);

  // 1. Section Presence (0 - 4 pts)
  let presenceScore = 0;
  if (hasExpHeader && sections.experienceText.trim().length > 100) presenceScore += 2.5;
  else if (hasExpHeader) presenceScore += 1.5;

  if (hasProjHeader && sections.projectsText.trim().length > 80) presenceScore += 1.5;
  else if (hasProjHeader) presenceScore += 1.0;
  presenceScore = Math.min(4, presenceScore);

  // 2. Roles, Chronology & Dates (0 - 4 pts)
  let chronologyScore = 0;
  const roleTitleRegex = /\b(software|engineer|developer|architect|intern|lead|consultant|manager|analyst|associate|programmer|scientist|specialist|designer)\b/i;
  const dateRegex = /\b(20\d{2}|19\d{2})\s*(?:-|–|to|\/)\s*(20\d{2}|present|current)\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+20\d{2}\b/i;

  if (roleTitleRegex.test(expLower) || roleTitleRegex.test(projLower)) chronologyScore += 2;
  if (dateRegex.test(textLower)) chronologyScore += 2;

  // 3. Substantive Descriptions & Action Verbs (0 - 6 pts)
  const actionVerbs = [
    'built', 'developed', 'designed', 'architected', 'implemented', 'engineered',
    'deployed', 'optimized', 'managed', 'led', 'created', 'automated', 'migrated',
    'scaled', 'refactored', 'integrated', 'spearheaded', 'reduced', 'improved', 'maintained'
  ];
  const combinedWorkText = expLower + ' ' + projLower;
  const matchedVerbs = actionVerbs.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(combinedWorkText));

  let verbsScore = 0;
  if (matchedVerbs.length >= 6) verbsScore = 6;
  else if (matchedVerbs.length >= 4) verbsScore = 4.5;
  else if (matchedVerbs.length >= 2) verbsScore = 3;
  else if (matchedVerbs.length >= 1) verbsScore = 1.5;

  // 4. Practical Application of Skills in Work/Project Context (0 - 6 pts)
  // Check how many required/domain skills appear within experience or project descriptions
  const skillsInContext = matchedSkills.filter((s) => hasSkillMatch(combinedWorkText, s));
  let contextScore = 0;
  if (skillsInContext.length >= 5) contextScore = 6;
  else if (skillsInContext.length >= 3) contextScore = 4.5;
  else if (skillsInContext.length >= 1) contextScore = 2.5;

  const totalRaw = presenceScore + chronologyScore + verbsScore + contextScore;
  const score = Math.max(0, Math.min(20, Math.round(totalRaw)));

  let feedback = '';
  if (score >= 16) {
    feedback = 'Strong experience and project section with clear chronology, technical verbs, and contextual skill application.';
  } else if (score >= 10) {
    feedback = 'Good experience foundation. Deepen project descriptions with specific technical actions and responsibilities.';
  } else if (score >= 5) {
    feedback = 'Limited experience or project detail. Add concrete role titles, dates, and technical implementation highlights.';
  } else {
    feedback = 'No clear work experience or technical projects detected. Add structured internships, employment history, or personal projects.';
  }

  return {
    score,
    maxScore: 20,
    hasExperienceSection: hasExpHeader,
    hasProjectsSection: hasProjHeader,
    actionVerbsFound: matchedVerbs.slice(0, 6),
    skillsDemonstratedInContext: skillsInContext,
    feedback,
  };
};

/**
 * Score Dimension 3: Job-Description Keyword Coverage (0 – 15 points)
 * Anti-stuffing enabled: distinct matches evaluated; repeated keywords capped.
 */
const scoreKeywordCoverage = (resumeTextLower, targetKeywords, isJobSpecific) => {
  if (!targetKeywords || !targetKeywords.length) {
    return { score: 10, matchedKeywords: [], missingKeywords: [], feedback: 'General keyword coverage applied.' };
  }

  const wordCounts = {};
  const matchedKeywords = [];
  const missingKeywords = [];

  targetKeywords.forEach((kw) => {
    const kwLow = kw.toLowerCase();
    const rx = new RegExp(`\\b${kwLow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = resumeTextLower.match(rx);
    if (matches && matches.length > 0) {
      matchedKeywords.push(kw);
      wordCounts[kw] = matches.length;
    } else {
      missingKeywords.push(kw);
    }
  });

  // Anti-keyword-stuffing check:
  // If one keyword appears 8+ times while other keywords are absent, penalize keyword stuffing
  let stuffingFlag = false;
  for (const count of Object.values(wordCounts)) {
    if (count >= 10 && matchedKeywords.length <= 2) {
      stuffingFlag = true;
    }
  }

  const coverageRatio = matchedKeywords.length / targetKeywords.length;
  let rawScore = Math.round(coverageRatio * 15);
  if (stuffingFlag) {
    rawScore = Math.max(1, rawScore - 5);
  }
  const score = Math.max(0, Math.min(15, rawScore));

  const label = isJobSpecific ? 'Job Description Keyword Match' : 'Domain Keyword Coverage';
  const feedback = matchedKeywords.length >= Math.ceil(targetKeywords.length * 0.7)
    ? `High keyword coverage: ${matchedKeywords.length}/${targetKeywords.length} ${label.toLowerCase()} found.`
    : matchedKeywords.length >= Math.ceil(targetKeywords.length * 0.4)
      ? `Moderate keyword match (${matchedKeywords.length}/${targetKeywords.length}). Recommended keywords to add: ${missingKeywords.slice(0, 4).join(', ')}.`
      : `Low keyword coverage (${matchedKeywords.length}/${targetKeywords.length}). ATS parsers look for key terms like: ${missingKeywords.slice(0, 5).join(', ')}.`;

  return {
    score,
    maxScore: 15,
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 8),
    isJobSpecific,
    feedback,
  };
};

/**
 * Score Dimension 4: Education & Relevant Qualifications (0 – 10 points)
 */
const scoreEducation = (resumeTextLower, sections) => {
  const eduText = (sections.educationText + '\n' + resumeTextLower).toLowerCase();

  const hasDegree = /\b(bachelor|b\.?tech|b\.?e\.|b\.?s\.|bsc|master|m\.?tech|m\.?s\.|msc|mca|mba|ph\.?d|doctorate|diploma|associate)\b/i.test(eduText);
  const hasMajor = /\b(computer science|information technology|data science|electrical|software engineering|electronics|mathematics|mechanical|physics|engineering)\b/i.test(eduText);
  const hasUniversity = /\b(university|college|institute|polytechnic|iit|nit|bits|school of)\b/i.test(eduText);
  const hasYear = /\b(20[0-2]\d|19[89]\d)\b/.test(eduText);

  // Certifications
  const hasCert = /\b(certified|certification|aws certified|azure|gcp certified|ccna|comptia|coursera|udemy|deeplearning\.ai|oracle|red hat)\b/i.test(resumeTextLower);

  let score = 0;
  if (hasDegree) score += 4;
  if (hasMajor) score += 2;
  if (hasUniversity) score += 2;
  if (hasYear) score += 1;
  if (hasCert) score += 1;

  score = Math.max(0, Math.min(10, score));

  let feedback = '';
  if (score >= 8) {
    feedback = 'Complete education section with degree, discipline, and institution.';
  } else if (score >= 4) {
    feedback = 'Education found but lacks details. Include degree name, university/institution, and graduation year.';
  } else {
    feedback = 'No formal education details detected. Add your degree, major, institution, and completion year.';
  }

  return {
    score,
    maxScore: 10,
    hasDegree,
    hasMajor,
    hasUniversity,
    hasCert,
    feedback,
  };
};

/**
 * Score Dimension 5: Resume Structure & Section Completeness (0 – 10 points)
 */
const scoreStructureAndSections = (resumeText, sections) => {
  const t = resumeText.toLowerCase();

  // Contact checks
  const hasEmail = /@[a-z0-9.-]+\.[a-z]{2,}/i.test(t);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d[\d\s\-().]{8,14}\d/.test(t);
  const hasOnlineProfile = /linkedin\.com|github\.com|portfolio|[a-z0-9-]+\.(?:dev|io|me|com)/i.test(t);

  // Section header checks
  const hasSummary = sections.summaryText.trim().length > 30;
  const hasSkills = sections.skillsText.trim().length > 30 || /\b(skills|technical skills|technologies)\b/i.test(t);
  const hasExpOrProj = sections.experienceText.trim().length > 50 || sections.projectsText.trim().length > 50;

  let score = 0;
  if (hasEmail) score += 1.5;
  if (hasPhone) score += 1.5;
  if (hasOnlineProfile) score += 1.0;
  if (hasSummary) score += 2.0;
  if (hasSkills) score += 2.0;
  if (hasExpOrProj) score += 2.0;

  score = Math.max(0, Math.min(10, Math.round(score)));

  const missingElements = [];
  if (!hasEmail) missingElements.push('Professional email');
  if (!hasPhone) missingElements.push('Phone number');
  if (!hasOnlineProfile) missingElements.push('LinkedIn or GitHub URL');
  if (!hasSummary) missingElements.push('Professional summary');
  if (!hasSkills) missingElements.push('Dedicated skills section');

  const feedback = missingElements.length === 0
    ? 'Well-structured resume with all standard ATS sections and complete contact info.'
    : `Good foundation, but missing: ${missingElements.join(', ')}.`;

  return {
    score,
    maxScore: 10,
    hasEmail,
    hasPhone,
    hasOnlineProfile,
    hasSummary,
    hasSkills,
    hasExperienceOrProjects: hasExpOrProj,
    feedback,
  };
};

/**
 * Score Dimension 6: Evidence of Measurable Achievements (0 – 10 points)
 */
const scoreMeasurableAchievements = (resumeText) => {
  // Matches quantified metrics: percentages, speedup, revenue, scale, user count, etc.
  // 1. Percentages: 45%, 99.9%, 40 percent
  const percentRegex = /\b\d+(?:\.\d+)?\s*(?:%|percent\b)/gi;
  // 2. Multipliers & speedup: 4x, 10x, 3 times, 4-fold
  const multiplierRegex = /\b\d+(?:\.\d+)?\s*(?:x\b|times\b|-fold\b)/gi;
  // 3. Currency / monetary values: $35,000, $40k, €500, ₹50,000, 40k USD
  const currencyRegex = /(?:[\$€£₹]\s*\d[\d,]*(?:\.\d+)?(?:\s*[kKmMbB]|million|thousand)?|\b\d[\d,]*(?:\.\d+)?\s*(?:usd|eur|inr|dollars)\b)/gi;
  // 4. Counts with scale/users/traffic/data: 50,000 users, 250k active users, 15,000 req/s, 2 million requests, 50+ microservices
  const scaleRegex = /\b\d[\d,]*(?:\.\d+)?\s*(?:[a-zA-Z]+\s+)?(?:users|customers|clients|downloads|stars|concurrent|requests|req\/s|rps|tps|queries|endpoints|microservices|pipelines|services|nodes|events|records|rows|gb|tb|pb|mb)\b/gi;
  // 5. Quantity with plus: 50+ microservices, 100+ endpoints
  const countPlusRegex = /\b\d[\d,]*\+\s*[a-zA-Z]+/gi;
  // 6. Time/latency reductions: 250ms, 45 seconds, 8 minutes, 2 hours, 3 days
  const timeRegex = /\b\d+(?:\.\d+)?\s*(?:ms|milliseconds?|seconds?|mins?|minutes?|hours?|days?|weeks?|months?)\b/gi;

  const matches = [
    ...(resumeText.match(percentRegex) || []),
    ...(resumeText.match(multiplierRegex) || []),
    ...(resumeText.match(currencyRegex) || []),
    ...(resumeText.match(scaleRegex) || []),
    ...(resumeText.match(countPlusRegex) || []),
    ...(resumeText.match(timeRegex) || []),
  ];

  const uniqueMetrics = [...new Set(matches.map((m) => m.toLowerCase().trim()))];

  let score = 0;
  if (uniqueMetrics.length >= 4) score = 10;
  else if (uniqueMetrics.length === 3) score = 8;
  else if (uniqueMetrics.length === 2) score = 6;
  else if (uniqueMetrics.length === 1) score = 3;
  else score = 0;

  const feedback = score >= 8
    ? `Strong quantified impact (${uniqueMetrics.length} measurable metrics detected). ATS parsers and recruiters prioritize data-backed achievements.`
    : score >= 3
      ? `Found ${uniqueMetrics.length} quantified metric(s). Enhance other project and work bullet points with measurable outcomes (e.g. "improved latency by 35%", "served 10k users").`
      : 'No measurable achievements detected. Bullet points describe duties rather than impact. Add metrics like performance gains, user scale, or cost reductions.';

  return {
    score,
    maxScore: 10,
    metricsCount: uniqueMetrics.length,
    sampleMetrics: uniqueMetrics.slice(0, 5),
    feedback,
  };
};

/**
 * Score Dimension 7: Basic Parsing and Readability (0 – 5 points)
 */
const scoreParsingAndReadability = (resumeText) => {
  const words = resumeText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let score = 0;

  // 1. Appropriate length (350 - 900 words is standard 1-2 page ATS length) (up to 2 pts)
  if (wordCount >= 350 && wordCount <= 900) score += 2;
  else if (wordCount >= 200 && wordCount <= 1200) score += 1;
  else score += 0.5;

  // 2. Structured lines / bullets (up to 2 pts)
  const lines = resumeText.split('\n').filter((l) => l.trim().length > 0);
  const bulletLines = lines.filter((l) => /^[•\-\*–—\d\.]|\s*[•\-\*–—]/.test(l.trim()));
  if (bulletLines.length >= 5) score += 2;
  else if (lines.length >= 15) score += 1;

  // 3. Clean characters / formatting (up to 1 pt)
  // Low density of weird non-ASCII replacement characters
  const replacementCharCount = (resumeText.match(/[\uFFFD\u0000-\u0008\u000B\u000C\u000E-\u001F]/g) || []).length;
  if (replacementCharCount === 0) score += 1;
  else if (replacementCharCount < 5) score += 0.5;

  score = Math.max(0, Math.min(5, Math.round(score)));

  let feedback = '';
  if (wordCount < 200) {
    feedback = `Resume is very brief (${wordCount} words). A standard 1-page technical resume typically contains 400–600 words.`;
  } else if (wordCount > 1200) {
    feedback = `Resume is lengthy (${wordCount} words). Consider condensing to 1–2 pages for optimal ATS parsing.`;
  } else {
    feedback = `Optimal length (${wordCount} words) with clean structure and readable bullet points.`;
  }

  return {
    score,
    maxScore: 5,
    wordCount,
    feedback,
  };
};

/**
 * Main Deterministic ATS Scoring Function.
 *
 * @param {string} resumeText
 * @param {string} targetRole
 * @param {string} [jobDescriptionText]
 * @returns {object} Complete structured ATS evaluation result
 */
const evaluateATSResume = (resumeText, targetRole = 'Software Engineer', jobDescriptionText = '') => {
  const cleanText = (resumeText || '').trim();
  const textLower = cleanText.toLowerCase();

  // Extract sections
  const sections = extractResumeSections(cleanText);

  // Parse target job description (or role fallback)
  const jdAnalysis = parseJobDescription(jobDescriptionText, targetRole);

  // 1. Required skill match (30 pts)
  const dim1 = scoreRequiredSkills(textLower, sections, jdAnalysis.requiredSkills);

  // 2. Relevant experience & project evidence (20 pts)
  const dim2 = scoreExperienceAndProjects(cleanText, sections, dim1.matched);

  // 3. Job-description keyword coverage (15 pts)
  const dim3 = scoreKeywordCoverage(textLower, jdAnalysis.keywords, jdAnalysis.isJobSpecific);

  // 4. Education & relevant qualifications (10 pts)
  const dim4 = scoreEducation(textLower, sections);

  // 5. Resume structure & section completeness (10 pts)
  const dim5 = scoreStructureAndSections(cleanText, sections);

  // 6. Evidence of measurable achievements (10 pts)
  const dim6 = scoreMeasurableAchievements(cleanText);

  // 7. Basic parsing and readability (5 pts)
  const dim7 = scoreParsingAndReadability(cleanText);

  // Preferred skills evaluation (supplementary analysis)
  const preferredMatched = [];
  const preferredMissing = [];
  jdAnalysis.preferredSkills.forEach((s) => {
    if (hasSkillMatch(textLower, s)) preferredMatched.push(s);
    else preferredMissing.push(s);
  });

  // Calculate total score from the 7 dimensions
  const totalScore = Math.max(0, Math.min(100, Math.round(
    dim1.score +
    dim2.score +
    dim3.score +
    dim4.score +
    dim5.score +
    dim6.score +
    dim7.score
  )));

  // Generate structured strengths and weaknesses
  const strengths = [];
  const improvements = [];

  if (dim1.score >= 22) strengths.push(`Strong required skill alignment (${dim1.matched.length}/${jdAnalysis.requiredSkills.length} core skills matched).`);
  if (dim2.score >= 15) strengths.push('Substantive work experience with clear technical action verbs and practical context.');
  if (dim6.score >= 7)  strengths.push('Effective use of quantified achievements and performance metrics.');
  if (dim5.score >= 8)  strengths.push('Comprehensive resume structure with complete contact information and standard sections.');
  if (dim4.score >= 7)  strengths.push('Clear educational background and relevant academic qualifications.');
  if (dim3.score >= 11) strengths.push('Strong domain-specific keyword coverage.');
  if (!strengths.length) strengths.push('Resume extracted and parsed successfully for ATS evaluation.');

  if (dim1.missing.length > 0) {
    improvements.push({
      problem: `Missing critical required skills: ${dim1.missing.slice(0, 4).join(', ')}.`,
      whyItMatters: 'ATS keyword filters automatically rank candidates down if mandatory job skills are absent.',
      improvement: `If you have worked with ${dim1.missing.slice(0, 3).join(', ')}, add them to your Skills section and reference them in project bullet points.`,
      exampleRewrite: null,
    });
  }

  if (dim6.score < 6) {
    improvements.push({
      problem: 'Few or no quantified metrics in project and work experience descriptions.',
      whyItMatters: 'Recruiters and hiring managers spend an average of 6 seconds per resume looking for proof of tangible impact.',
      improvement: 'Add genuine measurements to your bullet points (e.g., latency reduction, user scale, team size, or volume handled).',
      exampleRewrite: 'Instead of "Developed backend API for users", write "Developed REST API serving 10,000+ daily requests, reducing response latency by 25% through Redis caching."',
    });
  }

  if (dim2.score < 12) {
    improvements.push({
      problem: 'Work experience or project descriptions lack active technical detail.',
      whyItMatters: 'ATS semantic matching looks for action verbs coupled with technologies in context, not just isolated keyword lists.',
      improvement: 'Begin bullet points with strong action verbs (Architected, Engineered, Optimized, Migrated) explaining the problem, your action, and the result.',
      exampleRewrite: null,
    });
  }

  if (!dim5.hasSummary) {
    improvements.push({
      problem: 'Missing Professional Summary section.',
      whyItMatters: 'A concise 3–4 sentence summary at the top gives recruiters immediate clarity on your core specializations and years of experience.',
      improvement: 'Add a 3-line summary highlighting your target role, top 3 technical proficiencies, and notable accomplishments.',
      exampleRewrite: null,
    });
  }

  if (dim3.missingKeywords.length > 0 && dim3.score < 10) {
    improvements.push({
      problem: `Low keyword density for key industry terms: ${dim3.missingKeywords.slice(0, 5).join(', ')}.`,
      whyItMatters: 'Applicant Tracking Systems use exact keyword matching to surface relevant candidates to recruiters.',
      improvement: `Integrate relevant keywords where truthful: ${dim3.missingKeywords.slice(0, 4).join(', ')}.`,
      exampleRewrite: null,
    });
  }

  const scoreLabel = jdAnalysis.isJobSpecific
    ? (totalScore >= 75 ? 'Strong Match for Job Description' : totalScore >= 50 ? 'Moderate Match for Job Description' : 'Low Match for Job Description')
    : (totalScore >= 75 ? 'Strong General ATS Profile' : totalScore >= 50 ? 'Moderate General ATS Profile' : 'Needs Structural Improvement');

  const summary = jdAnalysis.isJobSpecific
    ? `ATS Compatibility: ${totalScore}/100 matched against target job. Matched ${dim1.matched.length}/${jdAnalysis.requiredSkills.length} required skills. ${totalScore >= 75 ? 'Resume strongly aligns with this job description.' : 'Review missing required skills and quantified impact to improve match.'}`
    : `General ATS Quality Score: ${totalScore}/100 for ${targetRole} (No Job Description provided). ${totalScore >= 75 ? 'Clean structure and strong keyword representation.' : 'Add missing role competencies and measurable achievements.'}`;

  return {
    atsScore: totalScore,
    isJobSpecific: jdAnalysis.isJobSpecific,
    scoreLabel,
    targetRole,
    summary,
    scoringDimensions: {
      requiredSkillMatch: {
        score: dim1.score,
        maxScore: 30,
        label: 'Required Skill Match',
        weight: '30%',
        feedback: dim1.feedback,
        matched: dim1.matched,
        missing: dim1.missing,
        evidenceLocations: dim1.evidenceLocations,
      },
      relevantExperience: {
        score: dim2.score,
        maxScore: 20,
        label: 'Experience & Project Evidence',
        weight: '20%',
        feedback: dim2.feedback,
        hasExperienceSection: dim2.hasExperienceSection,
        hasProjectsSection: dim2.hasProjectsSection,
        actionVerbsFound: dim2.actionVerbsFound,
        skillsDemonstratedInContext: dim2.skillsDemonstratedInContext,
      },
      keywordCoverage: {
        score: dim3.score,
        maxScore: 15,
        label: jdAnalysis.isJobSpecific ? 'Job Description Keyword Match' : 'Domain Keyword Coverage',
        weight: '15%',
        feedback: dim3.feedback,
        matchedKeywords: dim3.matchedKeywords,
        missingKeywords: dim3.missingKeywords,
      },
      education: {
        score: dim4.score,
        maxScore: 10,
        label: 'Education & Qualifications',
        weight: '10%',
        feedback: dim4.feedback,
        hasDegree: dim4.hasDegree,
        hasMajor: dim4.hasMajor,
        hasUniversity: dim4.hasUniversity,
        hasCert: dim4.hasCert,
      },
      structureAndCompleteness: {
        score: dim5.score,
        maxScore: 10,
        label: 'Resume Structure & Completeness',
        weight: '10%',
        feedback: dim5.feedback,
        hasEmail: dim5.hasEmail,
        hasPhone: dim5.hasPhone,
        hasOnlineProfile: dim5.hasOnlineProfile,
        hasSummary: dim5.hasSummary,
        hasSkills: dim5.hasSkills,
        hasExperienceOrProjects: dim5.hasExperienceOrProjects,
      },
      measurableAchievements: {
        score: dim6.score,
        maxScore: 10,
        label: 'Measurable Achievements',
        weight: '10%',
        feedback: dim6.feedback,
        metricsCount: dim6.metricsCount,
        sampleMetrics: dim6.sampleMetrics,
      },
      parsingAndReadability: {
        score: dim7.score,
        maxScore: 5,
        label: 'Parsing & Readability',
        weight: '5%',
        feedback: dim7.feedback,
        wordCount: dim7.wordCount,
      },
    },
    // Backward compatibility for existing UI `sections` field
    sections: {
      contact: { score: Math.round(dim5.score), feedback: dim5.feedback },
      summary: { score: dim5.hasSummary ? 9 : 3, feedback: dim5.hasSummary ? 'Professional summary found.' : 'Add a clear 3–4 line professional summary.' },
      experience: { score: Math.round(dim2.score / 2), feedback: dim2.feedback },
      skills: { score: Math.round(dim1.score / 3), feedback: dim1.feedback },
      education: { score: Math.round(dim4.score), feedback: dim4.feedback },
      achievements: { score: Math.round(dim6.score), feedback: dim6.feedback },
    },
    skillsAnalysis: {
      requiredMatched: dim1.matched,
      requiredMissing: dim1.missing,
      preferredMatched,
      preferredMissing,
      evidenceLocations: dim1.evidenceLocations,
    },
    keywords: {
      found: dim3.matchedKeywords,
      missing: dim3.missingKeywords,
      soft: ['collaboration', 'problem-solving', 'leadership'].filter((s) => textLower.includes(s)),
    },
    strengths,
    improvements: improvements.map((imp) => imp.problem), // simple strings for legacy UI
    detailedImprovements: improvements,
    wordCount: dim7.wordCount,
    pagesEstimate: Math.max(1, Math.ceil(dim7.wordCount / 350)),
    limitationsNote: 'This ATS score is a deterministic compatibility estimate based on parsing, keyword matching, and structure. It does not replace human recruiter screening.',
  };
};

module.exports = {
  ROLE_SKILL_PROFILES,
  parseJobDescription,
  extractResumeSections,
  evaluateATSResume,
};
