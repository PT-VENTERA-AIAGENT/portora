-- Portora talent public profiles
CREATE TABLE IF NOT EXISTS portora_talent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('graphic-designer','video-editor','content-creative')),
  location text,
  bio text,
  avatar_url text,
  portfolio_links jsonb DEFAULT '[]',
  skills text[] DEFAULT '{}',
  tools text[] DEFAULT '{}',
  available boolean DEFAULT true,
  rate_min integer,
  rate_max integer,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portora_talent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by anyone" ON portora_talent_profiles FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert their own profile" ON portora_talent_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON portora_talent_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Recruiter leads (lead capture from portora.id/for-recruiters)
CREATE TABLE IF NOT EXISTS portora_recruiter_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text,
  email text NOT NULL,
  whatsapp text,
  message text,
  source text DEFAULT 'portora-for-recruiters',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE portora_recruiter_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert leads" ON portora_recruiter_leads FOR INSERT WITH CHECK (true);

-- Recruiter shortlists
CREATE TABLE IF NOT EXISTS portora_shortlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  talent_profile_id uuid REFERENCES portora_talent_profiles(id) ON DELETE CASCADE,
  note text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(recruiter_user_id, talent_profile_id)
);
ALTER TABLE portora_shortlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters manage own shortlists" ON portora_shortlists USING (auth.uid() = recruiter_user_id);
