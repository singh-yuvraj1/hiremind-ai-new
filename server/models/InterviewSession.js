const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question:       { type: String },
  answer:         { type: String, default: '' },
  aiFeedback:     { type: String, default: '' },
  relevanceScore: { type: Number, default: 0 },
  isCorrect:      { type: Boolean, default: false },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobRole:      { type: String, required: true },
  role:         { type: String, default: 'backend' },
  technology:   { type: String, default: '' },
  technologies: [{ type: String }],
  category:     { type: String, default: 'general' },
  difficulty:   { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  aiCharacter:  { type: String, default: 'shubham' },
  questions:    [questionSchema],

  feedback: {
    communication:   { type: Number, default: 0 },
    answerQuality:   { type: Number, default: 0 },
    posture:         { type: Number },
    dressing:        { type: Number },
    technicalScore:  { type: Number, default: 0 },
    overallScore:    { type: Number, default: 0 },
    suggestions:     [String],
    strengths:       [String],
    weaknesses:      [String],
    dynamicFeedback: [String],
    summary:         { type: String, default: '' },
    aiEvaluated:     { type: Boolean, default: false },
    ragEvaluated:    { type: Boolean, default: false },
    matchedConcepts: [String],
    missingConcepts: [String],
    perQuestionFeedback: [{
      questionIndex:   { type: Number },
      score:           { type: Number },
      feedback:        { type: String },
      matchedConcepts: [String],
      missingConcepts: [String],
      suggestions:     [String],
      ragUsed:         { type: Boolean },
    }],
    adaptiveTrajectory: {
      initialDifficulty: { type: String, default: 'medium' },
      finalDifficulty:   { type: String, default: 'medium' },
      peakDifficulty:    { type: String, default: 'medium' },
      adaptabilityScore: { type: Number, default: 0 },
    },
  },

  duration:      { type: Number, default: 0 },
  tabSwitches:   { type: Number, default: 0 },
  cheatingEvents:[{
    type:      { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['completed', 'abandoned', 'auto_submitted'],
    default: 'completed',
  },
}, { timestamps: true });

// Index for fast user session lookups
interviewSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);