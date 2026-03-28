CREATE OR REPLACE FUNCTION get_my_matches()
RETURNS TABLE (
  match_id UUID,
  other_user_id UUID,
  other_name TEXT,
  other_photo TEXT,
  last_message TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id AS match_id,
    p.user_id AS other_user_id,
    p.name AS other_name,
    p.photos[1] AS other_photo,
    (SELECT body FROM messages msg WHERE msg.match_id = m.id ORDER BY msg.created_at DESC LIMIT 1) AS last_message,
    m.created_at
  FROM matches m
  JOIN profiles p ON p.user_id = CASE
    WHEN m.user_a_id = auth.uid() THEN m.user_b_id
    WHEN m.user_b_id = auth.uid() THEN m.user_a_id
  END
  WHERE m.user_a_id = auth.uid() OR m.user_b_id = auth.uid()
  ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
