const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const { requireRole, requireOwnership } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const {
  validateRequest,
  addBatchSchema,
  updateBatchSchema,
  surgicalScheduleSchema,
  updateEmergencyStatusSchema,
  createTransferSchema,
  updateTransferStatusSchema,
  updateThresholdsSchema,
  createStaffSchema
} = require('../middleware/validation');

const router = express.Router();

// Role requirements for hospital staff (staff or admin)
const hospitalStaffRoles = requireRole(['staff', 'admin']);

// Staff creation (B1)
router.post('/hospital/staff', requireRole('admin'), validateRequest(createStaffSchema), hospitalController.createStaff);

// Inventory
router.get('/hospital/inventory', hospitalStaffRoles, hospitalController.getInventory);
router.post('/hospital/inventory', hospitalStaffRoles, validateRequest(addBatchSchema), hospitalController.addInventory);
router.put('/hospital/inventory/:id', hospitalStaffRoles, requireOwnership({ resourceType: 'blood_batches' }), auditLog('inventory_update'), validateRequest(updateBatchSchema), hospitalController.updateInventory);
router.delete('/hospital/inventory/:id', hospitalStaffRoles, requireOwnership({ resourceType: 'blood_batches' }), auditLog('inventory_delete'), hospitalController.deleteInventory);
router.get('/hospital/expiry-alerts', hospitalStaffRoles, hospitalController.getExpiryAlerts);

// Surgical Schedules
router.get('/hospital/surgical-schedule', hospitalStaffRoles, hospitalController.listSurgicalSchedules);
router.post('/hospital/surgical-schedule', hospitalStaffRoles, validateRequest(surgicalScheduleSchema), hospitalController.createSurgicalSchedule);

// Donor Search
router.get('/hospital/donors/search', hospitalStaffRoles, hospitalController.searchDonors);

// Emergency Routing
router.get('/hospital/emergencies', hospitalStaffRoles, hospitalController.listEmergencies);
router.patch('/hospital/emergencies/:id/status', hospitalStaffRoles, requireOwnership({ resourceType: 'emergency_requests' }), validateRequest(updateEmergencyStatusSchema), hospitalController.updateEmergencyStatus);
router.get('/emergency/search', hospitalStaffRoles, hospitalController.searchEmergencyBlood);

// Notifications
router.get('/hospital/notifications', hospitalStaffRoles, hospitalController.listNotifications);
router.patch('/hospital/notifications/:id/read', hospitalStaffRoles, hospitalController.markNotificationRead);
router.patch('/hospital/notifications/read-all', hospitalStaffRoles, hospitalController.markAllNotificationsRead);

// Transfers
router.get('/hospital/transfers', hospitalStaffRoles, hospitalController.listTransfers);
router.post('/hospital/transfers', hospitalStaffRoles, validateRequest(createTransferSchema), hospitalController.createTransfer);
router.patch('/hospital/transfers/:id/status', hospitalStaffRoles, requireOwnership({ resourceType: 'transfer_requests' }), auditLog('transfer_update'), validateRequest(updateTransferStatusSchema), hospitalController.updateTransferStatus);

// AI Gateways & Thresholds
router.get('/admin/forecast', hospitalStaffRoles, hospitalController.getForecastGateway);
router.get('/admin/waste-analytics', hospitalStaffRoles, hospitalController.getWasteAnalyticsGateway);
router.get('/admin/thresholds', hospitalStaffRoles, hospitalController.getThresholds);
router.put('/admin/thresholds', hospitalStaffRoles, validateRequest(updateThresholdsSchema), hospitalController.updateThresholds);

module.exports = router;

