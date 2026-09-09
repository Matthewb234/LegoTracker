create policy "users can upload own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can update own avatar"
on storage.objects
for update
                      to authenticated
                      using (
                      bucket_id = 'avatars'
                      and (storage.foldername(name))[1] = auth.uid()::text
                      );

create policy "users can delete own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);