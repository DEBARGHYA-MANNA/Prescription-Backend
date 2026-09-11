const app = require('./app');
const { connectDatabase } = require('./config/database');
const { validateEnvironment } = require('./config/env');

async function startServer() {
  const env = validateEnvironment();
  await connectDatabase(env.mongoUri);

  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`Prescription Builder API listening on port ${env.port} (${env.nodeEnv}).`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Closing server...`);
    server.close(() => process.exit(0));
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error) => {
  console.error('Unable to start the API:', error.message);
  process.exit(1);
});
