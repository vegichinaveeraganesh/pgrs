const express = require('express');
const router = express.Router();
const mandalController = require('../controllers/mandal.controller');

router.get('/mandals', mandalController.getMandals);
router.get('/villages', mandalController.getVillages);

module.exports = router;
