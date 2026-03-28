-- Create "photos" bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photos', 'photos', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage object policies for 'photos' bucket
CREATE POLICY "Public profiles photos accessible by everyone."
ON storage.objects FOR SELECT
USING ( bucket_id = 'photos' );

CREATE POLICY "Users can upload their own photos."
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can update their own photos."
ON storage.objects FOR UPDATE
USING ( bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1] );

CREATE POLICY "Users can delete their own photos."
ON storage.objects FOR DELETE
USING ( bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1] );
