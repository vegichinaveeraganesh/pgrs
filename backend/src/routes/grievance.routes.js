const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievance.controller');
const upload = require('../middleware/upload');
const { optionalAuth, authenticate } = require('../middleware/auth');

router.get('/', optionalAuth, grievanceController.getGrievances);
router.post('/', optionalAuth, grievanceController.createGrievance);
router.get('/:id', optionalAuth, grievanceController.getGrievanceById);
router.patch('/:id', optionalAuth, grievanceController.updateGrievance);

// Workflow actions
router.post('/:id/gist', optionalAuth, grievanceController.generateOrEditGist);
router.post('/:id/assign', optionalAuth, grievanceController.assignOfficials);
router.post('/:id/endorsements', upload.single('document'), grievanceController.uploadEndorsement);
router.post('/:id/endorsement', upload.single('document'), grievanceController.uploadEndorsement); // alias for backwards compatibility
router.post('/:id/feedback', optionalAuth, grievanceController.submitFeedback);
router.post('/:id/ivrs', optionalAuth, grievanceController.triggerIvrs);
router.get('/:id/timeline', optionalAuth, grievanceController.getTimeline);

module.exports = router;
