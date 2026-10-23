-- Pris på burgeren i hele kroner, vises som "89 kr."
alter table public.reviews add column price_kr integer check (price_kr >= 0);

create or replace view public.restaurant_stats
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
  max(v.approved_at) as last_reviewed_at,
  round(avg(v.price_kr))::integer as typical_price_kr
from public.restaurants r
join public.reviews v on v.restaurant_id = r.id and v.status = 'approved'
group by r.id;
