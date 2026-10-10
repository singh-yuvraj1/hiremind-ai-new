const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input:          { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden:       { type: Boolean, default: false },
  explanation:    { type: String, default: '' },
}, { _id: false });

const rubricItemSchema = new mongoose.Schema({
  criteria: { type: String, required: true },
  weight:   { type: Number, default: 1 }, // 1 to 5 scale
}, { _id: false });

const questionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    index: true,
    enum: [
      'fullstack',
      'frontend',
      'backend',
      'aiml',
      'data_scientist',
      'data_analyst',
      'hr',
      'general',
    ],
    default: 'backend',
  },
  technology: {
    type: String,
    default: '',
    index: true, // e.g. 'nodejs', 'python', 'java', 'cpp'
  },
  fieldId: {
    type: String,
    default: 'software_development',
    index: true,
  },
  roleId: {
    type: String,
    default: 'backend_developer',
    index: true,
  },
  roundType: {
    type: String,
    default: 'role_technical',
    index: true,
  },
  topic: {
    type: String,
    required: true,
    index: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['open_ended', 'coding', 'mcq', 'case_study'],
    default: 'open_ended',
  },
  question: {
    type: String,
    required: true,
  },
  codeSnippet: {
    type: String,
    default: '',
  },
  referenceAnswer: {
    type: String,
    default: '',
  },
  keyConcepts: [{
    type: String,
  }],
  rubric: [rubricItemSchema],
  testCases: [testCaseSchema],
  options: [{
    type: String,
  }],
  correctOptionIndex: {
    type: Number,
    default: null,
  },
  explanation: {
    type: String,
    default: '',
  },
  followUpQuestions: [{
    type: String,
  }],
  framework: {
    type: String,
    default: '',
    index: true,
  },
  database: {
    type: String,
    default: '',
    index: true,
  },
  tags: [{
    type: String,
    index: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Compound indexes for high-speed multi-attribute query filtering
questionSchema.index({ role: 1, technology: 1, difficulty: 1 });
questionSchema.index({ role: 1, tags: 1, difficulty: 1 });
questionSchema.index({ fieldId: 1, roleId: 1, roundType: 1, difficulty: 1 });
questionSchema.index({ roundType: 1, topic: 1 });

module.exports = mongoose.model('Question', questionSchema);

