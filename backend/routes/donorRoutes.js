const express = require('express');
const donorController = require('../controllers/donorController');
const { requireRole } = require('../middleware/auth');
const {
  validateRequest,
  createProfileSchema,
  updateProfileSchema,
  saveLocationSchema,
  pledgeSchema
} = require('../middleware/validation');

const router = express.Router();

// Profile management
router.get('/profile', requireRole('donor'), donorController.getProfile);
router.post('/profile', requireRole('donor'), validateRequest(createProfileSchema), donorController.createProfile);
router.post('/profile-setup', requireRole('donor'), validateRequest(createProfileSchema), donorController.createProfile);
router.put('/profile', requireRole('donor'), validateRequest(updateProfileSchema), donorController.updateProfile);

// Geolocation
router.post('/location', requireRole('donor'), validateRequest(saveLocationSchema), donorController.saveLocation);

// Donation history & stats
router.get('/donations', requireRole('donor'), donorController.listDonations);
router.post('/appointments', requireRole('donor'), donorController.bookAppointment);
router.get('/stats', requireRole('donor'), donorController.getStats);

// Emergency requests & pledges
router.get('/urgent-requests', requireRole('donor'), donorController.listUrgentRequests);
router.post('/pledge', requireRole('donor'), validateRequest(pledgeSchema), donorController.pledgeEmergency);

// Donation camps
router.get('/camps', requireRole('donor'), donorController.listCamps);

module.exports = router;
