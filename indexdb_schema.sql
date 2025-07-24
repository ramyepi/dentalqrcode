-- INDEXEDDB (Dexie) SCHEMA DOCUMENTATION
-- This is a documentation of the IndexedDB structure used previously in the app.
-- Not executable in Supabase/Postgres, for reference only.

-- clinics table
CREATE TABLE clinics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar TEXT,
  name_en TEXT,
  license_number TEXT,
  specialization_id INTEGER,
  governorate_id INTEGER,
  city_id INTEGER,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN,
  created_at DATETIME
);

-- governorates table
CREATE TABLE governorates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar TEXT,
  name_en TEXT
);

-- cities table
CREATE TABLE cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar TEXT,
  name_en TEXT,
  governorate_id INTEGER
);

-- specializations table
CREATE TABLE specializations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_ar TEXT,
  name_en TEXT,
  sort_order INTEGER,
  is_active BOOLEAN
);

-- site_settings table
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT,
  value TEXT,
  updated_at DATETIME
); 