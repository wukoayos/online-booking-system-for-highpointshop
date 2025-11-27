/**
 * Bookings API Routes
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Flow: [Entry_Create_Booking] -> [Extract_Request_Body]
 *            -> [7-Stage_Validation_Chain] -> [Insert_Booking_Record]
 *            -> [Return_Success_201] | [Return_Error_400/500]
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Service = require('../models/Service');

/**
 * POST /api/bookings
 *
 * STLC Specifications:
 * - http_method: POST
 * - endpoint: /api/bookings
 * - auth_required: false
 * - idempotent: false
 * - max_time: 200ms
 * - http_status: 201 (success) | 400 (validation error) | 500 (database error)
 * - validation_chain: 7 stages
 */

// STLC: [Validation_Chain] - 7-stage validation
const bookingValidation = [
  // STLC: [Validate_Service_ID]
  // constraint: NOT_NULL AND type=integer
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required')
    .isInt({ min: 1 })
    .withMessage('Service ID must be a positive integer')
    .custom(async (value) => {
      // STLC: [Validate_Service_Exists] - Database lookup
      const service = Service.getById(value);
      if (!service) {
        throw new Error('Service does not exist');
      }
      return true;
    }),

  // STLC: [Validate_Booking_Date]
  // constraint: format="YYYY-MM-DD" AND future_only=true
  body('date')
    .notEmpty()
    .withMessage('Booking date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format')
    .custom((value) => {
      const bookingDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (bookingDate < today) {
        throw new Error('Booking date must be in the future');
      }
      return true;
    }),

  // STLC: [Validate_Booking_Time]
  // constraint: format="HH:MM" (24-hour)
  body('time')
    .notEmpty()
    .withMessage('Booking time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Time must be in HH:MM format (24-hour)'),

  // STLC: [Validate_Customer_Name]
  // constraint: min_length=2, max_length=100
  body('customerName')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .trim(),

  // STLC: [Validate_Customer_Email]
  // constraint: RFC5322_email_format
  body('customerEmail')
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),

  // STLC: [Validate_Customer_Phone]
  // constraint: min_length=10
  body('customerPhone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .isLength({ min: 10 })
    .withMessage('Phone number must be at least 10 characters')
    .trim()
];

// STLC: [Entry_Create_Booking] -> Main handler
router.post('/', bookingValidation, (req, res) => {
  try {
    // STLC: [Check_Validation_Results]
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // STLC: [Return_Error_400] - Validation failed
      // http_status: 400, error_type: ValidationError
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // STLC: [Extract_Request_Body]
    const { serviceId, date, time, customerName, customerEmail, customerPhone } = req.body;

    // STLC: [Insert_Booking_Record]
    // type: mutation, operation: INSERT, idempotent: false, transaction: true
    const bookingId = Booking.create({
      serviceId,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone
    });

    // STLC: [Return_Success_201]
    // http_status: 201, format: JSON
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: bookingId,
        serviceId,
        date,
        time,
        customerName,
        customerEmail,
        customerPhone
      }
    });

  } catch (error) {
    // STLC: [Error_Database] -> [Exit_Error]
    // http_status: 500, error_type: DatabaseError
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
});

module.exports = router;
