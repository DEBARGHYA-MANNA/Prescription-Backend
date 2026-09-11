const jwt = require('jsonwebtoken');
const { getEnvironment } = require('../config/env');

function createAccessToken(doctor) {
  const { jwtSecret, jwtExpiresIn } = getEnvironment();

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    { sub: doctor._id.toString(), email: doctor.email },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );
}

module.exports = { createAccessToken };
