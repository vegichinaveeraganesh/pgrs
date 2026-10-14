const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

router.get('/track/:id', publicController.trackGrievance);

module.exports = router;
