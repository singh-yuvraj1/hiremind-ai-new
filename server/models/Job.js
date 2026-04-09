const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  company:  { type: String, required: true, trim: true },
  location: { type: String, default: 'Remote' },
  type:     { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
  role:     {
    type: String,
    enum: ['frontend', 'backend', 'fullstack', 'data_scientist', 'devops', 'aiml', 'product_manager', 'mobile', 'general'],
    default: 'general',
  },
  salary:   { type: String, default: 'Not disclosed' },
  link:     { type: String, default: '' },
  tags:     [String],          // e.g. ['React', 'Node.js', 'MongoDB']
  remote:   { type: Boolean, default: false },
  logo:     { type: String, default: '' }, // company logo URL or emoji fallback
  postedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

jobSchema.index({ role: 1, remote: 1 });
jobSchema.index({ title: 'text', company: 'text', tags: 'text' });

module.exports = mongoose.model('Job', jobSchema);
