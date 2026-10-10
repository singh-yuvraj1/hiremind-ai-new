/**
 * server/config/taxonomy.js — HireMind AI
 * Master Career Field Taxonomy, Role Mappings, Round Definitions & Metadata
 * Scalable architecture for Multi-Field Interview Preparation Platform.
 */

const CAREER_FIELDS = {
  software_development: {
    id: 'software_development',
    name: 'Software Development',
    icon: '💻',
    description: 'Frontend, Backend, Full Stack, Mobile & Core Software Engineering',
    roles: [
      {
        id: 'frontend_developer',
        title: 'Frontend Developer',
        skills: ['HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Next.js', 'Web Performance'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'backend_developer',
        title: 'Backend Developer',
        skills: ['Node.js', 'Express', 'Python', 'Java', 'Go', 'SQL', 'NoSQL', 'REST APIs', 'Microservices'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'system_design', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'fullstack_developer',
        title: 'Full Stack Developer',
        skills: ['MERN', 'MEAN', 'React', 'Node.js', 'Database Design', 'APIs', 'DevOps Basics', 'Auth'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'system_design', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'mern_stack_developer',
        title: 'MERN Stack Developer',
        skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'Redux', 'JWT', 'REST'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'mean_stack_developer',
        title: 'MEAN Stack Developer',
        skills: ['MongoDB', 'Express.js', 'Angular', 'Node.js', 'TypeScript', 'RxJS'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'python_developer',
        title: 'Python Developer',
        skills: ['Python', 'Django', 'FastAPI', 'Flask', 'AsyncIO', 'ORM', 'OOP', 'Testing'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'system_design', 'project_discussion', 'role_technical'],
      },
      {
        id: 'java_developer',
        title: 'Java Developer',
        skills: ['Core Java', 'Spring Boot', 'Hibernate', 'Microservices', 'Multithreading', 'JVM Internals'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'system_design', 'project_discussion', 'role_technical'],
      },
      {
        id: 'cpp_developer',
        title: 'C / C++ Developer',
        skills: ['C++', 'STL', 'Memory Management', 'Pointers', 'OOP', 'Data Structures', 'Embedded/Systems'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'project_discussion', 'role_technical'],
      },
      {
        id: 'mobile_developer',
        title: 'Mobile App Developer',
        skills: ['React Native', 'Flutter', 'iOS/Swift', 'Android/Kotlin', 'State Management', 'Mobile UI'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'software_engineer',
        title: 'General Software Engineer',
        skills: ['Software Design', 'Algorithms', 'Clean Code', 'Git', 'Testing', 'Problem Solving'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'system_design', 'project_discussion', 'behavioral', 'placement_mock'],
      },
    ],
  },

  dsa_and_coding: {
    id: 'dsa_and_coding',
    name: 'DSA & Coding Assessments',
    icon: '⚡',
    description: 'Data Structures, Algorithms, Problem Solving & Competitive Programming',
    roles: [
      {
        id: 'dsa_specialist',
        title: 'DSA & Problem Solving Candidate',
        skills: ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'DP', 'Recursion', 'Binary Search'],
        allowedRounds: ['dsa_coding', 'tech_fundamentals', 'placement_mock'],
      },
      {
        id: 'competitive_programmer',
        title: 'Competitive Programmer',
        skills: ['Graph Theory', 'Segment Trees', 'Dynamic Programming', 'Math & Number Theory', 'Bitmasking'],
        allowedRounds: ['dsa_coding', 'placement_mock'],
      },
    ],
  },

  cs_fundamentals: {
    id: 'cs_fundamentals',
    name: 'Computer Science Fundamentals',
    icon: '🏛️',
    description: 'Operating Systems, DBMS, Computer Networks, OOP & System Design',
    roles: [
      {
        id: 'core_cs_candidate',
        title: 'CS Core Knowledge Candidate',
        skills: ['OS Processes & Threads', 'SQL Queries & ACID', 'TCP/IP & HTTP', 'OOP Principles', 'System Architecture'],
        allowedRounds: ['tech_fundamentals', 'system_design', 'placement_mock'],
      },
      {
        id: 'system_design_candidate',
        title: 'System Design Candidate',
        skills: ['High-Level Design (HLD)', 'Low-Level Design (LLD)', 'Scalability', 'Caching', 'Load Balancers', 'Sharding'],
        allowedRounds: ['system_design', 'tech_fundamentals'],
      },
    ],
  },

  ai_and_data: {
    id: 'ai_and_data',
    name: 'AI, Machine Learning & Data',
    icon: '🤖',
    description: 'Data Science, Machine Learning, Deep Learning, Generative AI & Data Engineering',
    roles: [
      {
        id: 'data_scientist',
        title: 'Data Scientist',
        skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Statistics', 'EDA', 'Feature Engineering', 'Machine Learning'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'project_discussion', 'role_technical', 'aptitude_assessment', 'behavioral'],
      },
      {
        id: 'ml_engineer',
        title: 'Machine Learning Engineer',
        skills: ['PyTorch', 'TensorFlow', 'MLOps', 'Model Deployment', 'Docker', 'Feature Stores', 'Deep Learning'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'dsa_coding', 'system_design', 'project_discussion', 'role_technical'],
      },
      {
        id: 'data_analyst',
        title: 'Data Analyst',
        skills: ['SQL', 'Excel', 'PowerBI', 'Tableau', 'Python', 'A/B Testing', 'Statistical Inference'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'aptitude_assessment', 'project_discussion', 'behavioral'],
      },
      {
        id: 'genai_engineer',
        title: 'Generative AI & LLM Engineer',
        skills: ['LangChain', 'LlamaIndex', 'RAG Pipelines', 'Vector Databases', 'Prompt Engineering', 'Fine-tuning', 'Embeddings'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'system_design', 'project_discussion', 'role_technical'],
      },
      {
        id: 'data_engineer',
        title: 'Data Engineer',
        skills: ['Apache Spark', 'Kafka', 'Airflow', 'Data Warehousing (Snowflake/BigQuery)', 'ETL/ELT', 'Python', 'SQL'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'system_design', 'project_discussion', 'role_technical'],
      },
    ],
  },

  cloud_and_infrastructure: {
    id: 'cloud_and_infrastructure',
    name: 'Cloud, DevOps & Infrastructure',
    icon: '☁️',
    description: 'DevOps, CI/CD, Containerization, Kubernetes, AWS, Azure & Linux Systems',
    roles: [
      {
        id: 'devops_engineer',
        title: 'DevOps Engineer',
        skills: ['Linux', 'Bash', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'Terraform', 'Prometheus/Grafana', 'Git'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'system_design', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'cloud_architect',
        title: 'Cloud Solutions Architect',
        skills: ['AWS / Azure / GCP', 'High Availability', 'Disaster Recovery', 'IAM Security', 'Cost Optimization'],
        allowedRounds: ['hr_intro', 'system_design', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'site_reliability_engineer',
        title: 'Site Reliability Engineer (SRE)',
        skills: ['Incident Response', 'SLI/SLO/SLA', 'Monitoring & Observability', 'Automation', 'Chaos Engineering'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'system_design', 'project_discussion', 'role_technical'],
      },
    ],
  },

  cybersecurity: {
    id: 'cybersecurity',
    name: 'Cybersecurity & Application Security',
    icon: '🛡️',
    description: 'Network Security, Ethical Hacking, Web App Security, Cryptography & Auth',
    roles: [
      {
        id: 'security_analyst',
        title: 'Cybersecurity Analyst',
        skills: ['OWASP Top 10', 'Penetration Testing', 'SIEM', 'Threat Modeling', 'Network Protocols', 'Cryptography'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'project_discussion', 'role_technical', 'behavioral'],
      },
      {
        id: 'appsec_engineer',
        title: 'Application Security Engineer',
        skills: ['SAST/DAST', 'Secure Code Review', 'OAuth2/OIDC', 'API Security', 'Vulnerability Assessment'],
        allowedRounds: ['hr_intro', 'tech_fundamentals', 'system_design', 'project_discussion', 'role_technical'],
      },
    ],
  },

  hr_and_behavioral: {
    id: 'hr_and_behavioral',
    name: 'HR & Behavioral Interviews',
    icon: '🤝',
    description: 'STAR Method, Leadership Principles, Culture Fit, Conflict Resolution & Career Goals',
    roles: [
      {
        id: 'all_job_seekers',
        title: 'General Job Seeker / Candidate',
        skills: ['Self Introduction', 'STAR Storytelling', 'Conflict Resolution', 'Salary Negotiation', 'Culture Fit'],
        allowedRounds: ['hr_intro', 'behavioral'],
      },
      {
        id: 'tech_lead_management',
        title: 'Tech Lead / Engineering Manager',
        skills: ['People Leadership', 'Conflict De-escalation', 'Stakeholder Management', 'Cross-functional Collaboration'],
        allowedRounds: ['hr_intro', 'behavioral', 'project_discussion'],
      },
    ],
  },

  aptitude_and_placements: {
    id: 'aptitude_and_placements',
    name: 'Aptitude & Campus Placements',
    icon: '📊',
    description: 'Quantitative Aptitude, Logical Reasoning, Verbal Ability & Company Placement Tests',
    roles: [
      {
        id: 'campus_placement_candidate',
        title: 'Campus Placement Candidate',
        skills: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal English', 'Data Interpretation', 'Pseudocode'],
        allowedRounds: ['aptitude_assessment', 'placement_mock', 'hr_intro', 'tech_fundamentals'],
      },
      {
        id: 'service_company_aspirant',
        title: 'TCS / Infosys / Wipro / Accenture Aspirant',
        skills: ['Numerical Ability', 'Reasoning Ability', 'Verbal Ability', 'Coding Round'],
        allowedRounds: ['aptitude_assessment', 'placement_mock', 'hr_intro'],
      },
    ],
  },
};

/* ══════════════════════════════════════════════════════════════════
   INTERVIEW ROUND DEFINITIONS
   ══════════════════════════════════════════════════════════════════ */

const INTERVIEW_ROUNDS = {
  hr_intro: {
    id: 'hr_intro',
    name: 'HR Introduction Round',
    icon: '🤝',
    desc: 'Self introduction, career trajectory, background & initial screening',
    supportedModes: ['voice', 'typing'],
    evaluationStrategy: 'hr_behavioral',
    defaultQuestionCount: 3,
  },
  tech_fundamentals: {
    id: 'tech_fundamentals',
    name: 'Technical Fundamentals',
    icon: '💻',
    desc: 'Core language concepts, framework internals, databases, protocols & debugging',
    supportedModes: ['typing', 'voice'],
    evaluationStrategy: 'technical_rag',
    defaultQuestionCount: 5,
  },
  dsa_coding: {
    id: 'dsa_coding',
    name: 'DSA & Live Coding Round',
    icon: '⚡',
    desc: 'Algorithmic problem solving, complexity analysis & edge-case handling',
    supportedModes: ['code_editor', 'typing'],
    evaluationStrategy: 'dsa_code_execution',
    defaultQuestionCount: 3,
  },
  project_discussion: {
    id: 'project_discussion',
    name: 'Project Deep-Dive & Architecture',
    icon: '📁',
    desc: 'Technical trade-offs, architecture decisions, hurdles overcome & real-world impact',
    supportedModes: ['voice', 'typing'],
    evaluationStrategy: 'technical_rag',
    defaultQuestionCount: 4,
  },
  system_design: {
    id: 'system_design',
    name: 'System Design (HLD / LLD)',
    icon: '🏗️',
    desc: 'Scalability, microservices, database sharding, caching & distributed architectures',
    supportedModes: ['typing', 'voice'],
    evaluationStrategy: 'system_design_rubric',
    defaultQuestionCount: 3,
  },
  behavioral: {
    id: 'behavioral',
    name: 'Behavioral & Leadership (STAR)',
    icon: '🌟',
    desc: 'Situational judgment, leadership principles, conflict management & team dynamics',
    supportedModes: ['voice', 'typing'],
    evaluationStrategy: 'hr_behavioral',
    defaultQuestionCount: 4,
  },
  aptitude_assessment: {
    id: 'aptitude_assessment',
    name: 'Aptitude & Reasoning Assessment',
    icon: '📊',
    desc: 'Timed quantitative, logical reasoning, data interpretation & verbal tests',
    supportedModes: ['mcq'],
    evaluationStrategy: 'aptitude_deterministic',
    defaultQuestionCount: 10,
  },
  role_technical: {
    id: 'role_technical',
    name: 'Role-Specific Deep Technical Interview',
    icon: '🎯',
    desc: 'Specialized questions for the exact chosen role (e.g. GenAI, DevOps, Data Science)',
    supportedModes: ['typing', 'voice'],
    evaluationStrategy: 'technical_rag',
    defaultQuestionCount: 5,
  },
  placement_mock: {
    id: 'placement_mock',
    name: 'Comprehensive Mock Placement Test',
    icon: '🏆',
    desc: 'End-to-end simulated company placement drive combining Aptitude, DSA & Core CS',
    supportedModes: ['mcq', 'code_editor', 'typing'],
    evaluationStrategy: 'composite_mock',
    defaultQuestionCount: 12,
  },
};

/* ══════════════════════════════════════════════════════════════════
   EVALUATION STRATEGY SPECS
   ══════════════════════════════════════════════════════════════════ */

const EVALUATION_STRATEGIES = {
  technical_rag: {
    id: 'technical_rag',
    name: 'Technical RAG & Concept Matching',
    description: 'Evaluates answers using TF-IDF concept extraction, semantic similarity against reference answers, and LLM verification.',
    metrics: ['technicalAccuracy', 'conceptCoverage', 'clarity', 'depth'],
  },
  dsa_code_execution: {
    id: 'dsa_code_execution',
    name: 'DSA Test Case & Complexity Evaluation',
    description: 'Validates code syntax, runs against hidden test cases, computes time/space complexity, and reviews algorithmic efficiency.',
    metrics: ['testCasesPassed', 'timeComplexity', 'spaceComplexity', 'codeQuality', 'edgeCaseHandling'],
  },
  hr_behavioral: {
    id: 'hr_behavioral',
    name: 'STAR Method & Behavioral Evaluation',
    description: 'Analyzes answer structure (Situation, Task, Action, Result), relevance to question, clarity of communication, and concrete examples.',
    metrics: ['starStructure', 'relevance', 'actionClarity', 'outcomeDemonstrated', 'communication'],
  },
  system_design_rubric: {
    id: 'system_design_rubric',
    name: 'System Design Architecture Evaluation',
    description: 'Evaluates functional/non-functional requirements, API contracts, data models, scalability choices (caching, load balancing, databases), and single points of failure.',
    metrics: ['requirementsClarification', 'architectureDesign', 'scalabilityTradeoffs', 'dataStorageChoice', 'bottleneckAnalysis'],
  },
  aptitude_deterministic: {
    id: 'aptitude_deterministic',
    name: 'Deterministic Objective Scoring',
    description: 'Evaluates MCQ and numerical answers against verified answer keys with accuracy percentage, speed tracking, and detailed explanations.',
    metrics: ['accuracyPercentage', 'timePerQuestion', 'speedScore', 'categoryStrengths'],
  },
  composite_mock: {
    id: 'composite_mock',
    name: 'Composite Multi-Section Evaluation',
    description: 'Combines section-wise deterministic, algorithmic, and conceptual scoring into a normalized company placement percentile.',
    metrics: ['overallPercentile', 'sectionWiseScores', 'placementReadiness', 'keyRecommendations'],
  },
};

module.exports = {
  CAREER_FIELDS,
  INTERVIEW_ROUNDS,
  EVALUATION_STRATEGIES,
};
