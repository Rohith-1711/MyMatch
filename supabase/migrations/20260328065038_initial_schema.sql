-- Enable UUID generation
-- pg_crypto is usually enabled by default in Supabase

CREATE TYPE intent_type AS ENUM ('dating', 'platonic', 'both');
CREATE TYPE swipe_direction AS ENUM ('like', 'pass');
CREATE TYPE event_host_type AS ENUM ('admin', 'user');
CREATE TYPE date_share_status AS ENUM ('active', 'cancelled');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  intent intent_type DEFAULT 'dating',
  general_location TEXT,
  is_precise_location_opted_in BOOLEAN DEFAULT false,
  photos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create swipes table
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  direction swipe_direction NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(swiper_id, target_id)
);

-- Create matches table
-- enforce user_a_id < user_b_id for unique pairing
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  user_b_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a_id, user_b_id),
  CHECK (user_a_id < user_b_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  body TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_type event_host_type DEFAULT 'user',
  host_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  capacity INT,
  joined_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create date_shares table
CREATE TABLE date_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  trusted_email TEXT NOT NULL,
  match_contact_info TEXT,
  live_location_link TEXT,
  status date_share_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_shares ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING ( true );
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING ( auth.uid() = user_id );

-- Swipes Policies
CREATE POLICY "Users can insert their own swipes." ON swipes FOR INSERT WITH CHECK ( auth.uid() = swiper_id );
CREATE POLICY "Users can read their own swipes." ON swipes FOR SELECT USING ( auth.uid() = swiper_id );

-- Matches Policies
CREATE POLICY "Users can read their matches." ON matches FOR SELECT USING ( auth.uid() = user_a_id OR auth.uid() = user_b_id );

-- Messages Policies
CREATE POLICY "Users can read messages in their matches." ON messages FOR SELECT
  USING ( EXISTS (
    SELECT 1 FROM matches WHERE matches.id = messages.match_id AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
  ));
CREATE POLICY "Users can insert messages in their matches." ON messages FOR INSERT
  WITH CHECK ( auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM matches WHERE matches.id = messages.match_id AND (matches.user_a_id = auth.uid() OR matches.user_b_id = auth.uid())
  ));

-- Events Policies
CREATE POLICY "Events viewable by everyone." ON events FOR SELECT USING ( true );
CREATE POLICY "Users can create events." ON events FOR INSERT WITH CHECK ( auth.uid() = host_id );
CREATE POLICY "Host can update events." ON events FOR UPDATE USING ( auth.uid() = host_id );

-- Date shares Policies
CREATE POLICY "Users can manage their date shares." ON date_shares FOR ALL USING ( auth.uid() = creator_id );

-- Trigger for updated_at on profiles
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
