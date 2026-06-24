const express = require('express');
const systemAdminController = require('../controllers/systemAdminController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();
const sysadminRole = requireRole('sysadmin');

// Apply sysadmin protection to all endpoints in this router
router.use(sysadminRole);

// System Admin Dashboard & Overview
router.get('/systemadmin/dashboard', systemAdminController.getSystemDashboard);
router.get('/systemadmin/pending-approvals', systemAdminController.getPendingApprovals);
router.patch('/systemadmin/hospitals/:id/approve', systemAdminController.approveOrRejectHospital);

// User Accounts Management
router.get('/systemadmin/users', systemAdminController.listUsers);
router.patch('/systemadmin/users/:id', systemAdminController.updateUser);

// Audit Logging
router.get('/systemadmin/audit-logs', systemAdminController.getAuditLogs);

// System Maintenance / DB Backup
router.post('/systemadmin/backup', systemAdminController.triggerBackup);

module.exports = router;
