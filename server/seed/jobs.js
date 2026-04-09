const Job = require('../models/Job');

const JOBS = [
  // Frontend
  { title: 'React Frontend Developer', company: 'Zomato', location: 'Bengaluru, India', type: 'Full-time', role: 'frontend', salary: '₹12–18 LPA', tags: ['React', 'TypeScript', 'CSS', 'REST API'], remote: false, featured: true, logo: '🚀' },
  { title: 'Senior UI Engineer', company: 'Razorpay', location: 'Bengaluru, India', type: 'Full-time', role: 'frontend', salary: '₹20–30 LPA', tags: ['React', 'Redux', 'Webpack', 'Performance'], remote: false, featured: false, logo: '💳' },
  { title: 'Frontend Developer (Remote)', company: 'Toptal', location: 'Remote', type: 'Contract', role: 'frontend', salary: '$60–90/hr', tags: ['React', 'Next.js', 'GraphQL', 'Tailwind'], remote: true, featured: true, logo: '🌐' },
  { title: 'Junior Frontend Developer', company: 'Swiggy', location: 'Bengaluru, India', type: 'Full-time', role: 'frontend', salary: '₹6–10 LPA', tags: ['HTML', 'CSS', 'JavaScript', 'React'], remote: false, featured: false, logo: '🍔' },
  { title: 'Vue.js Developer', company: 'Freshworks', location: 'Chennai, India', type: 'Full-time', role: 'frontend', salary: '₹15–22 LPA', tags: ['Vue.js', 'Vuex', 'TypeScript', 'REST'], remote: false, featured: false, logo: '🌿' },

  // Backend
  { title: 'Node.js Backend Engineer', company: 'CRED', location: 'Bengaluru, India', type: 'Full-time', role: 'backend', salary: '₹18–28 LPA', tags: ['Node.js', 'MongoDB', 'Redis', 'AWS'], remote: false, featured: true, logo: '💎' },
  { title: 'Python Backend Developer', company: 'Meesho', location: 'Bengaluru, India', type: 'Full-time', role: 'backend', salary: '₹14–20 LPA', tags: ['Python', 'Django', 'PostgreSQL', 'Kafka'], remote: false, featured: false, logo: '🛍️' },
  { title: 'Senior Backend Engineer (Go)', company: 'Zerodha', location: 'Bengaluru, India', type: 'Full-time', role: 'backend', salary: '₹25–40 LPA', tags: ['Go', 'Kubernetes', 'gRPC', 'PostgreSQL'], remote: false, featured: true, logo: '📈' },
  { title: 'Java Backend Developer', company: 'Paytm', location: 'Noida, India', type: 'Full-time', role: 'backend', salary: '₹12–18 LPA', tags: ['Java', 'Spring Boot', 'MySQL', 'Microservices'], remote: false, featured: false, logo: '💰' },
  { title: 'Backend Developer (Remote)', company: 'Remote-First Inc', location: 'Remote', type: 'Full-time', role: 'backend', salary: '$80–120k', tags: ['Node.js', 'PostgreSQL', 'Docker', 'CI/CD'], remote: true, featured: false, logo: '🏠' },

  // Full Stack
  { title: 'Full Stack MERN Developer', company: 'Unacademy', location: 'Bengaluru, India', type: 'Full-time', role: 'fullstack', salary: '₹12–20 LPA', tags: ['React', 'Node.js', 'MongoDB', 'Express'], remote: false, featured: true, logo: '📚' },
  { title: 'Senior Full Stack Engineer', company: 'Cure.fit', location: 'Bengaluru, India', type: 'Full-time', role: 'fullstack', salary: '₹20–32 LPA', tags: ['React', 'Python', 'PostgreSQL', 'AWS'], remote: false, featured: false, logo: '💪' },
  { title: 'Full Stack Developer (Startup)', company: 'YC-backed Startup', location: 'Mumbai, India', type: 'Full-time', role: 'fullstack', salary: '₹10–16 LPA', tags: ['Next.js', 'Prisma', 'TypeScript', 'Vercel'], remote: false, featured: false, logo: '🦄' },
  { title: 'Remote Full Stack Developer', company: 'Turing.com', location: 'Remote', type: 'Full-time', role: 'fullstack', salary: '$50–90k', tags: ['React', 'Node.js', 'PostgreSQL', 'GraphQL'], remote: true, featured: true, logo: '🌍' },

  // Data Science
  { title: 'Data Scientist', company: 'Flipkart', location: 'Bengaluru, India', type: 'Full-time', role: 'data_scientist', salary: '₹18–28 LPA', tags: ['Python', 'ML', 'Spark', 'SQL'], remote: false, featured: true, logo: '🛒' },
  { title: 'ML Engineer', company: 'Google', location: 'Hyderabad, India', type: 'Full-time', role: 'data_scientist', salary: '₹40–70 LPA', tags: ['TensorFlow', 'Python', 'GCP', 'MLOps'], remote: false, featured: true, logo: '🔍' },
  { title: 'Data Analyst', company: 'OYO Rooms', location: 'Gurugram, India', type: 'Full-time', role: 'data_scientist', salary: '₹8–14 LPA', tags: ['Python', 'SQL', 'Tableau', 'Excel'], remote: false, featured: false, logo: '🏨' },
  { title: 'NLP Scientist', company: 'MuSigma', location: 'Remote', type: 'Full-time', role: 'data_scientist', salary: '₹22–35 LPA', tags: ['NLP', 'PyTorch', 'HuggingFace', 'Python'], remote: true, featured: false, logo: '🧠' },

  // DevOps
  { title: 'DevOps Engineer (AWS)', company: 'Ola', location: 'Bengaluru, India', type: 'Full-time', role: 'devops', salary: '₹15–25 LPA', tags: ['AWS', 'Kubernetes', 'Terraform', 'CI/CD'], remote: false, featured: false, logo: '🚗' },
  { title: 'Site Reliability Engineer', company: 'PhonePe', location: 'Bengaluru, India', type: 'Full-time', role: 'devops', salary: '₹20–35 LPA', tags: ['SRE', 'Linux', 'Prometheus', 'Go'], remote: false, featured: true, logo: '📱' },
  { title: 'Cloud DevOps Engineer', company: 'TCS', location: 'Pune, India', type: 'Full-time', role: 'devops', salary: '₹8–15 LPA', tags: ['Azure', 'Docker', 'Jenkins', 'Linux'], remote: false, featured: false, logo: '☁️' },
  { title: 'Remote DevOps Consultant', company: 'Accenture', location: 'Remote', type: 'Contract', role: 'devops', salary: '₹30–50 LPA', tags: ['Multi-Cloud', 'Terraform', 'Helm', 'GitOps'], remote: true, featured: false, logo: '🔧' },

  // AI/ML
  { title: 'AI Engineer (LLMs)', company: 'Microsoft', location: 'Hyderabad, India', type: 'Full-time', role: 'aiml', salary: '₹45–80 LPA', tags: ['LLMs', 'Python', 'PyTorch', 'Azure AI'], remote: false, featured: true, logo: '🤖' },
  { title: 'Machine Learning Engineer', company: 'Amazon', location: 'Bengaluru, India', type: 'Full-time', role: 'aiml', salary: '₹35–60 LPA', tags: ['AWS', 'SageMaker', 'TensorFlow', 'Python'], remote: false, featured: true, logo: '📦' },
  { title: 'Computer Vision Engineer', company: 'Nykaa', location: 'Mumbai, India', type: 'Full-time', role: 'aiml', salary: '₹18–28 LPA', tags: ['OpenCV', 'PyTorch', 'Python', 'ONNX'], remote: false, featured: false, logo: '👁️' },
  { title: 'AI Research Scientist (Remote)', company: 'Cohere', location: 'Remote', type: 'Full-time', role: 'aiml', salary: '$120–180k', tags: ['Research', 'NLP', 'Transformers', 'PyTorch'], remote: true, featured: true, logo: '🔬' },

  // Product Manager
  { title: 'Product Manager - B2C', company: 'Dream11', location: 'Mumbai, India', type: 'Full-time', role: 'product_manager', salary: '₹20–35 LPA', tags: ['Product Strategy', 'Agile', 'Analytics', 'A/B Testing'], remote: false, featured: false, logo: '🏏' },
  { title: 'Senior Product Manager', company: 'InMobi', location: 'Bengaluru, India', type: 'Full-time', role: 'product_manager', salary: '₹30–50 LPA', tags: ['AdTech', 'Roadmap', 'SQL', 'User Research'], remote: false, featured: true, logo: '📣' },

  // General / Others
  { title: 'Software Development Engineer', company: 'Infosys', location: 'Multiple Cities', type: 'Full-time', role: 'general', salary: '₹6–12 LPA', tags: ['Java', 'SQL', 'Agile', 'Testing'], remote: false, featured: false, logo: '💼' },
  { title: 'Graduate Software Engineer', company: 'Wipro', location: 'Bengaluru, India', type: 'Full-time', role: 'general', salary: '₹3.5–5 LPA', tags: ['Fresher', 'Java', 'SQL', 'Team Player'], remote: false, featured: false, logo: '🎓' },
  { title: 'Tech Lead (Remote)', company: 'Remote.co', location: 'Remote', type: 'Full-time', role: 'fullstack', salary: '$100–150k', tags: ['Architecture', 'Mentoring', 'React', 'Node.js'], remote: true, featured: true, logo: '👨‍💻' },
  { title: 'iOS Mobile Developer', company: 'Byju\'s', location: 'Bengaluru, India', type: 'Full-time', role: 'mobile', salary: '₹12–20 LPA', tags: ['Swift', 'iOS', 'Xcode', 'CoreData'], remote: false, featured: false, logo: '📱' },
  { title: 'Android Developer', company: 'Sharechat', location: 'Bengaluru, India', type: 'Full-time', role: 'mobile', salary: '₹14–22 LPA', tags: ['Kotlin', 'Android', 'Jetpack Compose', 'CI/CD'], remote: false, featured: false, logo: '🤳' },
  { title: 'Cybersecurity Analyst', company: 'QuickHeal', location: 'Pune, India', type: 'Full-time', role: 'general', salary: '₹10–18 LPA', tags: ['Security', 'Penetration Testing', 'Linux', 'Networking'], remote: false, featured: false, logo: '🔒' },
  { title: 'Blockchain Developer', company: 'WazirX', location: 'Remote', type: 'Full-time', role: 'general', salary: '₹18–30 LPA', tags: ['Solidity', 'Web3', 'Ethereum', 'Smart Contracts'], remote: true, featured: false, logo: '⛓️' },
  { title: 'QA Automation Engineer', company: 'Atlassian', location: 'Bengaluru, India', type: 'Full-time', role: 'general', salary: '₹12–20 LPA', tags: ['Selenium', 'Jest', 'Python', 'CI/CD'], remote: false, featured: false, logo: '🧪' },
  { title: 'Internship — Frontend (6 months)', company: 'Groww', location: 'Bengaluru, India', type: 'Internship', role: 'frontend', salary: '₹25–40k/month', tags: ['React', 'JavaScript', 'Fresher', 'Internship'], remote: false, featured: false, logo: '🌱' },
  { title: 'Internship — Data Science', company: 'Analytics Vidhya', location: 'Remote', type: 'Internship', role: 'data_scientist', salary: '₹15–25k/month', tags: ['Python', 'ML', 'Pandas', 'Internship'], remote: true, featured: false, logo: '📊' },
];

const seedJobs = async () => {
  try {
    const existing = await Job.countDocuments();
    if (existing >= JOBS.length) {
      console.log(`✅ Jobs already seeded (${existing} found)`);
      return;
    }
    await Job.deleteMany({});
    const jobs = JOBS.map(j => ({ ...j, postedAt: new Date(Date.now() - Math.random() * 30 * 86400000) }));
    await Job.insertMany(jobs);
    console.log(`✅ Seeded ${jobs.length} jobs`);
  } catch (err) {
    console.error('Job seed error:', err.message);
  }
};

module.exports = { seedJobs };
