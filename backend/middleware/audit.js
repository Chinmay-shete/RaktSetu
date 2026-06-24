const { pool } = require('../config/db');

/**
 * Express middleware to automatically log modifications and deletions to the audit_logs table.
 */
function auditLog(actionType) {
  return (req, res, next) => {
    // Hook into response finish event
    res.on('finish', async () => {
      // Log only on successful responses (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const actorId = req.user ? req.user.id : null;
          const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
          
          let action = '';
          let severity = 'info';

          if (actionType === 'inventory_update') {
            action = `Updated blood batch ID ${req.params.id}`;
          } else if (actionType === 'inventory_delete') {
            action = `Deleted blood batch ID ${req.params.id}`;
            severity = 'warning';
          } else if (actionType === 'transfer_update') {
            const status = req.body.status;
            action = `Updated transfer request status for ID ${req.params.id} to ${status}`;
            if (status === 'accepted') {
              severity = 'warning';
            }
          }

          if (action) {
            await pool.query(
              'INSERT INTO audit_logs (actor_id, action, severity, ip_address) VALUES (?, ?, ?, ?)',
              [actorId, action, severity, ipAddress]
            );
          }
        } catch (err) {
          console.error('Failed to write audit log:', err);
        }
      }
    });
    next();
  };
}

module.exports = { auditLog };
