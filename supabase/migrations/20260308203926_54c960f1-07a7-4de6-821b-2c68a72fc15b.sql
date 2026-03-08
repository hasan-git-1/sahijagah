-- Create document-vault storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('document-vault', 'document-vault', false) ON CONFLICT (id) DO NOTHING;

-- RLS for document-vault: users can only access their own folder
CREATE POLICY "Users can upload own documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'document-vault' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'document-vault' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'document-vault' AND (storage.foldername(name))[1] = auth.uid()::text);