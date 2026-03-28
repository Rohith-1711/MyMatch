-- RPC for getting discovery feed
CREATE OR REPLACE FUNCTION get_discovery_feed(
  query_intent intent_type DEFAULT 'dating',
  query_location TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20
)
RETURNS SETOF profiles AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM profiles p
  WHERE p.user_id != auth.uid()
    AND (p.intent = query_intent OR p.intent = 'both' OR query_intent = 'both')
    AND (query_location IS NULL OR p.general_location = query_location)
    -- exclude users already swiped on by current user
    AND NOT EXISTS (
      SELECT 1 FROM swipes s
      WHERE s.swiper_id = auth.uid() AND s.target_id = p.user_id
    )
  ORDER BY random()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC for creating a swipe and returning if a match was created
CREATE OR REPLACE FUNCTION create_match_if_mutual(target_user_id UUID, p_direction swipe_direction DEFAULT 'like')
RETURNS BOOLEAN AS $$
DECLARE
  v_mutual_like BOOLEAN;
  v_user_a UUID;
  v_user_b UUID;
BEGIN
  -- Insert or update the swipe
  INSERT INTO swipes (swiper_id, target_id, direction)
  VALUES (auth.uid(), target_user_id, p_direction)
  ON CONFLICT (swiper_id, target_id) 
  DO UPDATE SET direction = p_direction, created_at = NOW();
  
  -- If direction is pass, no match is created
  IF p_direction = 'pass' THEN
    RETURN FALSE;
  END IF;

  -- Check if target user liked the current user
  SELECT EXISTS (
    SELECT 1 FROM swipes
    WHERE swiper_id = target_user_id 
      AND target_id = auth.uid() 
      AND direction = 'like'
  ) INTO v_mutual_like;
  
  IF v_mutual_like THEN
    -- Order the IDs to satisfy user_a_id < user_b_id constraint
    IF auth.uid() < target_user_id THEN
      v_user_a := auth.uid();
      v_user_b := target_user_id;
    ELSE
      v_user_a := target_user_id;
      v_user_b := auth.uid();
    END IF;
    
    INSERT INTO matches (user_a_id, user_b_id)
    VALUES (v_user_a, v_user_b)
    ON CONFLICT (user_a_id, user_b_id) DO NOTHING;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
