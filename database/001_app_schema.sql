BEGIN;

CREATE TABLE IF NOT EXISTS location_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'pin',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO location_categories (id, name, icon)
SELECT DISTINCT category, category, 'pin'
FROM "Location"
WHERE category IS NOT NULL AND btrim(category) <> ''
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES location_categories(id) ON DELETE SET NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO locations (id, name, category_id, active)
SELECT id, name, NULLIF(category, ''), active
FROM "Location"
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  max_passengers INTEGER NOT NULL DEFAULT 1,
  max_luggage INTEGER NOT NULL DEFAULT 1,
  img TEXT NOT NULL DEFAULT '',
  price DOUBLE PRECISION NOT NULL DEFAULT 0,
  tag TEXT NOT NULL DEFAULT '',
  special TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO vehicles (
  id, name, model, max_passengers, max_luggage, img, price, active, sort_order
)
SELECT
  id, name, type, passengers, luggage, image, "basePrice", active,
  (ROW_NUMBER() OVER (ORDER BY "createdAt", id) - 1)::INTEGER
FROM "Vehicle"
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS rates (
  id TEXT PRIMARY KEY,
  from_loc_id TEXT NOT NULL,
  to_loc_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  p1 DOUBLE PRECISION,
  p2 DOUBLE PRECISION,
  p3 DOUBLE PRECISION,
  p4 DOUBLE PRECISION,
  p5 DOUBLE PRECISION,
  p6 DOUBLE PRECISION,
  p7 DOUBLE PRECISION,
  p8 DOUBLE PRECISION,
  on_demand BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (from_loc_id, to_loc_id, vehicle_id)
);

INSERT INTO rates (
  id, from_loc_id, to_loc_id, vehicle_id, p1, on_demand, active
)
SELECT id, "fromLocationId", "toLocationId", "vehicleId", price, FALSE, TRUE
FROM "Rate"
ON CONFLICT (from_loc_id, to_loc_id, vehicle_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  from_loc_id TEXT,
  to_loc_id TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  passengers INTEGER NOT NULL DEFAULT 1,
  kids INTEGER NOT NULL DEFAULT 0,
  bags INTEGER NOT NULL DEFAULT 1,
  vehicle_id TEXT,
  name TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO bookings (
  id, from_loc_id, to_loc_id, date, time, vehicle_id,
  name, country, whatsapp, email, notes, status, created_at
)
SELECT
  b.id,
  COALESCE(from_location.id, b."fromText"),
  COALESCE(to_location.id, b."toText"),
  b.date::DATE,
  b.time,
  COALESCE(b."vehicleId", b."vehicleName"),
  b.name,
  COALESCE(b.country, ''),
  b.phone,
  b.email,
  COALESCE(b.note, ''),
  b.status,
  b."createdAt"
FROM "Booking" b
LEFT JOIN "Location" from_location ON from_location.name = b."fromText"
LEFT JOIN "Location" to_location ON to_location.name = b."toText"
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS features (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY DEFAULT md5(random()::TEXT || clock_timestamp()::TEXT),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  location TEXT,
  country TEXT,
  city TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  website_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  source TEXT NOT NULL DEFAULT 'manual'
);

COMMIT;
