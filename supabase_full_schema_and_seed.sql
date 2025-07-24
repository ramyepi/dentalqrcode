-- SUPABASE FULL SCHEMA AND SEED

-- 1. profiles table (with role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  full_name text,
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. governorates table
CREATE TABLE IF NOT EXISTS public.governorates (
  id serial PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL
);

-- 3. cities table
CREATE TABLE IF NOT EXISTS public.cities (
  id serial PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  governorate_id integer REFERENCES public.governorates(id)
);

-- 4. specializations table
CREATE TABLE IF NOT EXISTS public.specializations (
  id serial PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true
);

-- 5. clinics table
CREATE TABLE IF NOT EXISTS public.clinics (
  id serial PRIMARY KEY,
  name_ar text NOT NULL,
  name_en text NOT NULL,
  license_number text UNIQUE NOT NULL,
  specialization_id integer REFERENCES public.specializations(id),
  governorate_id integer REFERENCES public.governorates(id),
  city_id integer REFERENCES public.cities(id),
  address text,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 6. site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id serial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Enable RLS and policies for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist and create new ones
-- profiles
DROP POLICY IF EXISTS "Allow all select" ON public.profiles;
CREATE POLICY "Allow all select" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON public.profiles;
CREATE POLICY "Allow all insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all update" ON public.profiles;
CREATE POLICY "Allow all update" ON public.profiles FOR UPDATE USING (true);

-- governorates
DROP POLICY IF EXISTS "Allow all select" ON public.governorates;
CREATE POLICY "Allow all select" ON public.governorates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON public.governorates;
CREATE POLICY "Allow all insert" ON public.governorates FOR INSERT WITH CHECK (true);

-- cities
DROP POLICY IF EXISTS "Allow all select" ON public.cities;
CREATE POLICY "Allow all select" ON public.cities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON public.cities;
CREATE POLICY "Allow all insert" ON public.cities FOR INSERT WITH CHECK (true);

-- specializations
DROP POLICY IF EXISTS "Allow all select" ON public.specializations;
CREATE POLICY "Allow all select" ON public.specializations FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON public.specializations;
CREATE POLICY "Allow all insert" ON public.specializations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all update" ON public.specializations;
CREATE POLICY "Allow all update" ON public.specializations FOR UPDATE USING (true);

-- clinics
DROP POLICY IF EXISTS "Allow all select" ON public.clinics;
CREATE POLICY "Allow all select" ON public.clinics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON public.clinics;
CREATE POLICY "Allow all insert" ON public.clinics FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all update" ON public.clinics;
CREATE POLICY "Allow all update" ON public.clinics FOR UPDATE USING (true);

-- site_settings
DROP POLICY IF EXISTS "Allow all select" ON public.site_settings;
CREATE POLICY "Allow all select" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow all insert" ON public.site_settings;
CREATE POLICY "Allow all insert" ON public.site_settings FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all update" ON public.site_settings;
CREATE POLICY "Allow all update" ON public.site_settings FOR UPDATE USING (true);

-- Sample data for governorates
INSERT INTO public.governorates (name_ar, name_en) VALUES
('عمان', 'Amman'),
('إربد', 'Irbid'),
('الزرقاء', 'Zarqa')
ON CONFLICT DO NOTHING;

-- Sample data for cities
INSERT INTO public.cities (name_ar, name_en, governorate_id) VALUES
('عمان', 'Amman', 1),
('إربد', 'Irbid', 2),
('الزرقاء', 'Zarqa', 3)
ON CONFLICT DO NOTHING;

-- Sample data for specializations
INSERT INTO public.specializations (name_ar, name_en, sort_order) VALUES
('أسنان عام', 'General Dentistry', 1),
('تقويم الأسنان', 'Orthodontics', 2),
('جراحة الفم', 'Oral Surgery', 3)
ON CONFLICT DO NOTHING;

-- Sample site settings
INSERT INTO public.site_settings (key, value) VALUES
('site_name', 'Dental QR Code'),
('theme', 'light')
ON CONFLICT DO NOTHING; 