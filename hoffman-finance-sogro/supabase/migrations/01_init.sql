-- Schema for Hoffman Finance – Sogro
-- Run this file in your Supabase project to set up tables and row level security.

-- Ensure pgcrypto is available for uuid generation
create extension if not exists "pgcrypto";

-- Profiles table maps directly to Supabase auth users.  Each user has a role.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin','viewer')),
  display_name text
);

-- Table linking viewers to admins.  A viewer can only see data owned by their admin.
create table if not exists public.family_links (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  constraint unique_view unique (admin_id, viewer_id)
);

-- Incomes table (entries)
create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_owner uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  source text not null,
  amount numeric not null
);

-- Expenses table
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_owner uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  description text not null,
  amount numeric not null
);

-- Debts table
create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_owner uuid not null references public.profiles (id) on delete cascade,
  creditor text not null,
  type text,
  total_amount numeric,
  monthly_installment numeric not null,
  due_day int check (due_day >= 1 and due_day <= 31),
  status text default 'Ativa'
);

-- Settings per month
create table if not exists public.settings_month (
  id uuid primary key default gen_random_uuid(),
  user_owner uuid not null references public.profiles (id) on delete cascade,
  year_month text not null,
  salary_monthly numeric not null,
  avg_dobra_value numeric not null,
  constraint unique_owner_month unique (user_owner, year_month)
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.family_links enable row level security;
alter table public.incomes enable row level security;
alter table public.expenses enable row level security;
alter table public.debts enable row level security;
alter table public.settings_month enable row level security;

-- Profiles policies
-- Users can view and edit their own profile
create policy "Individual can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Individual can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Family links policies
-- Admins can create links to viewers (insert)
create policy "Admin can invite viewer" on public.family_links
  for insert with check (
    (select role from public.profiles p where p.id = auth.uid()) = 'admin'
    and admin_id = auth.uid()
  );

-- Only admin or linked viewer can read their rows (for select)
create policy "Admin or viewer can read family link" on public.family_links
  for select using (
    (admin_id = auth.uid()) or (viewer_id = auth.uid())
  );

-- Incomes policies
-- Admin can insert/update/delete/select their own incomes
create policy "Admin manages own incomes" on public.incomes
  for all using (
    user_owner = auth.uid() and
    (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  ) with check (true);

-- Viewer can view incomes of their admin
create policy "Viewer can view admin incomes" on public.incomes
  for select using (
    exists (
      select 1 from public.family_links fl
      where fl.admin_id = user_owner and fl.viewer_id = auth.uid()
    )
  );

-- Expenses policies
create policy "Admin manages own expenses" on public.expenses
  for all using (
    user_owner = auth.uid() and
    (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  ) with check (true);

create policy "Viewer can view admin expenses" on public.expenses
  for select using (
    exists (
      select 1 from public.family_links fl
      where fl.admin_id = user_owner and fl.viewer_id = auth.uid()
    )
  );

-- Debts policies
create policy "Admin manages own debts" on public.debts
  for all using (
    user_owner = auth.uid() and
    (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  ) with check (true);

create policy "Viewer can view admin debts" on public.debts
  for select using (
    exists (
      select 1 from public.family_links fl
      where fl.admin_id = user_owner and fl.viewer_id = auth.uid()
    )
  );

-- Settings policies
create policy "Admin manages own settings" on public.settings_month
  for all using (
    user_owner = auth.uid() and
    (select role from public.profiles p where p.id = auth.uid()) = 'admin'
  ) with check (true);

create policy "Viewer can view admin settings" on public.settings_month
  for select using (
    exists (
      select 1 from public.family_links fl
      where fl.admin_id = user_owner and fl.viewer_id = auth.uid()
    )
  );

-- Family links policies for delete/update are intentionally omitted; only service role should manage removals.

-- End of migration