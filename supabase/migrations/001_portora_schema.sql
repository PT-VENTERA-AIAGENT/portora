-- profiles: extends auth.users
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  role text check (role in ('recruiter', 'talent')),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- talent_profiles: for talent users
create table if not exists public.talent_profiles (
  id uuid references public.profiles(id) on delete cascade primary key,
  username text unique,
  headline text,
  bio text,
  location text,
  role_category text check (role_category in ('graphic_designer', 'video_editor', 'social_media_creative')),
  skills text[],
  portfolio_links text[],
  availability text check (availability in ('available', 'open', 'not_available')) default 'open',
  rate_range text,
  fit_score integer,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- recruiter_profiles: for recruiter users
create table if not exists public.recruiter_profiles (
  id uuid references public.profiles(id) on delete cascade primary key,
  company_name text,
  company_size text,
  industry text,
  subscription_plan text default 'free',
  subscription_expires_at timestamptz,
  created_at timestamptz default now()
);

-- shortlists: recruiters save talent
create table if not exists public.shortlists (
  id uuid default gen_random_uuid() primary key,
  recruiter_id uuid references public.profiles(id) on delete cascade,
  talent_id uuid references public.talent_profiles(id) on delete cascade,
  notes text,
  created_at timestamptz default now(),
  unique(recruiter_id, talent_id)
);

-- RLS
alter table public.profiles enable row level security;
alter table public.talent_profiles enable row level security;
alter table public.recruiter_profiles enable row level security;
alter table public.shortlists enable row level security;

-- profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- talent_profiles policies
create policy "Published talent profiles are viewable by everyone" on public.talent_profiles for select using (is_published = true or auth.uid() = id);
create policy "Talent can update own profile" on public.talent_profiles for update using (auth.uid() = id);
create policy "Talent can insert own profile" on public.talent_profiles for insert with check (auth.uid() = id);

-- recruiter_profiles policies
create policy "Recruiters can read own profile" on public.recruiter_profiles for select using (auth.uid() = id);
create policy "Recruiters can update own profile" on public.recruiter_profiles for update using (auth.uid() = id);
create policy "Recruiters can insert own profile" on public.recruiter_profiles for insert with check (auth.uid() = id);

-- shortlists policies
create policy "Recruiters can manage own shortlists" on public.shortlists for all using (auth.uid() = recruiter_id);

-- trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'talent')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
