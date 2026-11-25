-- Storage deletes (and upserts) need SELECT on storage.objects as well.
-- Public URLs don't go through these rules, so this only affects API access.
create policy "admin read player photos" on storage.objects
  for select to authenticated using (bucket_id = 'player-photos' and public.is_admin());
