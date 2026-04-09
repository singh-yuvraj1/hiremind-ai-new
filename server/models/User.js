const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String, required: [true, 'Email is required'],
    unique: true, lowercase: true, trim: true,
  },
  password:     { type: String, minlength: 6, select: false },
  avatar:       { type: String, default: '' },
  googleId:     { type: String, default: null },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },

  // ── Premium / Subscription ────────────────────────────────────────
  isPremium:    { type: Boolean, default: false },
  premiumExpiry:{ type: Date,    default: null },

  subscription: {
    plan:            { type: String, enum: ['free', 'premium'], default: 'free' },
    validUntil:      { type: Date,   default: null },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId:{ type: String, default: null },
  },

  // ── Daily Usage Tracking (reset every day) ────────────────────────
  dailyUsage: {
    interviews:    { type: Number, default: 0 },
    tests:         { type: Number, default: 0 },
    resumeChecks:  { type: Number, default: 0 },
    lastResetDate: { type: String, default: '' }, // stored as 'YYYY-MM-DD'
  },

  // ── Interview + Mock performance stats ───────────────────────────
  stats: {
    totalInterviews:   { type: Number, default: 0 },
    totalMockTests:    { type: Number, default: 0 },
    avgScore:          { type: Number, default: 0 },
    avgCommunication:  { type: Number, default: 0 },
    avgConfidence:     { type: Number, default: 0 },
    avgAnswerQuality:  { type: Number, default: 0 },
    avgPosture:        { type: Number, default: 0 },
    bestScore:         { type: Number, default: 0 },
    streak:            { type: Number, default: 0 },
    lastPracticed:     { type: Date,   default: null },
  },

  // ── Saved Jobs ────────────────────────────────────────────────────
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // ── Resume Data ───────────────────────────────────────────────────
  resumeData: {
    rawText:     { type: String, default: '' },
    atsScore:    { type: Number, default: 0 },
    lastAnalyzed:{ type: Date,   default: null },
  },

}, { timestamps: true });

// ── Password hashing ─────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// ── Helper: reset daily usage if it's a new day ───────────────────────
userSchema.methods.resetDailyUsageIfNeeded = async function () {
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  if (this.dailyUsage.lastResetDate !== today) {
    this.dailyUsage.interviews   = 0;
    this.dailyUsage.tests        = 0;
    this.dailyUsage.resumeChecks = 0;
    this.dailyUsage.lastResetDate = today;
    await this.save();
  }
};

module.exports = mongoose.model('User', userSchema);