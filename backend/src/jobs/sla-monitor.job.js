const cron = require('node-cron');
const slaService = require('../services/sla.service');

function initSlaCronJob() {
  // Run SLA scan every 30 minutes
  const task = cron.schedule('*/30 * * * *', async () => {
    console.log('[SLA Cron] Running scheduled SLA escalation scan...');
    try {
      const result = await slaService.runSlaCheck();
      console.log(`[SLA Cron] Completed scan. Scanned: ${result.scannedCount}, Newly Escalated: ${result.escalatedCount}`);
    } catch (err) {
      console.error('[SLA Cron] Error during SLA scan:', err);
    }
  });

  console.log('[SLA Cron] SLA background monitoring scheduled (every 30 minutes).');
  return task;
}

module.exports = { initSlaCronJob };
