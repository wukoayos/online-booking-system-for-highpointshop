/**
 * Database Connection Module
 * Compiled from STLC Specifications
 *
 * STLC: Database connection singleton with foreign keys enabled
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../data/bookings.db');
const db = new Database(dbPath);

// Enable foreign key constraints (STLC: necessity="Necessary")
db.pragma('foreign_keys = ON');

module.exports = db;
