CREATE POLICY "Public read site-media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'site-media');
CREATE POLICY "Admins upload site-media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update site-media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'site-media' AND public.has_role(auth.uid(),'admin')) WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete site-media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'site-media' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Anyone upload inscricoes" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'inscricoes');
CREATE POLICY "Admins read inscricoes" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'inscricoes' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete inscricoes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'inscricoes' AND public.has_role(auth.uid(),'admin'));