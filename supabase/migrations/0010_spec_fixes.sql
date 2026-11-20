-- Spec naming and value fixes after checking against the manufacturer PDF (2026.11.12).
-- Stage 2 of fix/spec-naming-2026-11: model cards (models.stats, charge, range, size, seats, ev_consumption),
-- the r5 hero subtitle and two labels in the old free-form tables (models.spec).
--
-- Run by hand in Supabase → SQL Editor AFTER the code from this branch is deployed (READY): the code reads
-- both the old and the new labels, the old deploy only the old ones.
-- Safe to run twice: every statement only changes rows that still hold the old value.
-- Current values were read from production on 2026-11-20 before writing this file.

begin;

-- ---------------------------------------------------------------------------
-- 2a. Stat labels on the cards and model pages (models.stats jsonb).
--     A label is either text or {cargo, passenger} (EC75 / R5), so both shapes are renamed.
-- ---------------------------------------------------------------------------
create temporary table stat_label_renames (old text primary key, new text not null) on commit drop;
insert into stat_label_renames values
  ('Цэнэглэлтийн зай (CLTC)', 'Туулах зай (CLTC)'),
  ('Зайн багтаамж',           'Батерейн багтаамж'),
  -- кВт is power: «чадал» (naming standard, 2026-11-20).
  ('Моторын хүч',             'Моторын оргил чадал'),
  ('Моторын оргил хүч',       'Моторын оргил чадал');

update public.models m
set stats = (
  select coalesce(jsonb_agg(
    case jsonb_typeof(e->'label')
      when 'string' then jsonb_set(e, '{label}', to_jsonb(coalesce((select r.new from stat_label_renames r where r.old = e->>'label'), e->>'label')))
      when 'object' then jsonb_set(e, '{label}', (
        select jsonb_object_agg(k, to_jsonb(coalesce((select r.new from stat_label_renames r where r.old = v #>> '{}'), v #>> '{}')))
        from jsonb_each(e->'label') as l(k, v)
      ))
      else e
    end
    order by ord), '[]'::jsonb)
  from jsonb_array_elements(m.stats) with ordinality as a(e, ord)
)
where exists (
  select 1
  from jsonb_array_elements(m.stats) as a(e)
  cross join stat_label_renames r
  where e->>'label' = r.old
     or (jsonb_typeof(e->'label') = 'object' and (e->'label'->>'cargo' = r.old or e->'label'->>'passenger' = r.old))
);

-- ---------------------------------------------------------------------------
-- 2b. Fast charging on the card (Админ → Загварын карт → «Цэнэглэх хугацаа»).
--     ec31s, ec35: not in the PDF, left as they are («Шалгах»).
-- ---------------------------------------------------------------------------
update public.models set charge = 'DC - 18 мин'
where slug in ('c3', 'c3-cold', 'c5', 'c5-box', 'c9', 'ec75pro-cargo', 'ec75pro-passenger', 'r5pro-cargo', 'r5pro-passenger')
  and charge is distinct from 'DC - 18 мин';

update public.models set charge = 'DC - 25 мин'
where slug in ('c5l', 'c5-cng', 'c5-cng-box', 'c5-cng-crew', 'c5-cng-crew-box')   -- c5-cng*: was 'AC/DC - 30 мин'
  and charge is distinct from 'DC - 25 мин';

update public.models set charge = 'DC - 1 цаг (0–80%)'
where slug = 'ed71s' and charge is distinct from 'DC - 1 цаг (0–80%)';

-- EC75, R5: the card said 30 min while their own stats say «Хурдан цэнэглэлт 20–80%» = 18 мин (user, 2026-11-20).
update public.models set charge = 'DC - 18 мин' where slug in ('ec75', 'r5') and charge = 'DC - 30 мин';

-- ---------------------------------------------------------------------------
-- 2c. Other card values.
-- ---------------------------------------------------------------------------
-- EC35: the version sold is the 5-seat one.
update public.models set range = '274 км'  where slug = 'ec35' and range = '282 км';
update public.models set seats = '5 суудал' where slug = 'ec35' and seats = '2–5 суудал';
update public.models m
set stats = (
  select jsonb_agg(
    case when e->>'label' = 'Ачааны багтаамж' and e->>'value' = '5.3' then jsonb_set(e, '{value}', '"3.1"') else e end
    order by ord)
  from jsonb_array_elements(m.stats) with ordinality as a(e, ord)
)
where m.slug = 'ec35'
  and exists (select 1 from jsonb_array_elements(m.stats) as a(e) where e->>'label' = 'Ачааны багтаамж' and e->>'value' = '5.3');

-- C5 box: electricity use from the PDF.
update public.models set ev_consumption = 20.3 where slug = 'c5-box' and ev_consumption = 19.9;

-- EC31S: the box version (the technical table was imported from it; the card is in «Амбаартай машин»).
update public.models set size = '5035 x 1680 x 2480 мм' where slug = 'ec31s' and size = '5035 x 1680 x 2420 мм';
update public.models set quick_label = 'Амбаар', quick_type = 'box' where slug = 'ec31s' and quick_label = 'Задгай тэвш';

-- C5L: the technical table is the box version, so the card shows it too (user, 2026-11-20).
-- quick_type 'box' gives the box icon; 'Амбаар' is the label the other box cards use.
update public.models set size = '5995 x 1920 x 2700 мм' where slug = 'c5l' and size = '5995 x 1920 x 2035 мм';
update public.models set quick_label = 'Амбаар', quick_type = 'box' where slug = 'c5l' and quick_label = 'Задгай тэвш';

-- ---------------------------------------------------------------------------
-- 2d. Same renames outside the stats.
-- ---------------------------------------------------------------------------
-- R5 hero subtitle.
update public.hero_slides
set subtitle = replace(subtitle, 'цэнэглэлтийн зай', 'туулах зай')
where model_slug = 'r5' and subtitle like '%цэнэглэлтийн зай%';

-- Old free-form tables (models.spec, rows of text): first cell is the label.
-- «Хөдлөх өнцөг» = departure angle → «Холдох өнцөг» (ec31, ec31l, ec31s);
-- «Цэнэглэлтийн зай (км)» → «Туулах зай (км)» (ec75pro-*, r5pro-*; these already use models.specs).
update public.models m
set spec = (
  select jsonb_agg(
    case
      when jsonb_typeof(r) = 'array' and r->>0 = 'Хөдлөх өнцөг (°)'      then jsonb_set(r, '{0}', '"Холдох өнцөг (°)"')
      when jsonb_typeof(r) = 'array' and r->>0 = 'Цэнэглэлтийн зай (км)' then jsonb_set(r, '{0}', '"Туулах зай (км)"')
      else r
    end
    order by ord)
  from jsonb_array_elements(m.spec) with ordinality as a(r, ord)
)
where jsonb_typeof(m.spec) = 'array'
  and (m.spec::text like '%"Хөдлөх өнцөг (°)"%' or m.spec::text like '%"Цэнэглэлтийн зай (км)"%');

commit;

-- ---------------------------------------------------------------------------
-- Check (read-only): every row below should show the new values.
-- ---------------------------------------------------------------------------
select slug, charge, range, size, seats, ev_consumption, quick_label,
       (select string_agg(coalesce(e->>'label', (e->'label')::text) || ' = ' || coalesce(e->>'value', (e->'value')::text), '; ')
          from jsonb_array_elements(stats) as a(e)) as stats
from public.models
where slug not like 'zz-%'
order by slug;
