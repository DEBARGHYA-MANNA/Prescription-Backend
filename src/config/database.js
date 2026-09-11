const mongoose = require('mongoose');

async function connectDatabase(mongoUri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = { connectDatabase };
