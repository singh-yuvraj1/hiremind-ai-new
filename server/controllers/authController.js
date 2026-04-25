const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { ensurePremiumOverride } = require('../middleware/premiumMiddleware');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const buildUserPayload = (user) => ({
  id:            user._id,
  name:          user.name,
  email:         user.email,
  avatar:        user.avatar,
  authProvider:  user.authProvider,
  isPremium:     user.isPremium     || false,
  premiumExpiry: user.premiumExpiry || null,
  plan:          user.subscription?.plan || (user.isPremium ? 'premium' : 'free'),
  stats:         user.stats,
  dailyUsage:    user.dailyUsage,
});

const sendToken = (user, statusCode, res) => {
  const token = makeToken(user._id);
  res.status(statusCode).json({ success: true, token, user: buildUserPayload(user) });
};

/* ── REGISTER ──────────────────────────────────────────────────────── */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Please fill all fields' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    // Apply permanent premium override for privileged emails
    await ensurePremiumOverride(user);
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── LOGIN ─────────────────────────────────────────────────────────── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Enter email and password' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Apply permanent premium override for privileged emails
    await ensurePremiumOverride(user);
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GOOGLE AUTH ───────────────────────────────────────────────────── */
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ name, email, avatar: picture, googleId, authProvider: 'google' });
    } else if (!user.googleId) {
      user.googleId = googleId; user.avatar = picture; user.authProvider = 'google';
      await user.save();
    }
    // Apply permanent premium override for privileged emails
    await ensurePremiumOverride(user);
    sendToken(user, 200, res);
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

/* ── GET ME ────────────────────────────────────────────────────────── */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isPremium && user.premiumExpiry && new Date() > new Date(user.premiumExpiry)) {
      user.isPremium = false;
      user.subscription.plan = 'free';
      await user.save();
    }
    res.json({ success: true, user: buildUserPayload(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET USAGE ─────────────────────────────────────────────────────── */
const getUsage = async (req, res) => {
  try {
    const { getUsageStatus } = require('../middleware/usageLimiter');
    const status = await getUsageStatus(req.user._id);
    if (!status) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── EMAIL HELPERS ─────────────────────────────────────────────────── */
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass || user === 'your_gmail@gmail.com') return null;

  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   587,
    secure: false,       // STARTTLS
    auth:   { user, pass },
    tls:    { rejectUnauthorized: false },
  });
};

const sendResetEmail = async (toEmail, resetUrl, userName) => {
  const transporter = createTransporter();

  if (!transporter) {
    // Dev mode — email credentials not set, log link to server console
    console.log('\n══════════════════════════════════════════════════════');
    console.log('⚠️  Email not configured. Paste this link in browser:');
    console.log(resetUrl);
    console.log('══════════════════════════════════════════════════════\n');
    return { devMode: true, resetUrl };
  }

  const firstName = userName ? userName.split(' ')[0] : 'there';

  await transporter.sendMail({
    from:    `"HireMind AI" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: 'Reset Your HireMind AI Password',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Reset Password — HireMind AI</title>
</head>
<body style="margin:0;padding:0;background:#0a1228;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1228;min-height:100vh;">
  <tr>
    <td align="center" style="padding:48px 16px;">
      <table width="560" cellpadding="0" cellspacing="0"
        style="max-width:560px;width:100%;background:#0d1b35;border:1px solid rgba(0,229,255,0.18);border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:28px 40px;background:linear-gradient(135deg,rgba(0,229,255,0.08),rgba(41,121,255,0.08));border-bottom:1px solid rgba(0,229,255,0.12);text-align:center;">
            <span style="font-size:24px;font-weight:800;color:#e2e8f0;letter-spacing:-0.5px;">
              Hire<span style="color:#00e5ff;">Mind</span> AI
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#f1f5f9;">
              Password Reset Request
            </h1>
            <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.7;">
              Hi ${firstName},<br>
              We received a request to reset the password for your HireMind AI account.
              Click the button below — the link is valid for <strong style="color:#e2e8f0;">15 minutes</strong>.
            </p>

            <div style="text-align:center;margin:0 0 32px;">
              <a href="${resetUrl}"
                style="display:inline-block;padding:15px 40px;
                       background:linear-gradient(135deg,#00e5ff,#2979ff);
                       color:#0a1228;font-weight:700;font-size:15px;
                       text-decoration:none;border-radius:10px;
                       box-shadow:0 0 28px rgba(0,229,255,0.30);">
                Reset My Password →
              </a>
            </div>

            <p style="margin:0 0 6px;color:#64748b;font-size:13px;">
              Button not working? Copy and paste this URL into your browser:
            </p>
            <p style="margin:0;word-break:break-all;">
              <a href="${resetUrl}" style="color:#00e5ff;font-size:13px;">${resetUrl}</a>
            </p>

            <div style="margin-top:28px;padding:16px 20px;background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;">
              <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.6;">
                🔒 If you did not request a password reset, you can safely ignore this email.
                Your account will not be affected.
              </p>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 40px;text-align:center;border-top:1px solid rgba(255,255,255,0.06);">
            <p style="margin:0;color:#475569;font-size:12px;">
              © ${new Date().getFullYear()} HireMind AI · AI-Powered Interview Practice
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`,
  });

  return { devMode: false };
};

/* ── FORGOT PASSWORD ───────────────────────────────────────────────── */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Return same message whether user exists or not (prevents email enumeration)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    // Generate secure 32-byte raw token; store only the hashed version
    const rawToken    = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken  = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl  = `${clientUrl}/reset-password/${rawToken}`;

    try {
      const result = await sendResetEmail(user.email, resetUrl, user.name);

      if (result.devMode) {
        // Development: email not configured — return link in response
        return res.status(200).json({
          success:  true,
          devMode:  true,
          message:  'Email not configured. For development, use the resetUrl below.',
          resetUrl, // ⚠ Remove this field when deploying to production
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Password reset link sent! Check your inbox (and spam folder).',
      });

    } catch (emailErr) {
      // Clean up tokens if email send fails
      user.resetPasswordToken  = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('[forgotPassword] Email send failed:', emailErr.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.',
      });
    }

  } catch (err) {
    console.error('[forgotPassword] Unexpected error:', err.message);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/* ── RESET PASSWORD ────────────────────────────────────────────────── */
const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is missing.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Hash the incoming raw token and compare against stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken:  hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired. Please request a new one.',
      });
    }

    // Set new password — the pre-save bcrypt hook will hash it automatically
    user.password            = password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });

  } catch (err) {
    console.error('[resetPassword] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, googleAuth, getMe, getUsage, forgotPassword, resetPassword };