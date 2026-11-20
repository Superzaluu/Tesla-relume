-- Values in the structured sheets (models.specs) written the way «Үзүүлэлтийн нэршлийн стандарт» (2026-11-20) says:
--   suspension is «тэнхлэг» (хамаарах / үл хамаарах), leaf springs «нум», drum brakes «барабан»,
--   an abbreviation comes with its English full name and a Mongolian explanation.
-- The import script (scripts/specs/import-sheet.mts) now writes the same values, so a re-import keeps them.
-- Labels need no migration: they come from the code (src/data/specSheet.ts).
--
-- Run by hand in Supabase → SQL Editor AFTER the code from this branch is deployed (READY), after 0010–0012.
-- Safe to run twice: every rule only matches the old wording.
-- Current values were read from production on 2026-11-20 before writing this file.

begin;

create or replace function pg_temp.std_value(key text, v text) returns text language sql immutable as $$
  select case
    when key in ('front_susp', 'rear_susp') then
      regexp_replace(regexp_replace(regexp_replace(regexp_replace(v,
        '^(\d+(\+\d+)?) навчит пүрштэй, хамааралтай$', 'Хамаарах тэнхлэг, \1 нумтай'),
        '^Навчит пүрштэй, хамааралтай$',               'Хамаарах тэнхлэг, нумтай'),
        '^Макферсон, бие даасан$',                     'Үл хамаарах тэнхлэг, Макферсон'),
        '^Давхар салаат гартай, бие даасан$',          'Үл хамаарах тэнхлэг, давхар салаат гартай')
    when key = 'brakes'        then regexp_replace(v, 'хойд хүрд$', 'хойд барабан')
    when key = 'parking_brake' and v = 'EPB (цахилгаан)'                    then 'EPB (Electric Parking Brake, цахилгаан зогсоолын тоормос)'
    when key = 'steering'      and v in ('EPS (цахилгаан)', 'EPS', 'Цахилгаан') then 'EPS (Electric Power Steering, цахилгаан хүч өгөгч)'
    when key = 'battery_type'  then replace(v, 'LFP (лити төмрийн фосфат)', 'LFP (Lithium Iron Phosphate, литийн төмрийн фосфат)')
    else v
  end
$$;

-- specs.values: { key: [one value per configuration] }; only the keys above change.
create or replace function pg_temp.std_specs(specs jsonb) returns jsonb language sql immutable as $$
  select jsonb_set(specs, '{values}', coalesce((
    select jsonb_object_agg(k, case
      when jsonb_typeof(v) = 'array' and k in ('front_susp', 'rear_susp', 'brakes', 'parking_brake', 'steering', 'battery_type') then
        coalesce((select jsonb_agg(to_jsonb(pg_temp.std_value(k, x)) order by i) from jsonb_array_elements_text(v) with ordinality as e(x, i)), '[]'::jsonb)
      else v
    end)
    from jsonb_each(specs->'values') as kv(k, v)
  ), '{}'::jsonb))
$$;

update public.models set specs = pg_temp.std_specs(specs)
where jsonb_typeof(specs->'values') = 'object' and pg_temp.std_specs(specs) is distinct from specs;

commit;

-- ---------------------------------------------------------------------------
-- Check (read-only): every distinct value of the changed fields.
-- ---------------------------------------------------------------------------
select kv.k as field, x as value, count(*) as configs
from public.models, jsonb_each(specs->'values') as kv(k, v),
     jsonb_array_elements_text(case when jsonb_typeof(kv.v) = 'array' then kv.v else '[]'::jsonb end) as x
where jsonb_typeof(specs->'values') = 'object'
  and kv.k in ('front_susp', 'rear_susp', 'brakes', 'parking_brake', 'steering', 'battery_type') and x <> ''
group by 1, 2 order by 1, 3 desc;
