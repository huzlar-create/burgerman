-- Burgerman.dk: grundskema for restauranter, anmeldelser og billeder

create extension if not exists unaccent;

-- Brugerprofiler (en pr. login). is_admin styrer adgang til dashboardet.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Opret automatisk en profil, når en bruger logger ind første gang
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Restauranter (et sted på kortet)
create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text not null,
  city text not null,
  city_slug text not null,
  lat double precision,
  lng double precision,
  website text,
  created_at timestamptz not null default now()
);

create index restaurants_city_slug_idx on public.restaurants (city_slug);

-- Anmeldelser. Karakterer er 0-10 med halve point.
create type public.review_status as enum ('pending', 'approved', 'rejected');

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,
  burger_name text,
  score_overall numeric(3,1) not null check (score_overall between 0 and 10),
  score_patty numeric(3,1) check (score_patty between 0 and 10),
  score_bun numeric(3,1) check (score_bun between 0 and 10),
  score_sides numeric(3,1) check (score_sides between 0 and 10),
  score_price numeric(3,1) check (score_price between 0 and 10),
  body text,
  visited_on date,
  status public.review_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reviews_restaurant_idx on public.reviews (restaurant_id);
create index reviews_status_idx on public.reviews (status);

create table public.review_photos (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews (id) on delete cascade,
  storage_path text not null,
  alt text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index review_photos_review_idx on public.review_photos (review_id);

-- Samlet statistik pr. restaurant ud fra godkendte anmeldelser (bruges til toplister)
create view public.restaurant_stats
with (security_invoker = true)
as
select
  r.id as restaurant_id,
  r.slug,
  r.name,
  r.city,
  r.city_slug,
  r.lat,
  r.lng,
  count(v.id) as review_count,
  round(avg(v.score_overall), 1) as avg_overall,
  round(avg(v.score_patty), 1) as avg_patty,
  round(avg(v.score_bun), 1) as avg_bun,
  round(avg(v.score_sides), 1) as avg_sides,
  round(avg(v.score_price), 1) as avg_price,
  max(v.approved_at) as last_reviewed_at
from public.restaurants r
join public.reviews v on v.restaurant_id = r.id and v.status = 'approved'
group by r.id;

-- Row level security
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.reviews enable row level security;
alter table public.review_photos enable row level security;

create policy "profiles: alle kan læse" on public.profiles
  for select using (true);
create policy "profiles: ret egen" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));
create policy "profiles: admin alt" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "restaurants: alle kan læse" on public.restaurants
  for select using (true);
create policy "restaurants: indloggede kan foreslå" on public.restaurants
  for insert to authenticated with check (true);
create policy "restaurants: admin alt" on public.restaurants
  for all using (public.is_admin()) with check (public.is_admin());

create policy "reviews: godkendte er offentlige" on public.reviews
  for select using (status = 'approved' or author_id = auth.uid() or public.is_admin());
create policy "reviews: indloggede indsender til kø" on public.reviews
  for insert to authenticated
  with check (author_id = auth.uid() and (status = 'pending' or public.is_admin()));
create policy "reviews: admin alt" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

create policy "photos: følger anmeldelsen" on public.review_photos
  for select using (
    exists (select 1 from public.reviews v where v.id = review_id
            and (v.status = 'approved' or v.author_id = auth.uid() or public.is_admin()))
  );
create policy "photos: forfatter tilføjer" on public.review_photos
  for insert to authenticated
  with check (exists (select 1 from public.reviews v where v.id = review_id and v.author_id = auth.uid()));
create policy "photos: admin alt" on public.review_photos
  for all using (public.is_admin()) with check (public.is_admin());

-- Billedlager
insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do nothing;

create policy "review-photos: indloggede uploader" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "review-photos: admin sletter" on storage.objects
  for delete using (bucket_id = 'review-photos' and public.is_admin());
