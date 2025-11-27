/**
 * Database Connection Module
 * Compiled from STLC Specifications
 *
 * STLC: Database connection singleton with foreign keys enabled
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'bookings.db');
const db = new Database(dbPath);

// Enable foreign key constraints (STLC: necessity="Necessary")
db.pragma('foreign_keys = ON');

// Auto-initialize database on first connection
try {
  // Create services table
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

  // Create bookings table
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

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
    CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
    CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
  `);

  // Insert seed data (idempotent)
  const count = db.prepare('SELECT COUNT(*) as count FROM services').get();
  if (count.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (id, name, duration, price, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const services = [
      [1, 'Relax Massage', 30, 60.00, 'Gentle relaxation massage to relieve stress and tension'],
      [2, 'Deep Tissue Massage', 60, 120.00, 'Therapeutic deep tissue work for muscle pain relief'],
      [3, 'Hot Stone Massage', 90, 180.00, 'Relaxing hot stone therapy for deep muscle relaxation']
    ];

    services.forEach(service => insertService.run(...service));
    console.log('✅ Database initialized with 3 services');
  }
} catch (error) {
  console.error('❌ Database initialization error:', error.message);
}

module.exports = db;
