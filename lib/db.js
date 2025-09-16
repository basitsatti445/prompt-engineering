const mongoose = require('mongoose');
const { database, validateConfig } = require('./config');

// Validate configuration on startup
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  process.exit(1);
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      ...database.options,
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(database.uri, opts).then((mongoose) => {
      console.log(`Connected to MongoDB: ${database.uri.replace(/\/\/.*@/, '//***:***@')}`);
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection error:', error.message);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
