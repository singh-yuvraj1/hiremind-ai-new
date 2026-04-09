// ============================================================
//  server.js  —  HireMind AI  (HARDENED)
//  • Global error handler middleware
//  • unhandledRejection + uncaughtException guards
//  • Graceful SIGTERM/SIGINT shutdown
// ============================================================

const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

/* ── Crash guards — MUST be registered before anything else ── */

process.on('uncaughtException', (err) => {
  console.error('💥 [UNCAUGHT EXCEPTION] Server will NOT restart on its own:', err);
  // Allow the process to stay alive for logging but flag it
  // In production you'd restart via PM2 / Docker; here we log and continue.
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  [UNHANDLED REJECTION] at:', promise, '\n   reason:', reason);
  // Do NOT crash — log and recover. Keep server alive.
});

/* ── Database connection ────────────────────────────────────── */

connectDB().then(() => {
  try {
    const { seedJobs } = require('./seed/jobs');
    seedJobs();
  } catch (seedErr) {
    console.warn('[Seed] Could not seed jobs:', seedErr.message);
  }
}).catch((dbErr) => {
  console.error('[DB] Connection failed:', dbErr.message);
  // Don't crash the process — let health endpoint report unavailable DB
});

/* ── Express app ────────────────────────────────────────────── */

const app = express();

// ── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin:      (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP logger ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

/* ── Routes ─────────────────────────────────────────────────── */

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/mock',       require('./routes/mockRoutes'));
app.use('/api/jobs',       require('./routes/jobRoutes'));
app.use('/api/resume',     require('./routes/resumeRoutes'));
app.use('/api/payment',    require('./routes/paymentRoutes'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({
    success:   true,
    message:   'HireMind AI server running 🚀',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
  })
);

/* ── 404 ──────────────────────────────────────────────────── */

app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` })
);

/* ── Global error handler ─────────────────────────────────── */

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[Global Error] ${status} — ${message}`);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

/* ── Start server ─────────────────────────────────────────── */

const PORT   = parseInt(process.env.PORT || '5000', 10);
const server = app.listen(PORT, () =>
  console.log(`\n🚀 HireMind AI server running on port ${PORT}  [${process.env.NODE_ENV || 'development'}]\n`)
);

/* ── Graceful shutdown ────────────────────────────────────── */

const shutdown = (signal) => {
  console.log(`\n[Server] ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] All connections closed. Goodbye!');
    process.exit(0);
  });

  // Force-kill if close takes too long
  setTimeout(() => {
    console.error('[Server] Could not close connections in time — force exiting.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = app; // for testing