const express = require('express');
const adminController = require('../controllers/adminController');
const { requireRole, requireOwnership } = require('../middleware/auth');
const {
  validateRequest,
  createCampSchema,
  updateCampStatusSchema
} = require('../middleware/validation');

const router = express.Router();

// Role requirements
const districtRole = requireRole('district');
const stateRole = requireRole('state');

// District Endpoints
router.get('/district/dashboard', districtRole, requireOwnership(), adminController.getDistrictDashboard);
router.get('/district/hospitals', districtRole, requireOwnership(), adminController.getDistrictHospitals);
router.get('/district/alerts', districtRole, requireOwnership(), adminController.getDistrictAlerts);
router.patch('/district/alerts/:id/resolve', districtRole, requireOwnership(), adminController.resolveDistrictAlert);
router.get('/district/camps', districtRole, requireOwnership(), adminController.listDistrictCamps);
router.post('/district/camps', districtRole, requireOwnership(), validateRequest(createCampSchema), adminController.createDistrictCamp);
router.patch('/district/camps/:id/status', districtRole, requireOwnership({ resourceType: 'donation_camps' }), validateRequest(updateCampStatusSchema), adminController.updateCampStatus);
router.get('/district/map', districtRole, requireOwnership(), adminController.getDistrictMap);

// State Endpoints
router.get('/state/dashboard', stateRole, adminController.getStateDashboard);
router.get('/state/transfers', stateRole, adminController.getStateTransfers);
router.patch('/state/transfers/:id/approve', stateRole, adminController.approveStateTransfer);
router.get('/state/policy-alerts', stateRole, adminController.getStatePolicyAlerts);

module.exports = router;
