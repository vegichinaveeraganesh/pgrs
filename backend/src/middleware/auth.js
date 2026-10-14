const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or malformed'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.jwtAccessSecret);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token expired'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
};

/**
 * Optional authentication middleware: populates req.user if present, but doesn't block if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.jwtAccessSecret);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user && user.active) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
};

module.exports = { authenticate, optionalAuth };
