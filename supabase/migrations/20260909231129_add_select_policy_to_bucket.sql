create policy "users can read own avatar objects"
on storage.objects
for select
               to authenticated
               using (
               bucket_id = 'avatars'
               and (storage.foldername(name))[1] = auth.uid()::text
               );