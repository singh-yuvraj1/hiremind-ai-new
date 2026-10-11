// ============================================================
//  utils/multerConfig.js  —  HireMind AI
//  Centralised Multer configuration for file uploads.
//  All uploaded files are kept in memory (no disk writes).
// ============================================================

const multer = require('multer');

/* ── In-memory storage (no temp files) ──────────────────── */
const storage = multer.memoryStorage();

/* ── File-type filter — PDF, DOCX, TXT ─────────────────── */
const documentFilter = (req, file, cb) => {
  const allowedExts  = ['.pdf', '.docx', '.doc', '.txt'];
  const ext = (file.originalname || '').toLowerCase().slice((file.originalname || '').lastIndexOf('.'));

  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/octet-stream',
    'application/zip',
    'text/plain',
  ];

  if (allowedExts.includes(ext) || allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error('Only PDF (.pdf), Word (.docx), or plain text (.txt) files are allowed.'), { status: 400 }),
      false
    );
  }
};

/* ── Resume upload — 5 MB max ───────────────────────────── */
const uploadResume = multer({
  storage,
  fileFilter: documentFilter,
  limits: {
    fileSize:  5 * 1024 * 1024, // 5 MB
    files:     1,
  },
});

/* ── Document upload helpers ────────────────────────────── */
const uploadSingleDocument = (fieldName = 'resume') => uploadResume.single(fieldName);
const uploadSinglePDF      = (fieldName = 'resume') => uploadResume.single(fieldName);

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

module.exports = { uploadSinglePDF, uploadSingleDocument, handleMulterError };
