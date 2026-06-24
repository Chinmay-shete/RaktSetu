const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const apiRouter = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS (default to allow React frontend local ports)
app.use(cors({
  origin: true, // Allow all origins for development, can restrict to specific origins in prod
  credentials: true
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Register routing prefix
app.use('/api/v1', apiRouter);

// Register global error handler
app.use(errorHandler);

// Start Express server and verify DB connection
async function startServer() {
  const isDbConnected = await testConnection();
  if (!isDbConnected) {
    console.warn('Warning: Database connection could not be verified at startup.');
  }

  const server = app.listen(PORT, () => {
    console.log(`RaktSetu API Core Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
    console.log(`Health check is available at: http://localhost:${PORT}/api/v1/health`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`[Port Conflict] Port ${PORT} is already in use (common on macOS due to AirPlay Receiver).`);
      const fallbackPort = 5002;
      console.log(`Attempting to start server on fallback port ${fallbackPort}...`);
      
      const fallbackServer = app.listen(fallbackPort, () => {
        console.log(`RaktSetu API Core Server successfully running on fallback port ${fallbackPort}.`);
        console.log(`Health check is available at: http://localhost:${fallbackPort}/api/v1/health`);
      });
      
      fallbackServer.on('error', (err) => {
        console.error('Failed to bind to fallback port as well:', err.message);
        process.exit(1);
      });
    } else {
      console.error('Server error:', error.message);
      process.exit(1);
    }
  });
}

startServer();

module.exports = app; // For testing purposes
