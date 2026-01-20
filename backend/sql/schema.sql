-- SQLite schema for Hotel Management System

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS staff_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_number TEXT NOT NULL UNIQUE,
  room_type TEXT NOT NULL,
  price_per_night REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'available', -- available | occupied | maintenance
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS guests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  guest_id INTEGER NOT NULL,
  room_id INTEGER NOT NULL,
  check_in TEXT NOT NULL,  -- YYYY-MM-DD
  check_out TEXT NOT NULL, -- YYYY-MM-DD
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed | checked_in | checked_out | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_bookings_checkin ON bookings(check_in);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest ON bookings(guest_id);
