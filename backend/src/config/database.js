const mongoose = require('mongoose');
const env = require('./env');

let memoryServer = null;

async function connectDB() {
  const isPlaceholder = !env.mongoUri || env.mongoUri.includes('YOUR_MONGODB_CONNECTION_STRING') || env.mongoUri.trim() === '';

  if (!isPlaceholder) {
    try {
      console.log(`[Database] Attempting connection to MongoDB via provided MONGODB_URI...`);
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`[Database] Successfully connected to remote MongoDB database.`);
      return mongoose.connection;
    } catch (err) {
      console.warn(`[Database] Remote MongoDB connection failed (${err.message}). Falling back to local in-memory MongoDB.`);
    }
  } else {
    console.log(`[Database] MONGODB_URI is set to placeholder. Starting in-memory MongoDB instance for local development...`);
  }

  // Fallback to in-memory MongoDB instance
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] In-memory MongoDB started and connected at ${uri}`);
    console.log(`[Database] NOTE: You can replace MONGODB_URI in backend/.env with your MongoDB Atlas connection string at any time!`);
    return mongoose.connection;
  } catch (memErr) {
    console.error(`[Database] Failed to start MongoDB:`, memErr);
    throw memErr;
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error(`[Database] Error during disconnect:`, err);
  }
}

module.exports = { connectDB, disconnectDB };
