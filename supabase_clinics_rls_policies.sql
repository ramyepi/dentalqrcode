-- Enable Row Level Security on clinics table
alter table clinics enable row level security;

-- Drop old policies if they exist
drop policy if exists "Allow anon insert" on clinics;
drop policy if exists "Allow anon select" on clinics;

-- Allow anyone to insert into clinics
grant insert on clinics to anon;
create policy "Allow anon insert" on clinics
  for insert
  with check (true);

-- Allow anyone to select from clinics
grant select on clinics to anon;
create policy "Allow anon select" on clinics
  for select
  using (true); 