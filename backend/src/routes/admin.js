/**
 * Admin API Routes
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Flow:
 * - POST /api/admin/login: [Entry_Admin_Login] -> [Validate_Password]
 *   -> [Return_Success_200] | [Return_Error_401]
 * - GET /api/admin/bookings: [Entry_Get_Admin_Bookings] -> [Check_Auth]
 *   -> [Query_Bookings_JOIN] -> [Return_Success_200]
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');

/**
 * POST /api/admin/login
 *
 * STLC Specifications:
 * - http_method: POST
 * - endpoint: /api/admin/login
 * - auth_required: false (this IS the auth endpoint)
 * - security_critical: true
 * - value: "Bad" (demo-only, insecure for production)
 * - max_time: 50ms
 * - http_status: 200 (success) | 401 (unauthorized) | 400 (validation error)
 *
 * ⚠️ WARNING: This is a DEMO-ONLY authentication mechanism.
 * Production systems should use:
 * - JWT tokens with expiration
 * - Secure session management
 * - Password hashing (bcrypt/argon2)
 * - Rate limiting
 * - HTTPS only
 */
router.post('/login', [
  // STLC: [Validate_Password_Field]
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
], (req, res) => {
  try {
    // STLC: [Check_Validation_Results]
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // STLC: [Return_Error_400]
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // STLC: [Extract_Password]
    const { password } = req.body;

    // STLC: [Compare_With_Environment_Password]
    // operation: STRING_COMPARE, security_critical: true
    // Use environment variable or fallback to default (demo only)
    const adminPassword = process.env.ADMIN_PASSWORD || 'demo123';

    if (!process.env.ADMIN_PASSWORD) {
      console.warn('⚠️  ADMIN_PASSWORD not set, using default password (demo123)');
    }

    // STLC: [Branch_Password_Match]
    if (password === adminPassword) {
      // STLC: [Return_Success_200]
      // NOTE: In production, this would return a JWT token or create a session
      res.status(200).json({
        success: true,
        message: 'Login successful',
        // Demo-only: In production, return a proper auth token
        authenticated: true
      });
    } else {
      // STLC: [Return_Error_401] - Unauthorized
      // http_status: 401, error_type: AuthenticationError
      res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

  } catch (error) {
    // STLC: [Error_Unexpected] -> [Exit_Error]
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * Simple auth middleware (DEMO ONLY)
 * STLC: [Middleware_Check_Auth]
 *
 * ⚠️ WARNING: This is NOT secure for production!
 * Production should verify JWT tokens or sessions.
 */
const checkAuth = (req, res, next) => {
  // STLC: [Extract_Auth_Header]
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // STLC: [Return_Error_401] - No auth header
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // STLC: [Validate_Bearer_Token]
  // Demo-only: Just check if the password is sent in Authorization header
  const token = authHeader.replace('Bearer ', '');

  if (token !== process.env.ADMIN_PASSWORD) {
    // STLC: [Return_Error_401] - Invalid token
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }

  // STLC: [Auth_Success] -> [Continue_To_Handler]
  next();
};

/**
 * GET /api/admin/bookings
 *
 * STLC Specifications:
 * - http_method: GET
 * - endpoint: /api/admin/bookings
 * - auth_required: true
 * - cache: false (always fresh data)
 * - max_time: 150ms
 * - http_status: 200 (success) | 401 (unauthorized) | 500 (error)
 */
router.get('/bookings', checkAuth, (req, res) => {
  try {
    const { date } = req.query;
    let bookings;

    if (date) {
      // STLC: [Validate_Date_Format]
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      // STLC: [Query_Bookings_By_Date]
      bookings = Booking.getByDate(date);
    } else {
      // STLC: [Query_Bookings_JOIN_Services]
      bookings = Booking.getAll();
    }

    // STLC: [Transform_To_JSON] -> [Return_Success_200]
    // format: JSON, http_status: 200
    res.status(200).json({
      success: true,
      bookings: bookings
    });

  } catch (error) {
    // STLC: [Error_Database] -> [Exit_Error]
    // http_status: 500, error_type: DatabaseError
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve bookings'
    });
  }
});

module.exports = router;
