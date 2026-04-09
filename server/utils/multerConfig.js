// ============================================================
//  utils/multerConfig.js  —  HireMind AI
//  Centralised Multer configuration for file uploads.
//  All uploaded files are kept in memory (no disk writes).
// ============================================================

const multer = require('multer');

/* ── In-memory storage (no temp files) ──────────────────── */
const storage = multer.memoryStorage();

/* ── File-type filter — PDF only ───────────────────────── */
const pdfFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf'];
  const allowedExts  = ['.pdf'];
  const ext = (file.originalname || '').toLowerCase().slice(-4);

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Only PDF files are allowed.'), { status: 400 }),
      false
    );
  }
};

/* ── Resume upload — 5 MB max ───────────────────────────── */
const uploadResume = multer({
  storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize:  5 * 1024 * 1024, // 5 MB
    files:     1,
  },
});

/* ── Generic single-PDF upload helper ───────────────────── */
const uploadSinglePDF = (fieldName = 'resume') => uploadResume.single(fieldName);

/* ── Multer error handler middleware ────────────────────── */
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5 MB.' });
    }
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  if (err && err.message) {
    return res.status(err.status || 400).json({ success: false, message: err.message });
  }
  next(err);
};

module.exports = { uploadSinglePDF, handleMulterError };
