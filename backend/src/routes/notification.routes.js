const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, notificationController.getMessages);
router.post('/:id/retry', optionalAuth, notificationController.retryMessage);

module.exports = router;
