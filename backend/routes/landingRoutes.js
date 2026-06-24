const express = require('express');
const donorController = require('../controllers/donorController');
const { validateRequest, demoRequestSchema } = require('../middleware/validation');

const router = express.Router();

// Landing page pilot demo requests
router.post('/demo-request', validateRequest(demoRequestSchema), donorController.saveDemoRequest);

module.exports = router;
