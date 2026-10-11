const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  fileName:         { type: String, default: '' },
  fileType:         { type: String, default: 'text' },
  targetRole:       { type: String, default: 'Software Engineer' },
  jobDescription:   { type: String, default: '' },
  isJobSpecific:    { type: Boolean, default: false },
  atsScore:         { type: Number, required: true },
  scoreLabel:       { type: String, default: '' },
  summary:          { type: String, default: '' },
  scoringDimensions:{ type: mongoose.Schema.Types.Mixed, default: {} },
  skillsAnalysis:   { type: mongoose.Schema.Types.Mixed, default: {} },
  keywords:         { type: mongoose.Schema.Types.Mixed, default: {} },
  sections:         { type: mongoose.Schema.Types.Mixed, default: {} },
  strengths:        [{ type: String }],
  improvements:     [{ type: String }],
  detailedImprovements: [{ type: mongoose.Schema.Types.Mixed }],
  wordCount:        { type: Number, default: 0 },
  aiAnalyzed:       { type: Boolean, default: false },
  extractionMetadata: {
    pageCount:     { type: Number, default: 1 },
    fileSizeBytes: { type: Number, default: 0 },
    charCount:     { type: Number, default: 0 },
    status:        { type: String, default: 'success' },
  },
}, { timestamps: true });

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
