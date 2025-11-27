/**
 * Services API Routes
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Flow: [Entry_Get_Services] -> [Query_Services_Table]
 *            -> [Transform_To_JSON] -> [Return_Success_200]
 */

const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

/**
 * GET /api/services
 *
 * STLC Specifications:
 * - http_method: GET
 * - endpoint: /api/services
 * - auth_required: false
 * - cache: true (cache_ttl: 3600s)
 * - max_time: 100ms
 * - http_status: 200 (success) | 500 (error)
 */
router.get('/', (req, res) => {
  try {
    // STLC: [Query_Services_Table]
    // operation: SELECT, table: services, condition: ORDER BY duration ASC
    const services = Service.getAll();

    // STLC: [Transform_To_JSON] -> [Return_Success_200]
    // format: JSON, http_status: 200
    res.status(200).json(services);

  } catch (error) {
    // STLC: [Error_Database] -> [Exit_Error]
    // http_status: 500, error_type: DatabaseError
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve services'
    });
  }
});

module.exports = router;
