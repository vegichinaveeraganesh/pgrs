/**
 * Database Seed Utility
 * Delegates to reset-db.js for consistent seeding logic.
 */
const resetAndSeed = require('./reset-db');
const { connectDB, disconnectDB } = require('../config/database');

// Export the reset function directly as the seed function
module.exports = resetAndSeed;

// Allow running directly: node src/utils/seed.js
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await resetAndSeed();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    }
  })();
}
