-- 0003 Portora core: moderasi profil talent, kontak privat, karya portfolio,
-- profil recruiter + paket, shortlist bernama, undangan, admin, dan log moderasi.
--
-- Semua tabel memakai prefix portora_ karena project Supabase ini dipakai bersama
-- TalentRank. Migrasi ini idempotent: aman dijalankan di DB yang sudah punya tabel
-- dari supabase-migration.sql (root repo).

-- =====================================================================
-- Tabel dasar (sebelumnya hanya ada di supabase-migration.sql)
-- =====================================================================
create table if not exists portora_talent_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text not null,
  role text not null check (role in ('graphic-designer','video-editor','content-creative')),
  location text,
  bio text,
  avatar_url text,
  portfolio_links jsonb default '[]',
  skills text[] default '{}',
  tools text[] default '{}',
  available boolean default true,
  rate_min integer,
  rate_max integer,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists portora_recruiter_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  whatsapp text,
  message text,
  source text default 'portora-for-recruiters',
  created_at timestamptz default now()
);

create table if not exists portora_shortlists (
  id uuid primary key default gen_random_uuid(),
  recruiter_user_id uuid references auth.users(id) on delete cascade,
  talent_profile_id uuid references portora_talent_profiles(id) on delete cascade,
  note text,
  created_at timestamptz default now(),
  unique (recruiter_user_id, talent_profile_id)
);

alter table portora_talent_profiles enable row level security;
alter table portora_recruiter_leads enable row level security;
alter table portora_shortlists enable row level security;

-- =====================================================================
-- Admin
-- =====================================================================
-- Admin ditambahkan manual lewat SQL:
--   insert into portora_admins (user_id) select id from auth.users where email = '...';
create table if not exists portora_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table portora_admins enable row level security;
drop policy if exists "portora admins read own" on portora_admins;
create policy "portora admins read own" on portora_admins for select using (user_id = auth.uid());

create or replace function portora_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from portora_admins where user_id = auth.uid());
$$;

-- =====================================================================
-- Profil talent: kolom moderasi & profil lengkap
-- =====================================================================
alter table portora_talent_profiles
  add column if not exists headline text,
  add column if not exists experience_years integer,
  add column if not exists industries text[] not null default '{}',
  add column if not exists featured boolean not null default false,
  add column if not exists rejection_reason text,
  add column if not exists ai_summary text,
  add column if not exists ai_summary_at timestamptz,
  add column if not exists submitted_at timestamptz default now();

-- Profil yang sudah ada dianggap lolos; profil baru wajib ditinjau admin.
alter table portora_talent_profiles add column if not exists status text not null default 'approved';
alter table portora_talent_profiles alter column status set default 'pending';
do $$ begin
  alter table portora_talent_profiles
    add constraint portora_talent_profiles_status_check check (status in ('pending','approved','rejected'));
exception when duplicate_object then null; end $$;

-- Satu profil per akun. Kalau data lama punya duplikat, index dilewati (bersihkan dulu lalu jalankan ulang).
do $$ begin
  create unique index if not exists portora_talent_profiles_user_id_key on portora_talent_profiles(user_id);
exception when unique_violation then
  raise notice 'portora_talent_profiles punya user_id ganda; unique index tidak dibuat.';
end $$;
create index if not exists portora_talent_profiles_discover on portora_talent_profiles(status, is_public, role);

create or replace function portora_owns_talent(p_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from portora_talent_profiles where id = p_id and user_id = auth.uid());
$$;

-- Kolom moderasi hanya boleh diubah admin. auth.uid() null = service role / SQL editor.
create or replace function portora_talent_profiles_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is null or portora_is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.featured := false;
    new.rejection_reason := null;
    new.ai_summary := null;
    new.ai_summary_at := null;
    new.submitted_at := now();
    return new;
  end if;
  new.user_id := old.user_id;
  new.featured := old.featured;
  new.ai_summary := old.ai_summary;
  new.ai_summary_at := old.ai_summary_at;
  -- Profil yang ditolak lalu diperbaiki otomatis masuk antrean moderasi lagi.
  if old.status = 'rejected' then
    new.status := 'pending';
    new.rejection_reason := null;
    new.submitted_at := now();
  else
    new.status := old.status;
    new.rejection_reason := old.rejection_reason;
  end if;
  return new;
end $$;

drop trigger if exists portora_talent_profiles_guard on portora_talent_profiles;
create trigger portora_talent_profiles_guard
  before insert or update on portora_talent_profiles
  for each row execute function portora_talent_profiles_guard();

drop policy if exists "Public profiles are viewable by anyone" on portora_talent_profiles;
drop policy if exists "Users can insert their own profile" on portora_talent_profiles;
drop policy if exists "Users can update their own profile" on portora_talent_profiles;
drop policy if exists "portora talent select" on portora_talent_profiles;
drop policy if exists "portora talent insert" on portora_talent_profiles;
drop policy if exists "portora talent update" on portora_talent_profiles;
create policy "portora talent select" on portora_talent_profiles for select
  using ((is_public and status = 'approved') or user_id = auth.uid() or portora_is_admin());
create policy "portora talent insert" on portora_talent_profiles for insert
  with check (user_id = auth.uid());
create policy "portora talent update" on portora_talent_profiles for update
  using (user_id = auth.uid() or portora_is_admin());

-- =====================================================================
-- Profil recruiter + paket
-- =====================================================================
create table if not exists portora_recruiter_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_name text not null,
  company_website text,
  industry text,
  company_size text,
  contact_name text,
  contact_whatsapp text,
  logo_url text,
  plan text not null default 'starter' check (plan in ('starter','growth','enterprise')),
  plan_expires_at timestamptz,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  search_month text,
  search_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table portora_recruiter_profiles enable row level security;

-- Paket & trial hanya boleh diubah admin.
create or replace function portora_recruiter_profiles_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if auth.uid() is null or portora_is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.plan := 'starter';
    new.plan_expires_at := null;
    new.trial_ends_at := now() + interval '14 days';
    return new;
  end if;
  new.user_id := old.user_id;
  new.plan := old.plan;
  new.plan_expires_at := old.plan_expires_at;
  new.trial_ends_at := old.trial_ends_at;
  return new;
end $$;

drop trigger if exists portora_recruiter_profiles_guard on portora_recruiter_profiles;
create trigger portora_recruiter_profiles_guard
  before insert or update on portora_recruiter_profiles
  for each row execute function portora_recruiter_profiles_guard();

-- Starter -> Growth selama trial 14 hari; Growth/Enterprise berbayar sampai plan_expires_at.
create or replace function portora_effective_plan(p_user uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when r.plan in ('growth','enterprise') and (r.plan_expires_at is null or r.plan_expires_at > now()) then r.plan
    when r.trial_ends_at > now() then 'growth'
    else 'starter'
  end
  from portora_recruiter_profiles r where r.user_id = p_user;
$$;

-- =====================================================================
-- Undangan recruiter -> talent
-- =====================================================================
create table if not exists portora_invites (
  id uuid primary key default gen_random_uuid(),
  recruiter_user_id uuid not null references auth.users(id) on delete cascade,
  talent_profile_id uuid not null references portora_talent_profiles(id) on delete cascade,
  project_title text not null,
  message text,
  budget text,
  status text not null default 'sent' check (status in ('sent','accepted','declined')),
  created_at timestamptz not null default now(),
  responded_at timestamptz
);
create index if not exists portora_invites_recruiter on portora_invites(recruiter_user_id, created_at desc);
create index if not exists portora_invites_talent on portora_invites(talent_profile_id, created_at desc);
alter table portora_invites enable row level security;

-- Talent hanya boleh menjawab (accepted/declined) undangan yang masih terkirim.
create or replace function portora_invites_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is null or portora_is_admin() then
    return new;
  end if;
  if old.status <> 'sent' or new.status not in ('accepted','declined') then
    raise exception 'Undangan ini sudah dijawab.';
  end if;
  new.recruiter_user_id := old.recruiter_user_id;
  new.talent_profile_id := old.talent_profile_id;
  new.project_title := old.project_title;
  new.message := old.message;
  new.budget := old.budget;
  new.created_at := old.created_at;
  new.responded_at := now();
  return new;
end $$;

drop trigger if exists portora_invites_guard on portora_invites;
create trigger portora_invites_guard
  before update on portora_invites
  for each row execute function portora_invites_guard();

drop policy if exists "portora invites select" on portora_invites;
drop policy if exists "portora invites insert" on portora_invites;
drop policy if exists "portora invites respond" on portora_invites;
create policy "portora invites select" on portora_invites for select
  using (recruiter_user_id = auth.uid() or portora_owns_talent(talent_profile_id) or portora_is_admin());
create policy "portora invites insert" on portora_invites for insert
  with check (
    recruiter_user_id = auth.uid()
    and exists (select 1 from portora_recruiter_profiles r where r.user_id = auth.uid())
  );
create policy "portora invites respond" on portora_invites for update
  using (portora_owns_talent(talent_profile_id));

-- Recruiter: baca profil sendiri; talent yang diundang boleh melihat profil perusahaan pengundang.
drop policy if exists "portora recruiter select" on portora_recruiter_profiles;
drop policy if exists "portora recruiter insert" on portora_recruiter_profiles;
drop policy if exists "portora recruiter update" on portora_recruiter_profiles;
create policy "portora recruiter select" on portora_recruiter_profiles for select
  using (
    user_id = auth.uid() or portora_is_admin()
    or exists (
      select 1 from portora_invites i
      where i.recruiter_user_id = portora_recruiter_profiles.user_id
        and portora_owns_talent(i.talent_profile_id)
    )
  );
create policy "portora recruiter insert" on portora_recruiter_profiles for insert
  with check (user_id = auth.uid());
create policy "portora recruiter update" on portora_recruiter_profiles for update
  using (user_id = auth.uid() or portora_is_admin());

-- =====================================================================
-- Kontak talent (privat: hanya pemilik, admin, dan recruiter yang undangannya diterima)
-- =====================================================================
create table if not exists portora_talent_contacts (
  talent_profile_id uuid primary key references portora_talent_profiles(id) on delete cascade,
  whatsapp text,
  email text,
  updated_at timestamptz not null default now()
);
alter table portora_talent_contacts enable row level security;
drop policy if exists "portora contacts select" on portora_talent_contacts;
drop policy if exists "portora contacts owner" on portora_talent_contacts;
create policy "portora contacts select" on portora_talent_contacts for select
  using (
    portora_is_admin()
    or exists (
      select 1 from portora_invites i
      where i.talent_profile_id = portora_talent_contacts.talent_profile_id
        and i.recruiter_user_id = auth.uid()
        and i.status = 'accepted'
    )
  );
create policy "portora contacts owner" on portora_talent_contacts for all
  using (portora_owns_talent(talent_profile_id))
  with check (portora_owns_talent(talent_profile_id));

-- =====================================================================
-- Karya portfolio
-- =====================================================================
create table if not exists portora_portfolio_items (
  id uuid primary key default gen_random_uuid(),
  talent_profile_id uuid not null references portora_talent_profiles(id) on delete cascade,
  title text not null,
  description text,
  media_url text,
  media_type text not null default 'image' check (media_type in ('image','video','link')),
  link_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists portora_portfolio_items_profile on portora_portfolio_items(talent_profile_id, sort_order);
alter table portora_portfolio_items enable row level security;
drop policy if exists "portora portfolio select" on portora_portfolio_items;
drop policy if exists "portora portfolio owner" on portora_portfolio_items;
-- Ikut visibilitas profil induk (RLS portora_talent_profiles berlaku di subquery).
create policy "portora portfolio select" on portora_portfolio_items for select
  using (exists (select 1 from portora_talent_profiles p where p.id = talent_profile_id));
create policy "portora portfolio owner" on portora_portfolio_items for all
  using (portora_owns_talent(talent_profile_id))
  with check (portora_owns_talent(talent_profile_id));

-- =====================================================================
-- Shortlist bernama (Starter: 1 shortlist, Growth/Enterprise: tak terbatas)
-- =====================================================================
alter table portora_shortlists add column if not exists list_name text not null default 'Shortlist utama';

create or replace function portora_shortlists_limit() returns trigger
language plpgsql set search_path = public as $$
begin
  if coalesce(portora_effective_plan(new.recruiter_user_id), 'starter') = 'starter'
     and exists (
       select 1 from portora_shortlists s
       where s.recruiter_user_id = new.recruiter_user_id and s.list_name <> new.list_name and s.id <> new.id
     ) then
    raise exception 'Paket Starter hanya bisa memakai 1 shortlist. Upgrade ke Growth untuk shortlist tak terbatas.';
  end if;
  return new;
end $$;

drop trigger if exists portora_shortlists_limit on portora_shortlists;
create trigger portora_shortlists_limit
  before insert or update of list_name on portora_shortlists
  for each row execute function portora_shortlists_limit();

drop policy if exists "Recruiters manage own shortlists" on portora_shortlists;
drop policy if exists "portora shortlists own" on portora_shortlists;
create policy "portora shortlists own" on portora_shortlists for all
  using (recruiter_user_id = auth.uid())
  with check (recruiter_user_id = auth.uid());

-- =====================================================================
-- Log moderasi (admin)
-- =====================================================================
create table if not exists portora_moderation_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  talent_profile_id uuid references portora_talent_profiles(id) on delete cascade,
  recruiter_user_id uuid references auth.users(id) on delete cascade,
  action text not null check (action in ('approve','reject','feature','unfeature','set_plan','ai_summary')),
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists portora_moderation_logs_created on portora_moderation_logs(created_at desc);
alter table portora_moderation_logs enable row level security;
drop policy if exists "portora logs admin" on portora_moderation_logs;
create policy "portora logs admin" on portora_moderation_logs for all
  using (portora_is_admin()) with check (portora_is_admin());

-- =====================================================================
-- Leads: admin boleh membaca
-- =====================================================================
drop policy if exists "portora admin read leads" on portora_leads;
create policy "portora admin read leads" on portora_leads for select using (portora_is_admin());
drop policy if exists "Anyone can insert leads" on portora_recruiter_leads;
create policy "Anyone can insert leads" on portora_recruiter_leads for insert with check (true);
drop policy if exists "portora admin read recruiter leads" on portora_recruiter_leads;
create policy "portora admin read recruiter leads" on portora_recruiter_leads for select using (portora_is_admin());

-- =====================================================================
-- Storage: foto profil & karya (folder pertama = user id pemilik)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('portora-avatars', 'portora-avatars', true, 2097152, array['image/png','image/jpeg','image/webp']),
  ('portora-portfolio', 'portora-portfolio', true, 5242880, array['image/png','image/jpeg','image/webp','image/gif'])
on conflict (id) do nothing;

drop policy if exists "portora media read own" on storage.objects;
drop policy if exists "portora media insert" on storage.objects;
drop policy if exists "portora media update" on storage.objects;
drop policy if exists "portora media delete" on storage.objects;
create policy "portora media read own" on storage.objects for select to authenticated
  using (bucket_id in ('portora-avatars','portora-portfolio') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "portora media insert" on storage.objects for insert to authenticated
  with check (bucket_id in ('portora-avatars','portora-portfolio') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "portora media update" on storage.objects for update to authenticated
  using (bucket_id in ('portora-avatars','portora-portfolio') and (storage.foldername(name))[1] = auth.uid()::text);
create policy "portora media delete" on storage.objects for delete to authenticated
  using (bucket_id in ('portora-avatars','portora-portfolio') and (storage.foldername(name))[1] = auth.uid()::text);
