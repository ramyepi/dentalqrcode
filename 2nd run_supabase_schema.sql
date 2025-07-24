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