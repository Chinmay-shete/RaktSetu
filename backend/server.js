require('dotenv').config();
const { setupGlobalLogger, logger } = require('./services/logger');
setupGlobalLogger();

const express = require('express');
const cors = require('cors');
const pinoHttp = require('pino-http');

const { testConnection } = require('./config/db');
const apiRouter = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS (allow React frontend local ports and support env overrides)
const corsOriginEnv = process.env.CORS_ORIGIN;

if (process.env.NODE_ENV === 'production' && !corsOriginEnv) {
  console.error("CRITICAL ERROR: CORS_ORIGIN environment variable must be explicitly defined in production.");
  process.exit(1);
}

if (!process.env.AI_SERVICE_URL) {
  console.error("CRITICAL ERROR: AI_SERVICE_URL environment variable is missing.");
  process.exit(1);
}

const allowedOrigins = corsOriginEnv
  ? corsOriginEnv.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'));
  },
  credentials: true
}));

// Custom Rate Limiting Middleware (100 req/min)
const rateLimitWindowMs = 60 * 1000;
const rateLimitMaxRequests = 100;
const ipRequestMap = new Map();

function rateLimiter(req, res, next) {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!ipRequestMap.has(ip)) {
    ipRequestMap.set(ip, []);
  }

  const timestamps = ipRequestMap.get(ip);
  const activeTimestamps = timestamps.filter(timestamp => now - timestamp < rateLimitWindowMs);

  if (activeTimestamps.length >= rateLimitMaxRequests) {
    return res.status(429).json({
      error: true,
      message: 'Too many requests, please try again later.',
      code: 'TOO_MANY_REQUESTS'
    });
  }

  activeTimestamps.push(now);
  ipRequestMap.set(ip, activeTimestamps);
  next();
}

app.use(rateLimiter);

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(pinoHttp({ logger }));
} else {
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

if (require.main === module) {
  startServer();
}

module.exports = app; // For testing purposes
