const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, settingsController.getSettings);
router.patch('/', optionalAuth, settingsController.updateSettings);

module.exports = router;
