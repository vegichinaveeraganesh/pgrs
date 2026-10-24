const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const grievanceRoutes = require('./grievance.routes');
const officialRoutes = require('./official.routes');
const mandalRoutes = require('./mandal.routes');
const publicRoutes = require('./public.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');
const settingsRoutes = require('./settings.routes');

const officialController = require('../controllers/official.controller');
const notificationController = require('../controllers/notification.controller');
const pgrsSyncService = require('../services/pgrs-sync.service');

// ---- API v1 Endpoints ----
router.use('/v1/auth', authRoutes);
router.use('/v1/dashboard', dashboardRoutes);
router.use('/v1/grievances', grievanceRoutes);
router.use('/v1/officials', officialRoutes);
router.use('/v1/mandals', mandalRoutes);
router.use('/v1/public', publicRoutes);
router.use('/v1/notifications', notificationRoutes);
router.use('/v1/reports', reportRoutes);
router.use('/v1/settings', settingsRoutes);

const upload = require('../middleware/upload');
const csvSyncService = require('../services/csv-sync.service');
const resetAndSeed = require('../utils/reset-db');
const fs = require('fs');

// ─── Admin: Reset Database ───────────────────────────────────────────
router.post('/v1/admin/reset-db', async (req, res, next) => {
  try {
    console.log('[Admin] Database reset requested...');
    const result = await resetAndSeed();
    res.json({
      success: true,
      message: 'Database reset and seeded successfully. All users have email+password login (no OTP). Roles and permissions are active.',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// PGRS Integration Endpoint
router.post('/v1/integrations/pgrs/sync', async (req, res, next) => {
  try {
    const result = await pgrsSyncService.syncApplications();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PGRS CSV Direct Upload & Sync Endpoint
router.post('/v1/integrations/pgrs/upload-csv', upload.single('file'), async (req, res, next) => {
  try {
    let csvData = '';
    if (req.file) {
      csvData = fs.readFileSync(req.file.path, 'utf8');
    } else if (req.body && req.body.csv) {
      csvData = req.body.csv;
    } else {
      return res.status(400).json({ success: false, message: 'Please attach a CSV file or provide CSV text data.' });
    }

    const uploadedBy = req.user ? req.user.name : (req.body && req.body.uploadedBy ? req.body.uploadedBy : 'RDO Officer');
    const result = await csvSyncService.processCsv(csvData, uploadedBy);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ---- Direct API Compatibility Endpoints (as seen in reference application) ----
router.use('/dashboard', dashboardRoutes);
router.use('/applications', grievanceRoutes);
router.get('/directory', officialController.getDirectory);
router.get('/messages', notificationController.getMessages);
router.post('/pgrs/sync', async (req, res, next) => {
  try {
    const result = await pgrsSyncService.syncApplications();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
