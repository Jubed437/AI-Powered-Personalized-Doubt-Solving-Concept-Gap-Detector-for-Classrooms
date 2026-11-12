const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const createRateLimiter = ({ windowMs, limit, message }) => rateLimit({
  windowMs,
  limit,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new ApiError(429, message)),
});

const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: 'Too many requests; please try again later',
});

const doubtCreationLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: 'Too many doubt submissions; please try again later',
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many login attempts; please try again later',
});

module.exports = { generalLimiter, doubtCreationLimiter, loginLimiter };
