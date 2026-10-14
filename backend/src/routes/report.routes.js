const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/summary', optionalAuth, reportController.getSummary);
router.get('/export', optionalAuth, reportController.exportReport);

module.exports = router;
