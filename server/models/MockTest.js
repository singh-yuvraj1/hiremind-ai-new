const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['aptitude', 'dsa', 'programming', 'behavioral', 'core_cs', 'role_based'],
    required: true,
  },
  role:       { type: String, default: 'general' }, // for role_based type
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions:  [{
    question: String,
    options:  [String],
    correct:  Number,
    userAns:  { type: Number, default: -1 }, // -1 = unattempted
    isRight:  Boolean,
    explanation: { type: String, default: '' },
  }],
  score:     { type: Number, default: 0 },
  totalQ:    { type: Number, default: 0 },
  attempted: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // seconds
  analysis: {
    accuracy:     Number,
    strongTopics: [String],
    weakTopics:   [String],
    suggestion:   String,
  },
  autoSubmitted: { type: Boolean, default: false },
  cheatingEvents:[{
    type:      { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model('MockTest', mockTestSchema);