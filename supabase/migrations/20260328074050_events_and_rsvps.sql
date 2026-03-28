-- Add columns to events
ALTER TABLE events ADD COLUMN starts_at TIMESTAMPTZ DEFAULT (NOW() + interval '1 day');
ALTER TABLE events ADD COLUMN image_url TEXT;

-- Create RSVP table
CREATE TABLE event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- RSVP Policies
CREATE POLICY "RSVPs are viewable by everyone." ON event_rsvps FOR SELECT USING (true);
CREATE POLICY "Users can join events." ON event_rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave events." ON event_rsvps FOR DELETE USING (auth.uid() = user_id);

-- Trigger to increment joined_count
CREATE OR REPLACE FUNCTION increment_event_joined_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events 
  SET joined_count = joined_count + 1 
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_rsvps_increment
AFTER INSERT ON event_rsvps
FOR EACH ROW
EXECUTE FUNCTION increment_event_joined_count();

-- Trigger to decrement joined_count
CREATE OR REPLACE FUNCTION decrement_event_joined_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE events 
  SET joined_count = joined_count - 1 
  WHERE id = OLD.event_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_rsvps_decrement
AFTER DELETE ON event_rsvps
FOR EACH ROW
EXECUTE FUNCTION decrement_event_joined_count();
