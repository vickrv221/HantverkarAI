const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

/**
 * HantverkarAI Backend Server
 * Express.js server med MongoDB integration och RESTful API
 */

const app = express();

// Middleware för CORS och JSON parsing
app.use(cors());
app.use(express.json());

// Debug: Visa miljövariabler (ta bort i produktion)
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');

/**
 * Databasanslutning till MongoDB Atlas
 */

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Avsluta processen om databas inte kan ansluta
});

// Import av routes
const authRoutes = require('./routes/auth');
const offerRoutes = require('./routes/offers');
const aiRoutes = require('./routes/ai');

/**
 * API Routes
 * Alla routes är prefixade med /api
 */

app.use('/api/auth', authRoutes);     // Autentisering (login, register)
app.use('/api/offers', offerRoutes);  // Offerthantering (CRUD)
app.use('/api/ai', aiRoutes);         // AI-tjänster (OpenAI integration)

/**
 * Hälsokontroll endpoint
 * GET /api/health - Kontrollera om servern körs
 */

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({ 
    message: 'HantverkarAI Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      offers: '/api/offers', 
      ai: '/api/ai',
      health: '/api/health'
    }
  });
});

/**
 * Generell Error Handler
 * Fångar upp alla fel som inte hanteras av specifika routes
 */
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      message: 'Valideringsfel', 
      errors: errors,
      type: 'validation_error'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Ogiltig token',
      type: 'auth_error'
    });
  }

  // JWT expired errors
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token har gått ut',
      type: 'auth_error'
    });
  }

  // MongoDB duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      message: `${field} finns redan`,
      type: 'duplicate_error'
    });
  }

  // MongoDB cast errors (ogiltigt ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Ogiltigt ID-format',
      type: 'cast_error'
    });
  }

  // Standardfel för okända fel
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Något gick fel på servern';
  
  res.status(status).json({
    message: message,
    type: 'server_error',
    // Visa stack trace endast i development
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
});

/**
 * 404 Handler för okända routes
 * Körs när ingen route matchar
 */

app.use('*', (req, res) => {
  res.status(404).json({ 
    message: `Route ${req.method} ${req.originalUrl} hittades inte`,
    type: 'not_found',
    availableEndpoints: [
      'GET /',
      'POST /api/auth/login',
      'POST /api/auth/register', 
      'GET /api/offers',
      'POST /api/offers',
      'PUT /api/offers/:id',
      'DELETE /api/offers/:id',
      'PATCH /api/offers/:id/status',
      'POST /api/ai/generate',
      'POST /api/ai/materials',
      'GET /api/health'
    ]
  });
});

/**
 * Starta servern
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

/**
 * Stänger ned servern på ett kontrollerat sätt
 */

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});