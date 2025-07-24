-- PROFILES TABLE
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text default 'user',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- GOVERNORATES TABLE
create table if not exists governorates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- CITIES TABLE
create table if not exists cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  governorate_id uuid references governorates(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- CLINICS TABLE
create table if not exists clinics (
  id uuid primary key default uuid_generate_v4(),
  clinic_name text not null,
  license_number text not null,
  doctor_name text,
  specialization text not null,
  license_status text not null,
  phone text,
  governorate text not null,
  city text not null,
  address_details text,
  address text,
  issue_date date,
  expiry_date date,
  verification_count integer default 0,
  qr_code text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- SITE SETTINGS TABLE
create table if not exists site_settings (
  key text primary key,
  value text,
  description text
);

-- Indexes
create index if not exists idx_clinics_license_number on clinics(license_number);
create index if not exists idx_cities_governorate_id on cities(governorate_id);