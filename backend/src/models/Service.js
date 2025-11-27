/**
 * Service Model
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Reference: [Service_Model] -> [Service_Schema]
 */

const db = require('./db');

class Service {
  /**
   * Get all services
   * STLC: [Query_Services_Table]
   * - operation: SELECT
   * - table: services
   * - condition: ORDER BY duration ASC
   * - cache: true (handled at route level)
   * - complexity_time: O(n)
   */
  static getAll() {
    const stmt = db.prepare('SELECT * FROM services ORDER BY duration ASC');
    return stmt.all();
  }

  /**
   * Get service by ID
   * STLC: [Validate_Service_Exists]
   * - Used for validation in booking creation
   */
  static getById(id) {
    const stmt = db.prepare('SELECT * FROM services WHERE id = ?');
    return stmt.get(id);
  }
}

module.exports = Service;
