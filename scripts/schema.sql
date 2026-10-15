-- ==========================================================
-- BUSWAY PRODUCTION POSTGRESQL SCHEMA (DDL)
-- Market: Kolkata, West Bengal, India
-- Timezone: Asia/Kolkata
-- ==========================================================

-- 1. Roles & Users
CREATE TABLE IF NOT EXISTS roles (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'passenger',
  is_verified BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(128) NOT NULL,
  avatar_url TEXT,
  preferred_corridor VARCHAR(64),
  home_stop_id VARCHAR(64),
  office_stop_id VARCHAR(64),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fleet Operators & Compliance
CREATE TABLE IF NOT EXISTS operators (
  id VARCHAR(64) PRIMARY KEY,
  trade_name VARCHAR(128) NOT NULL,
  contact_person VARCHAR(128) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(255) NOT NULL,
  trade_license_number VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PENDING_APPROVAL, SUSPENDED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(64) PRIMARY KEY,
  operator_id VARCHAR(64) REFERENCES operators(id) ON DELETE RESTRICT,
  registration_number VARCHAR(32) UNIQUE NOT NULL, -- e.g. WB 25 3751
  model VARCHAR(64) NOT NULL,
  total_capacity INT NOT NULL,
  color VARCHAR(32) DEFAULT 'White & Blue',
  fitness_valid_until DATE NOT NULL,
  insurance_valid_until DATE NOT NULL,
  permit_valid_until DATE NOT NULL,
  is_compliant BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  phone VARCHAR(32) UNIQUE NOT NULL,
  commercial_license_number VARCHAR(64) UNIQUE NOT NULL,
  rating NUMERIC(3,2) DEFAULT 4.80,
  total_rides INT DEFAULT 0,
  current_vehicle_id VARCHAR(64) REFERENCES vehicles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Transit Topology & Published Corridors
CREATE TABLE IF NOT EXISTS routes (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL, -- e.g. BW-101
  origin VARCHAR(128) NOT NULL,
  destination VARCHAR(128) NOT NULL,
  corridor VARCHAR(64) NOT NULL, -- Sector V, New Town, Ecospace
  base_fare NUMERIC(8,2) NOT NULL,
  distance_km NUMERIC(5,1) NOT NULL,
  est_duration_mins INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  operator_id VARCHAR(64) REFERENCES operators(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_stops (
  id VARCHAR(64) PRIMARY KEY,
  route_id VARCHAR(64) REFERENCES routes(id) ON DELETE CASCADE,
  stop_name VARCHAR(128) NOT NULL,
  scheduled_minute_offset INT NOT NULL,
  is_pickup_allowed BOOLEAN DEFAULT TRUE,
  is_drop_allowed BOOLEAN DEFAULT TRUE,
  sequence_order INT NOT NULL
);

-- 4. Trip Instances & Atomic Inventory
CREATE TABLE IF NOT EXISTS trip_instances (
  id VARCHAR(64) PRIMARY KEY,
  route_id VARCHAR(64) REFERENCES routes(id) ON DELETE RESTRICT,
  vehicle_id VARCHAR(64) REFERENCES vehicles(id) ON DELETE RESTRICT,
  driver_id VARCHAR(64) REFERENCES drivers(id) ON DELETE RESTRICT,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  est_arrival_time TIME NOT NULL,
  total_capacity INT NOT NULL,
  available_capacity INT NOT NULL,
  fare NUMERIC(8,2) NOT NULL,
  status VARCHAR(32) DEFAULT 'SCHEDULED', -- SCHEDULED, ON_ROUTE, COMPLETED, CANCELLED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_capacity_non_negative CHECK (available_capacity >= 0)
);

CREATE TABLE IF NOT EXISTS capacity_holds (
  hold_token VARCHAR(64) PRIMARY KEY,
  trip_id VARCHAR(64) REFERENCES trip_instances(id) ON DELETE CASCADE,
  passenger_count INT NOT NULL,
  total_fare NUMERIC(8,2) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings & Digital Tickets
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(64) PRIMARY KEY,
  booking_number VARCHAR(64) UNIQUE NOT NULL, -- e.g. BW02NDE0MUZN6R67U6GB
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
  trip_id VARCHAR(64) REFERENCES trip_instances(id) ON DELETE RESTRICT,
  route_id VARCHAR(64) REFERENCES routes(id) ON DELETE RESTRICT,
  origin VARCHAR(128) NOT NULL,
  destination VARCHAR(128) NOT NULL,
  passenger_count INT NOT NULL,
  fare NUMERIC(8,2) NOT NULL,
  payment_status VARCHAR(32) NOT NULL, -- SUCCESS, REFUNDED, PENDING
  booking_status VARCHAR(32) NOT NULL, -- CONFIRMED, COMPLETED, CANCELLED
  ticket_qr_token VARCHAR(128) UNIQUE NOT NULL,
  seat_numbers TEXT[] NOT NULL,
  is_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ticket_scans (
  id VARCHAR(64) PRIMARY KEY,
  ticket_qr_token VARCHAR(128) NOT NULL,
  booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE RESTRICT,
  scanned_by_driver_id VARCHAR(64) REFERENCES drivers(id) ON DELETE RESTRICT,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  gps_lat NUMERIC(9,6),
  gps_lng NUMERIC(9,6),
  CONSTRAINT unique_ticket_boarded UNIQUE (ticket_qr_token)
);

-- 6. Financial Ledger & Wallet
CREATE TABLE IF NOT EXISTS wallet_accounts (
  user_id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT,
  available_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  promotional_credit NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT check_wallet_non_negative CHECK (available_balance >= 0)
);

CREATE TABLE IF NOT EXISTS wallet_ledger_entries (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE RESTRICT,
  transaction_type VARCHAR(32) NOT NULL, -- TOPUP, RIDE_DEBIT, REFUND, PROMO_CREDIT
  amount NUMERIC(10,2) NOT NULL,
  balance_after NUMERIC(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Trail & Idempotency
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor_email VARCHAR(255) NOT NULL,
  actor_role VARCHAR(32) NOT NULL,
  action VARCHAR(64) NOT NULL,
  target_resource VARCHAR(128) NOT NULL,
  reason TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key VARCHAR(128) PRIMARY KEY,
  resource_created_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Essential Performance Indexes
CREATE INDEX IF NOT EXISTS idx_trips_search ON trip_instances(departure_date, status, available_capacity);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_ticket_token ON bookings(ticket_qr_token);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON wallet_ledger_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
