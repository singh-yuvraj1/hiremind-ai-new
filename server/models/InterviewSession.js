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
  jobRole:    { type: String, required: true },
  category:   { type: String, default: 'general' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  aiCharacter:{ type: String, default: 'shubham' },
  questions:  [questionSchema],

  feedback: {
    communication:   { type: Number, default: 0 },
    confidence:      { type: Number, default: 0 },
    answerQuality:   { type: Number, default: 0 },
    posture:         { type: Number, default: 0 },
    overallScore:    { type: Number, default: 0 },
    suggestions:     [String],
    strengths:       [String],
    weaknesses:      [String],
    summary:         { type: String, default: '' },
    aiEvaluated:     { type: Boolean, default: false },
    ragEvaluated:    { type: Boolean, default: false },   // ← NEW
    matchedConcepts: [String],                             // ← NEW: concepts found in answer
    missingConcepts: [String],                             // ← NEW: concepts not in answer
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