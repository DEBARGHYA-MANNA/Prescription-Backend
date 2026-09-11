const dotenv = require('dotenv');

dotenv.config();

function getEnvironment() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}

function validateEnvironment() {
  const env = getEnvironment();
  const missing = [];

  if (!env.mongoUri) missing.push('MONGODB_URI');
  if (!env.jwtSecret) missing.push('JWT_SECRET');

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (env.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }

  if (env.nodeEnv === 'production' && env.allowedOrigins.length === 0) {
    throw new Error('ALLOWED_ORIGINS must contain the deployed frontend origin in production.');
  }

  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    throw new Error('PORT must be a valid TCP port.');
  }

  return env;
}

module.exports = { getEnvironment, validateEnvironment };
