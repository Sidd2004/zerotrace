-- =================================================================================
-- ZEROTRACE - UPDATE SCHEMA FOR CONTACT MESSAGES
-- =================================================================================

-- 1. Contact Messages Table
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  phone text,
  service text,
  message text not null,
  status text default 'new' check (status in ('new', 'reviewed', 'closed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.contact_messages enable row level security;

-- 3. Contact Messages Policies (Service Role inserts from Render API, only admins can view)
create policy "Only admins can view contact messages" on public.contact_messages for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Only admins can update contact messages" on public.contact_messages for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
