const express = require('express');
const router = express.Router();
const officialController = require('../controllers/official.controller');
const { optionalAuth } = require('../middleware/auth');

router.get('/directory', officialController.getDirectory);
router.get('/', optionalAuth, officialController.getOfficials);
router.post('/', optionalAuth, officialController.createOfficial);
router.patch('/:id', optionalAuth, officialController.updateOfficial);

module.exports = router;
