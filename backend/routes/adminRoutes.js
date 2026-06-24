const express = require('express');
const adminController = require('../controllers/adminController');
const { requireRole } = require('../middleware/auth');
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
router.get('/district/dashboard', districtRole, adminController.getDistrictDashboard);
router.get('/district/hospitals', districtRole, adminController.getDistrictHospitals);
router.get('/district/alerts', districtRole, adminController.getDistrictAlerts);
router.patch('/district/alerts/:id/resolve', districtRole, adminController.resolveDistrictAlert);
router.get('/district/camps', districtRole, adminController.listDistrictCamps);
router.post('/district/camps', districtRole, validateRequest(createCampSchema), adminController.createDistrictCamp);
router.patch('/district/camps/:id/status', districtRole, validateRequest(updateCampStatusSchema), adminController.updateCampStatus);
router.get('/district/map', districtRole, adminController.getDistrictMap);

// State Endpoints
router.get('/state/dashboard', stateRole, adminController.getStateDashboard);
router.get('/state/transfers', stateRole, adminController.getStateTransfers);
router.patch('/state/transfers/:id/approve', stateRole, adminController.approveStateTransfer);
router.get('/state/policy-alerts', stateRole, adminController.getStatePolicyAlerts);

module.exports = router;
