/**
 * Database Initialization Script
 * Compiled from STLC Specifications: MASSAGE_SHOP_STLC_SPECS.md
 *
 * STLC References:
 * - [Service_Model] -> [Service_Schema]
 * - [Booking_Model] -> [Booking_Schema]
 * - [Seed_Data_Services]
 */

const Database = require('better-sqlite3');
const path = require('path');

// Database file location
const dbPath = path.join(__dirname, '../../../data/bookings.db');

// Initialize database connection
const db = new Database(dbPath);

// Enable foreign key constraints (STLC: necessity="Necessary")
db.pragma('foreign_keys = ON');

console.log('📦 Initializing database...');

try {
  // Create services table
  // STLC: [Service_Schema] -> [Table_Definition]
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      duration INTEGER NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  console.log('✅ Services table created');

  // Create bookings table
  // STLC: [Booking_Schema] -> [Table_Definition]
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      booking_time TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
    )
  `);
  console.log('✅ Bookings table created');

  // Create indexes
  // STLC: [Index_Service_ID], [Index_Booking_Date], [Index_Created_At]
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
    CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
  `);
  console.log('✅ Indexes created');

  // Insert seed data (STLC: idempotent=true)
  // STLC: [Seed_Data_Services] -> [Service_Relax_Massage]
  const insertService = db.prepare(`
    INSERT OR IGNORE INTO services (id, name, duration, price, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const services = [
    {
      id: 1,
      name: 'Relax Massage',
      duration: 30,
      price: 60.00,
      description: 'Gentle relaxation massage to relieve stress and tension'
    },
    {
      id: 2,
      name: 'Deep Tissue Massage',
      duration: 60,
      price: 120.00,
      description: 'Therapeutic deep tissue work for muscle pain relief'
    },
    {
      id: 3,
      name: 'Hot Stone Massage',
      duration: 90,
      price: 180.00,
      description: 'Relaxing hot stone therapy for deep muscle relaxation'
    }
  ];

  services.forEach(service => {
    insertService.run(service.id, service.name, service.duration, service.price, service.description);
  });

  console.log('✅ Seed data inserted (3 services)');
  console.log('🎉 Database initialization complete!');

} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
