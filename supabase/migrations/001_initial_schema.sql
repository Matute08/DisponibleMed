create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  professional_name text,
  specialty text,
  whatsapp_phone text unique,
  city text,
  timezone text default 'America/Argentina/Buenos_Aires',
  keyword text default 'doblas',
  automation_enabled boolean default true,
  reply_unknown_contacts boolean default false,
  anti_spam_hours int default 6,
  n8n_api_key text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.office_hours (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.on_call_shifts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (ends_at > starts_at)
);

create table if not exists public.reply_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('fuera_de_horario','guardia','vacaciones','personalizado')),
  body text not null,
  is_default boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  original_phone text,
  group_name text,
  matched_keyword text,
  source text default 'manual' check (source in ('manual','google','csv')),
  auto_reply_enabled boolean default false,
  active boolean default true,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, phone)
);

create table if not exists public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  from_phone text not null,
  contact_name text,
  received_at timestamptz not null,
  replied_at timestamptz,
  decision text not null check (decision in (
    'replied',
    'outside_hours_contact_enabled',
    'ignored_inside_hours',
    'ignored_on_call',
    'ignored_contact_not_enabled',
    'ignored_unknown',
    'ignored_recently_replied',
    'automation_disabled',
    'professional_not_found',
    'no_default_message',
    'error'
  )),
  message_sent text,
  channel text default 'whatsapp',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.google_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_email text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  scopes text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_whatsapp_phone_idx on public.profiles (whatsapp_phone);
create index if not exists office_hours_user_day_idx on public.office_hours (user_id, day_of_week, active);
create index if not exists on_call_user_range_idx on public.on_call_shifts (user_id, starts_at, ends_at, active);
create index if not exists contacts_user_phone_idx on public.contacts (user_id, phone);
create index if not exists logs_user_received_idx on public.automation_logs (user_id, received_at desc);
create index if not exists logs_antispam_idx on public.automation_logs (user_id, from_phone, replied_at desc);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists office_hours_updated_at on public.office_hours;
create trigger office_hours_updated_at before update on public.office_hours for each row execute function public.set_updated_at();
drop trigger if exists on_call_shifts_updated_at on public.on_call_shifts;
create trigger on_call_shifts_updated_at before update on public.on_call_shifts for each row execute function public.set_updated_at();
drop trigger if exists reply_messages_updated_at on public.reply_messages;
create trigger reply_messages_updated_at before update on public.reply_messages for each row execute function public.set_updated_at();
drop trigger if exists contacts_updated_at on public.contacts;
create trigger contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();
drop trigger if exists google_connections_updated_at on public.google_connections;
create trigger google_connections_updated_at before update on public.google_connections for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.office_hours enable row level security;
alter table public.on_call_shifts enable row level security;
alter table public.reply_messages enable row level security;
alter table public.contacts enable row level security;
alter table public.automation_logs enable row level security;
alter table public.google_connections enable row level security;

create policy "profiles own select" on public.profiles for select using (auth.uid() = id);
create policy "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "office_hours own select" on public.office_hours for select using (auth.uid() = user_id);
create policy "office_hours own insert" on public.office_hours for insert with check (auth.uid() = user_id);
create policy "office_hours own update" on public.office_hours for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "office_hours own delete" on public.office_hours for delete using (auth.uid() = user_id);

create policy "on_call own select" on public.on_call_shifts for select using (auth.uid() = user_id);
create policy "on_call own insert" on public.on_call_shifts for insert with check (auth.uid() = user_id);
create policy "on_call own update" on public.on_call_shifts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "on_call own delete" on public.on_call_shifts for delete using (auth.uid() = user_id);

create policy "messages own select" on public.reply_messages for select using (auth.uid() = user_id);
create policy "messages own insert" on public.reply_messages for insert with check (auth.uid() = user_id);
create policy "messages own update" on public.reply_messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages own delete" on public.reply_messages for delete using (auth.uid() = user_id);

create policy "contacts own select" on public.contacts for select using (auth.uid() = user_id);
create policy "contacts own insert" on public.contacts for insert with check (auth.uid() = user_id);
create policy "contacts own update" on public.contacts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contacts own delete" on public.contacts for delete using (auth.uid() = user_id);

create policy "logs own select" on public.automation_logs for select using (auth.uid() = user_id);
create policy "logs own insert" on public.automation_logs for insert with check (auth.uid() = user_id);

create policy "google own select" on public.google_connections for select using (auth.uid() = user_id);
create policy "google own insert" on public.google_connections for insert with check (auth.uid() = user_id);
create policy "google own update" on public.google_connections for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "google own delete" on public.google_connections for delete using (auth.uid() = user_id);
