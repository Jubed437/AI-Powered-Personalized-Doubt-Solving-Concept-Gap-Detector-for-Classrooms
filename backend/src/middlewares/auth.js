const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get('Authorization');
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);
  if (!match) throw new ApiError(401, 'Authorization bearer token is required');

  let payload;
  try {
    payload = jwt.verify(match[1], jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new ApiError(401, 'Token expired');
    throw new ApiError(401, 'Invalid token');
  }

  if (
    !payload
    || typeof payload === 'string'
    || typeof payload.sub !== 'string'
    || !/^[a-f\d]{24}$/i.test(payload.sub)
    || !['student', 'teacher'].includes(payload.role)
  ) {
    throw new ApiError(401, 'Invalid token');
  }

  req.user = { id: payload.sub, role: payload.role };
  next();
});

module.exports = authenticate;
