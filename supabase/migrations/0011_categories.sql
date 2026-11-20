-- Menu categories (user, 2026-11-20): five instead of six, in this order:
--   Хотын хүргэлт · Амбаартай машин · Задгай тэвштэй машин · Зорчигч тээвэр · Хөргүүртэй болон тусгай зориулалтын
-- "Тусгай зориулалтын машин" is merged into the refrigerated category: its cards move there and the empty
-- category disappears from the menu by itself (getNavigation() leaves out categories without cards).
-- The ids stay the same, so links (/?category=…), the admin and the spec slots keep working; the code
-- (slotSetFor) still gives the special builds their own slots instead of the cooling ones.
--
-- Run by hand in Supabase → SQL Editor AFTER the code from this branch is deployed (READY).
-- Safe to run twice.

begin;

update public.categories set label = 'Хотын хүргэлт',                       sort = 0 where id = 'cargo-van';
update public.categories set label = 'Амбаартай машин',                     sort = 1 where id = 'box';
update public.categories set label = 'Задгай тэвштэй машин',                sort = 2 where id = 'flatbed';
update public.categories set label = 'Зорчигч тээвэр',                      sort = 3 where id = 'passenger';
update public.categories set label = 'Хөргүүртэй болон тусгай зориулалтын', sort = 4 where id = 'refrigerated';
update public.categories set sort = 5 where id = 'special';

-- Special builds go after the refrigerated cards (C3 cold has sort 0).
update public.model_listings
set category_id = 'refrigerated',
    sort = sort + 1 + coalesce((select max(sort) from public.model_listings where category_id = 'refrigerated'), -1)
where category_id = 'special';

commit;

-- Check (read-only).
select c.sort, c.id, c.label, string_agg(l.key || case when l.active then '' else ' (нуугдсан)' end, ', ' order by l.sort) as cards
from public.categories c
left join public.model_listings l on l.category_id = c.id
group by c.sort, c.id, c.label
order by c.sort;
