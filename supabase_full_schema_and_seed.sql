-- 1. USERS & PROFILES TABLES (Supabase manages auth.users, you manage profiles)
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

alter table profiles enable row level security;
drop policy if exists "Allow individual read access" on profiles;
drop policy if exists "Allow individual update access" on profiles;
drop policy if exists "Allow admin read access" on profiles;
create policy "Allow individual read access" on profiles for select using (auth.uid() = id);
create policy "Allow individual update access" on profiles for update using (auth.uid() = id);
create policy "Allow admin read access" on profiles for select using (role = 'admin');

-- 2. GOVERNORATES TABLE
create table if not exists governorates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);
alter table governorates enable row level security;
drop policy if exists "Allow anon select" on governorates;
create policy "Allow anon select" on governorates for select using (true);

-- 3. CITIES TABLE
create table if not exists cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  governorate_id uuid references governorates(id) on delete set null,
  created_at timestamp with time zone default now()
);
alter table cities enable row level security;
drop policy if exists "Allow anon select" on cities;
create policy "Allow anon select" on cities for select using (true);

-- 4. SPECIALIZATIONS TABLE
create table if not exists specializations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);
alter table specializations enable row level security;
drop policy if exists "Allow anon select" on specializations;
drop policy if exists "Allow anon insert" on specializations;
drop policy if exists "Allow anon update" on specializations;
drop policy if exists "Allow anon delete" on specializations;
create policy "Allow anon select" on specializations for select using (true);
create policy "Allow anon insert" on specializations for insert with check (true);
create policy "Allow anon update" on specializations for update using (true);
create policy "Allow anon delete" on specializations for delete using (true);

-- 5. CLINICS TABLE
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
alter table clinics enable row level security;
drop policy if exists "Allow anon select" on clinics;
drop policy if exists "Allow anon insert" on clinics;
drop policy if exists "Allow anon update" on clinics;
drop policy if exists "Allow anon delete" on clinics;
create policy "Allow anon select" on clinics for select using (true);
create policy "Allow anon insert" on clinics for insert with check (true);
create policy "Allow anon update" on clinics for update using (true);
create policy "Allow anon delete" on clinics for delete using (true);

-- 6. SITE SETTINGS TABLE
create table if not exists site_settings (
  key text primary key,
  value text,
  description text
);
alter table site_settings enable row level security;
drop policy if exists "Allow anon select" on site_settings;
drop policy if exists "Allow anon update" on site_settings;
create policy "Allow anon select" on site_settings for select using (true);
create policy "Allow anon update" on site_settings for update using (true);

-- 7. SAMPLE DATA (governorates, cities, specializations)
insert into governorates (id, name, created_at) values
  (uuid_generate_v4(), 'عمان', now()),
  (uuid_generate_v4(), 'إربد', now()),
  (uuid_generate_v4(), 'الزرقاء', now()),
  (uuid_generate_v4(), 'العقبة', now()),
  (uuid_generate_v4(), 'المفرق', now()),
  (uuid_generate_v4(), 'البلقاء', now()),
  (uuid_generate_v4(), 'جرش', now()),
  (uuid_generate_v4(), 'عجلون', now()),
  (uuid_generate_v4(), 'مأدبا', now()),
  (uuid_generate_v4(), 'الطفيلة', now()),
  (uuid_generate_v4(), 'الكرك', now()),
  (uuid_generate_v4(), 'معان', now())
on conflict do nothing;

insert into specializations (id, name, is_active, sort_order, created_at) values
  (uuid_generate_v4(), 'طب أسنان عام', true, 1, now()),
  (uuid_generate_v4(), 'تقويم الأسنان', true, 2, now()),
  (uuid_generate_v4(), 'جراحة الفم والفكين', true, 3, now()),
  (uuid_generate_v4(), 'علاج جذور الأسنان', true, 4, now()),
  (uuid_generate_v4(), 'طب أسنان الأطفال', true, 5, now()),
  (uuid_generate_v4(), 'تركيبات الأسنان', true, 6, now()),
  (uuid_generate_v4(), 'أمراض اللثة', true, 7, now()),
  (uuid_generate_v4(), 'أشعة الفم والأسنان', true, 8, now())
on conflict do nothing;

-- ملاحظة: لإضافة بيانات المدن، يجب أن تربط كل مدينة بـ governorate_id الصحيح من جدول المحافظات.
-- مثال (أضف المزيد حسب الحاجة):
insert into cities (id, name, governorate_id, created_at)
select uuid_generate_v4(), 'عمان', g.id, now() from governorates g where g.name = 'عمان'
on conflict do nothing;

-- 8. (اختياري) إضافة مستخدم admin يدويًا:
-- يجب إنشاء المستخدم من خلال واجهة Supabase Auth أو التطبيق، ثم تحديث role في profiles:
-- update profiles set role = 'admin' where id = '<USER_ID>'; 