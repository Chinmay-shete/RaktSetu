const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Log basic request info
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount routes with /v1 prefix
app.use('/v1', routes);

// Catch 404 routes and forward to error handler
app.use((req, res, next) => {
  const err = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  err.statusCode = 404;
  err.code = 'NOT_FOUND';
  next(err);
});

// Attach global error handler middleware (must be after routes)
app.use(errorHandler);

// Start server and verify DB connectivity
async function startServer() {
  try {
    // 1. Verify DB Connection
    await testConnection();

    // 2. Listen on Port
    app.listen(PORT, () => {
      console.log(`🚀 RaktSetu backend server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 Health Check Endpoint: http://localhost:${PORT}/v1/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server due to database connectivity issue.');
    process.exit(1);
  }
}

startServer();

module.exports = app; // For testing purposes
