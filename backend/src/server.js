/**
 * Main Server Entry Point
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Architecture: [Express_Server] -> [Middleware_Stack]
 *                    -> [Route_Handlers] -> [Database_Layer]
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const servicesRouter = require('./routes/services');
const bookingsRouter = require('./routes/bookings');
const adminRouter = require('./routes/admin');

// STLC: [Initialize_Express_App]
const app = express();
const PORT = process.env.PORT || 3000;

/**
 * STLC: [Middleware_Stack]
 * - CORS enabled for frontend
 * - JSON body parser
 * - Request logging
 */

// Enable CORS for frontend (STLC: necessity="Necessary")
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse JSON request bodies (STLC: max_body_size="10MB")
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple request logging middleware
// STLC: [Log_Request] - For debugging and monitoring
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * STLC: [Mount_Route_Handlers]
 * - /api/services -> servicesRouter
 * - /api/bookings -> bookingsRouter
 * - /api/admin -> adminRouter
 */

// Mount routes
app.use('/api/services', servicesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/admin', adminRouter);

/**
 * STLC: [Health_Check_Endpoint]
 * Simple endpoint to verify server is running
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * STLC: [404_Handler]
 * Catch all unmatched routes
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

/**
 * STLC: [Global_Error_Handler]
 * Catch any unhandled errors
 */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * STLC: [Start_Server]
 * - Listen on configured PORT
 * - Log startup message
 */
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Massage Shop API Server');
  console.log('='.repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API endpoints:`);
  console.log(`   GET  /api/services - List all services`);
  console.log(`   POST /api/bookings - Create booking`);
  console.log(`   POST /api/admin/login - Admin login`);
  console.log(`   GET  /api/admin/bookings - List all bookings (auth required)`);
  console.log('='.repeat(50));
  console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 Admin password configured: ${process.env.ADMIN_PASSWORD ? '✓' : '✗'}`);
  console.log('='.repeat(50));
});

module.exports = app;
