const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const { getEnvironment } = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.get('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AppError('Authentication required. Send a Bearer token.', 401);
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    throw new AppError('Authentication required. Send a Bearer token.', 401);
  }

  const { jwtSecret } = getEnvironment();
  if (!jwtSecret) {
    throw new AppError('Server authentication is not configured.', 500);
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (error) {
    throw new AppError('Your session is invalid or has expired. Please sign in again.', 401);
  }

  const doctor = await Doctor.findById(payload.sub);
  if (!doctor) {
    throw new AppError('The account for this session no longer exists.', 401);
  }

  req.doctor = doctor;
  return next();
});

module.exports = authenticate;
