const app = require('./app');
const { connectDB } = require('./config/database');
const { initSlaCronJob } = require('./jobs/sla-monitor.job');
const env = require('./config/env');
const Grievance = require('./models/Grievance');
const seedData = require('./utils/seed');

async function startServer() {
  try {
    await connectDB();

    // Check if initial seed is needed (e.g. empty database on first launch)
    const count = await Grievance.countDocuments();
    if (count === 0) {
      console.log('[Server] Database is empty. Running initial demonstration seed...');
      await seedData();
    } else {
      console.log(`[Server] Database contains ${count} grievances.`);
    }

    // Start background SLA monitoring job
    initSlaCronJob();

    const server = app.listen(env.port, () => {
      console.log(`=======================================================`);
      console.log(` RDO Bhimunipatnam - PGRS Tracking Portal Backend`);
      console.log(` Server running on http://localhost:${env.port}`);
      console.log(` Health check:   http://localhost:${env.port}/health`);
      console.log(` API base:       http://localhost:${env.port}/api/v1`);
      console.log(` Environment:    ${env.nodeEnv}`);
      console.log(`=======================================================`);
    });

    const shutdown = async (signal) => {
      console.log(`[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
