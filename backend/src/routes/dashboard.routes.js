const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/stats', optionalAuth, dashboardController.getStats);
router.get('/', optionalAuth, dashboardController.getStats);
router.get('/escalations', optionalAuth, dashboardController.getEscalations);

module.exports = router;
