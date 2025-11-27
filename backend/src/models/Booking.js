/**
 * Booking Model
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC Reference: [Booking_Model] -> [Booking_Schema]
 */

const db = require('./db');

class Booking {
  /**
   * Create a new booking
   * STLC: [Insert_Booking_Record]
   * - type: mutation
   * - operation: INSERT
   * - table: bookings
   * - idempotent: false
   * - transaction: true
   */
  static create(bookingData) {
    const stmt = db.prepare(`
      INSERT INTO bookings (
        service_id, booking_date, booking_time,
        customer_name, customer_email, customer_phone
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      bookingData.serviceId,
      bookingData.date,
      bookingData.time,
      bookingData.customerName,
      bookingData.customerEmail,
      bookingData.customerPhone
    );

    return result.lastInsertRowid;
  }

  /**
   * Get all bookings with service details (for admin)
   * STLC: [Query_Bookings_JOIN_Services]
   * - type: query
   * - operation: SELECT_JOIN
   * - condition: ORDER BY created_at DESC
   */
  static getAll() {
    const stmt = db.prepare(`
      SELECT
        b.id,
        b.booking_date as date,
        b.booking_time as time,
        b.customer_name as customerName,
        b.customer_email as customerEmail,
        b.customer_phone as customerPhone,
        b.created_at as createdAt,
        s.name as serviceName,
        s.duration,
        s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      ORDER BY b.created_at DESC
    `);
    return stmt.all();
  }

  /**
   * Get bookings for a specific date with service details
   * STLC: [Query_Bookings_By_Date]
   * - type: query
   * - operation: SELECT_JOIN
   * - condition: WHERE booking_date = ?
   */
  static getByDate(date) {
    const stmt = db.prepare(`
      SELECT
        b.id,
        b.booking_date as date,
        b.booking_time as time,
        b.customer_name as customerName,
        b.customer_email as customerEmail,
        b.customer_phone as customerPhone,
        b.created_at as createdAt,
        s.name as serviceName,
        s.duration,
        s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.booking_date = ?
      ORDER BY b.booking_time ASC, b.created_at DESC
    `);
    return stmt.all(date);
  }

  /**
   * Get booking by ID
   */
  static getById(id) {
    const stmt = db.prepare(`
      SELECT
        b.*,
        s.name as service_name,
        s.duration,
        s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `);
    return stmt.get(id);
  }
}

module.exports = Booking;
