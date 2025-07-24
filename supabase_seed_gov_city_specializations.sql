-- 1. GOVERNORATES TABLE
create table if not exists governorates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamp with time zone default now()
);

-- 2. CITIES TABLE
create table if not exists cities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  governorate_id uuid references governorates(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- 3. SPECIALIZATIONS TABLE
create table if not exists specializations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);

-- Enable RLS and policies for all tables
alter table governorates enable row level security;
alter table cities enable row level security;
alter table specializations enable row level security;

drop policy if exists "Allow anon select" on governorates;
drop policy if exists "Allow anon select" on cities;
drop policy if exists "Allow anon select" on specializations;
drop policy if exists "Allow anon insert" on specializations;
drop policy if exists "Allow anon update" on specializations;
drop policy if exists "Allow anon delete" on specializations;

create policy "Allow anon select" on governorates for select using (true);
create policy "Allow anon select" on cities for select using (true);
create policy "Allow anon select" on specializations for select using (true);
create policy "Allow anon insert" on specializations for insert with check (true);
create policy "Allow anon update" on specializations for update using (true);
create policy "Allow anon delete" on specializations for delete using (true);

-- Insert sample governorates
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
  (uuid_generate_v4(), 'معان', now());

-- Insert sample cities (link to governorates by name for demo, adjust as needed)
insert into cities (id, name, governorate_id, created_at)
select uuid_generate_v4(), city_name, g.id, now()
from (
  values
    ('عمان', 'عمان'),
    ('إربد', 'إربد'),
    ('الزرقاء', 'الزرقاء'),
    ('العقبة', 'العقبة'),
    ('المفرق', 'المفرق'),
    ('السلط', 'البلقاء'),
    ('جرش', 'جرش'),
    ('عجلون', 'عجلون'),
    ('مأدبا', 'مأدبا'),
    ('الطفيلة', 'الطفيلة'),
    ('الكرك', 'الكرك'),
    ('معان', 'معان')
) as t(city_name, gov_name)
join governorates g on g.name = t.gov_name;

-- Insert sample specializations
insert into specializations (id, name, is_active, sort_order, created_at) values
  (uuid_generate_v4(), 'طب أسنان عام', true, 1, now()),
  (uuid_generate_v4(), 'تقويم الأسنان', true, 2, now()),
  (uuid_generate_v4(), 'جراحة الفم والفكين', true, 3, now()),
  (uuid_generate_v4(), 'علاج جذور الأسنان', true, 4, now()),
  (uuid_generate_v4(), 'طب أسنان الأطفال', true, 5, now()),
  (uuid_generate_v4(), 'تركيبات الأسنان', true, 6, now()),
  (uuid_generate_v4(), 'أمراض اللثة', true, 7, now()),
  (uuid_generate_v4(), 'أشعة الفم والأسنان', true, 8, now()); 