// ============================================================
//  server.js  —  HireMind AI (FINAL PRODUCTION READY)
// ============================================================

const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

/* ── Crash Guards (IMPORTANT) ───────────────────────────── */

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ UNHANDLED REJECTION! Shutting down...', reason);
  process.exit(1);
});

/* ── App Init ───────────────────────────────────────────── */

const app = express();

/* ── DB Connection ─────────────────────────────────────── */

connectDB()
  .then(async () => {
    console.log("✅ MongoDB Connected");

    if (process.env.NODE_ENV === "development") {
      try {
        const { seedJobs } = require('./seed/jobs');
        await seedJobs();
        console.log("🌱 Jobs seeded");
      } catch (err) {
        console.warn('[Seed Error]', err.message);
      }
    }

  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
    process.exit(1);
  });

/* ── CORS Configuration ───────────────────────────────────── */

const defaultOrigins = [
  'https://hiremind-aiy.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:3000',
];

const envOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.trim().replace(/\/$/, '');
    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      process.env.NODE_ENV !== 'production';

    if (isAllowed) {
      return callback(null, true);
    } else {
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* ── Middlewares ───────────────────────────────────────── */

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth',       authRoutes);
app.use('/auth',           authRoutes);
app.use('/api/interviews', require('./routes/interviewRoutes'));
app.use('/api/mock',       require('./routes/mockRoutes'));
app.use('/api/jobs',       require('./routes/jobRoutes'));
app.use('/api/resume',     require('./routes/resumeRoutes'));
app.use('/api/payment',    require('./routes/paymentRoutes'));

/* ── Health Check ─────────────────────────────────────── */

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'HireMind AI server running 🚀',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

/* ── 404 ─────────────────────────────────────────────── */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/* ── Global Error Handler ─────────────────────────────── */

app.use((err, req, res, next) => {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  console.error(`[Global Error] ${status} — ${message}`);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/* ── Start Server ─────────────────────────────────────── */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* ── Graceful Shutdown ───────────────────────────────── */

const shutdown = (signal) => {
  console.log(`\n[Server] ${signal} received — shutting down...`);

  server.close(() => {
    console.log('[Server] Closed successfully');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('[Server] Force shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

module.exports = app;