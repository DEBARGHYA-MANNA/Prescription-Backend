const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { getEnvironment } = require('./config/env');
const AppError = require('./utils/AppError');
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const templateRoutes = require('./routes/templateRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const { nodeEnv, allowedOrigins } = getEnvironment();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Non-browser clients (curl, Postman) do not send an Origin header.
    const allowAnyLocalOrigin = nodeEnv !== 'production' && allowedOrigins.length === 0;
    if (!origin || allowAnyLocalOrigin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError('This origin is not allowed by CORS.', 403));
  },
}));
app.use(express.json({ limit: '100kb' }));

if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
}

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many requests. Please try again later.' },
  },
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many sign-in attempts. Please try again later.' },
  },
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
  });
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/doctor', doctorRoutes);
app.use('/api/v1/prescription-templates', templateRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
