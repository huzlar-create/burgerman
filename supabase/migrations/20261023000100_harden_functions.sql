-- Sikkerhed: flyt hjælpefunktioner ud af det offentlige API

create schema if not exists extensions;
alter extension unaccent set schema extensions;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create schema if not exists private;
grant usage on schema private to anon, authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

grant execute on function private.is_admin() to anon, authenticated;

-- Peg alle policies på private.is_admin()
alter policy "profiles: admin alt" on public.profiles
  using (private.is_admin()) with check (private.is_admin());
alter policy "restaurants: admin alt" on public.restaurants
  using (private.is_admin()) with check (private.is_admin());
alter policy "reviews: godkendte er offentlige" on public.reviews
  using (status = 'approved' or author_id = auth.uid() or private.is_admin());
alter policy "reviews: indloggede indsender til kø" on public.reviews
  with check (author_id = auth.uid() and (status = 'pending' or private.is_admin()));
alter policy "reviews: admin alt" on public.reviews
  using (private.is_admin()) with check (private.is_admin());
alter policy "photos: følger anmeldelsen" on public.review_photos
  using (exists (select 1 from public.reviews v where v.id = review_id
          and (v.status = 'approved' or v.author_id = auth.uid() or private.is_admin())));
alter policy "photos: admin alt" on public.review_photos
  using (private.is_admin()) with check (private.is_admin());
alter policy "review-photos: admin sletter" on storage.objects
  using (bucket_id = 'review-photos' and private.is_admin());

revoke execute on function public.is_admin() from public, anon, authenticated;
