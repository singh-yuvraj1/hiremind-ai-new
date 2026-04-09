const mongoose = require('mongoose');

const cheatingLogSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewSession' },
  testId:  { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest' },
  sessionType: { type: String, enum: ['interview', 'mock_test'], default: 'interview' },
  events: [{
    type:      { type: String, enum: ['tab_switch','fullscreen_exit','paste_attempt','right_click','window_blur','copy_attempt'], required: true },
    count:     { type: Number, default: 1 },
    timestamp: { type: Date, default: Date.now },
  }],
  totalViolations: { type: Number, default: 0 },
  autoSubmitted:   { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('CheatingLog', cheatingLogSchema);
