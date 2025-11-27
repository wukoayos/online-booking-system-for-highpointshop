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

module.exports = db;
