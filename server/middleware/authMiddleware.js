const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Hard auth guard — rejects requests without a valid token.
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

/**
 * Optional auth — attaches user if token present, but never rejects.
 * Used for public routes that benefit from knowing who is logged in.
 */
const optionalProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch {
    // Silently ignore invalid/expired tokens in optional mode
  }
  next();
};

module.exports = { protect, optionalProtect };