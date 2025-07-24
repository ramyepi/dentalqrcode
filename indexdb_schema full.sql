-- Clinics table
CREATE TABLE public.clinics (
  id SERIAL PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT,
  license_number TEXT,
  specialization_id INTEGER,
  governorate_id INTEGER,
  city_id INTEGER,
  address TEXT,
  phone TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Governorates table
CREATE TABLE public.governorates (
  id SERIAL PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT
);

-- Cities table
CREATE TABLE public.cities (
  id SERIAL PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT,
  governorate_id INTEGER REFERENCES public.governorates(id) ON DELETE CASCADE
);

-- Specializations table
CREATE TABLE public.specializations (
  id SERIAL PRIMARY KEY,
  name_ar TEXT,
  name_en TEXT,
  sort_order INTEGER,
  is_active BOOLEAN
);

-- Site Settings table
CREATE TABLE public.site_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
