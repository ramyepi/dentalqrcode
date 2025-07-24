-- 1. PROFILES TABLE (linked to Supabase Auth users, with role)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  role text default 'user', -- user role: 'user', 'admin', 'doctor', etc.
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Ensure 'role' column exists (for migrations or previous table versions)
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name='profiles' and column_name='role'
  ) then
    alter table profiles add column role text default 'user';
  end if;
end $$;

-- 2. GOVERNORATES TABLE
create table if not exists governorates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- 3. CITIES TABLE (linked to governorates)
create table if not exists cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  governorate_id uuid references governorates(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- 4. CLINICS TABLE
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

-- 5. SITE SETTINGS TABLE
create table if not exists site_settings (
  key text primary key,
  value text,
  description text
);

-- 6. (Optional) Add indexes for performance
create index if not exists idx_clinics_license_number on clinics(license_number);
create index if not exists idx_cities_governorate_id on cities(governorate_id);

-- 7. (Optional) Add RLS policies as needed (for Supabase security)
-- Enable RLS on profiles
alter table profiles enable row level security;

-- Allow users to select/update their own profile
create policy "Allow individual read access" on profiles
  for select using (auth.uid() = id);

create policy "Allow individual update access" on profiles
  for update using (auth.uid() = id);

-- Allow admins to select all profiles
create policy "Allow admin read access" on profiles
  for select using (role = 'admin'); 