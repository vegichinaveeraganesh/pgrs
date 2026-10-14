const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');
const env = require('./config/env');

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS setup
const allowedOrigins = [
  ...env.frontendUrl.split(',').map(u => u.trim()).filter(Boolean),
  'http://localhost:4200',
  'http://127.0.0.1:4200'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (env.nodeEnv === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }
    return callback(null, true); // Permissive in dev
  },
  credentials: true
}));

// Logger
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static directory for uploaded endorsement documents
const uploadDir = path.resolve(env.uploadDir);
app.use('/uploads', express.static(uploadDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'RDO Bhimunipatnam PGRS Backend'
  });
});

// API Routes
app.use('/api', routes);

// Centralized error handler
app.use(errorHandler);

module.exports = app;
