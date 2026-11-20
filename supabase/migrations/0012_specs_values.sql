-- Technical tables after checking against the manufacturer PDF (2026.11.12). Stage 3 of fix/spec-naming-2026-11.
--   A. models.specs (structured sheet, imported from Google Sheet «Ruichi specs»): value fixes and the new
--      engine_power field («Зай сунгагчийн чадал / момент»). The same changes must be made in the Sheet,
--      or the next import brings the old values back (list in the PR / chat, 2026-11-20).
--   B. models.spec (old machine-translated tables) of EC31, EC31L and C5 Drone: labels and a few values
--      in plain Mongolian, rows that mean nothing for an electric car removed.
--
-- Run by hand in Supabase → SQL Editor AFTER the code from this branch is deployed (READY): the code
-- knows engine_power and the new labels. Run after 0010 and 0011. Safe to run twice.
-- Current values were read from production on 2026-11-20 before writing this file.

begin;

-- ---------------------------------------------------------------------------
-- Helpers (temporary, gone at the end of the session).
-- specs.values[key] holds one value per configuration (specs.configs).
-- ---------------------------------------------------------------------------
create or replace function pg_temp.per_config(specs jsonb, val text) returns jsonb language sql immutable as $$
  select coalesce(jsonb_agg(to_jsonb(val)), '[]'::jsonb) from generate_series(1, jsonb_array_length(specs->'configs'))
$$;

create or replace function pg_temp.set_value(specs jsonb, key text, val text) returns jsonb language sql immutable as $$
  select jsonb_set(specs, array['values', key], pg_temp.per_config(specs, val), true)
$$;

create or replace function pg_temp.drop_extras(specs jsonb, labels text[]) returns jsonb language sql immutable as $$
  select jsonb_set(specs, '{extras}', coalesce(
    (select jsonb_agg(e order by o) from jsonb_array_elements(specs->'extras') with ordinality as t(e, o) where not (e->>'label' = any(labels))),
    '[]'::jsonb))
$$;

-- Replaces an extra row with the same label, or appends it.
create or replace function pg_temp.put_extra(specs jsonb, grp text, label text, val text) returns jsonb language sql immutable as $$
  select jsonb_set(s, '{extras}', coalesce(s->'extras', '[]'::jsonb)
    || jsonb_build_array(jsonb_build_object('group', grp, 'label', label, 'values', pg_temp.per_config(s, val))))
  from (select pg_temp.drop_extras(specs, array[label]) as s) as x
$$;

-- ---------------------------------------------------------------------------
-- A. Structured sheets (models.specs)
-- ---------------------------------------------------------------------------

-- ED71S. Rear springs: the Chinese PDF says 7+6 leaves (7+6片), the English translation is wrong.
-- Fast charging: 60 min is 0–80 %, but the field means 20–80 %, so it moves to its own row.
update public.models set specs =
  pg_temp.put_extra(
    pg_temp.set_value(pg_temp.set_value(pg_temp.set_value(pg_temp.set_value(specs,
      'rear_susp', 'Хамаарах тэнхлэг, 7+6 нумтай'),
      'ac_power', '6.6'),
      'ac_time', '8.6–18.2'),
      'dc_time', ''),
    'battery', 'Хурдан цэнэглэлт 0–80%', '1 цаг')
where slug = 'ed71s' and specs is not null;

-- C5L
update public.models set specs = pg_temp.set_value(pg_temp.set_value(specs, 'ac_power', '6.6'), 'ac_time', '11.25')
where slug = 'c5l' and specs is not null;

-- EC75 Pro, R5 Pro
update public.models set specs = pg_temp.set_value(specs, 'ac_time', '8')
where slug = 'ec75pro-cargo' and specs is not null;

update public.models set specs = pg_temp.set_value(pg_temp.set_value(specs, 'ac_power', '6.6'), 'tyres', '195/75 R16LT')
where slug = 'ec75pro-passenger' and specs is not null;

update public.models set specs = pg_temp.set_value(pg_temp.set_value(specs, 'ac_time', '8'), 'tyres', '195/75 R16LT')
where slug in ('r5pro-cargo', 'r5pro-passenger') and specs is not null;

-- C5 box: cargo side doors (every configuration).
update public.models set specs = pg_temp.set_value(specs, 'side_doors', 'Баруун талд 1 эсвэл 2 хаалга')
where slug = 'c5-box' and specs is not null;

-- EC35: the motor sits at the rear.
update public.models set specs = pg_temp.set_value(specs, 'drive', 'RWD')
where slug = 'ec35' and specs is not null;

-- C5 EREV (petrol range extender): engine power / torque in the new field instead of two extra rows;
-- NEDC average fuel use: flatbed / fence 1.0, box 1.2 l/100 km.
update public.models set specs =
  pg_temp.put_extra(
    pg_temp.drop_extras(
      pg_temp.set_value(specs, 'engine_power', '70 кВт / 130 Н·м'),
      array['Хөдөлгүүрийн чадал (кВт)', 'Хөдөлгүүрийн эргэх момент (Н·м)', 'Жигнэсэн түлшний зарцуулалт (л/100км)']),
    'extender', 'NEDC дундаж түлшний зарцуулалт (л/100км)', case when slug like '%-box' then '1.2' else '1.0' end)
where slug in ('c5-reev', 'c5-reev-box', 'c5-reev-crew', 'c5-reev-crew-box') and specs is not null;

-- C5 CNG: engine power / torque in the new field. Gas use is in kg/100 km, so it stays an extra row
-- (fuel_use is l/100 km) under a clearer label.
update public.models set specs =
  pg_temp.put_extra(
    pg_temp.drop_extras(
      pg_temp.set_value(specs, 'engine_power', '55 кВт / 108 Н·м'),
      array['Хөдөлгүүрийн чадал (кВт)', 'Хөдөлгүүрийн эргэх момент (Н·м)', 'Хийн зарцуулалт, батерей дууссан үед (кг/100км)']),
    'extender', 'Хийн зарцуулалт (бага цэнэгтэй үед) (кг/100км)', '6.8')
where slug in ('c5-cng', 'c5-cng-box', 'c5-cng-crew', 'c5-cng-crew-box') and specs is not null;

-- ---------------------------------------------------------------------------
-- B. Old tables (models.spec): rows of text, first cell = label. EC31, EC31L, C5 Drone.
-- ---------------------------------------------------------------------------
create or replace function pg_temp.fix_legacy(spec jsonb) returns jsonb language sql immutable as $$
  with cells as (
    select ord, r->>0 as old_label,
           coalesce((select array_agg(v order by i) from jsonb_array_elements_text(r) with ordinality as c(v, i) where i > 1), '{}') as vals
    from jsonb_array_elements(spec) with ordinality as t(r, ord)
    where jsonb_typeof(r) = 'array'
  ),
  renamed as (
    select ord, old_label,
      case
        when old_label like 'Үйл ажиллагааны миль (CLTC)%'                      then 'Туулах зай (CLTC), км'
        when old_label like 'Хамгийн их эргэлт (%'                               then 'Хамгийн их эргэх момент (Н·м)'
        when old_label like 'Хөдөлгүүрийн нийт эргэлт (%'                        then 'Моторын нийт эргэх момент (Н·м)'
        when old_label like 'Эрчим хүчний дээд хурд%'                            then 'Дээд хүчний эргэлт (rpm)'
        when old_label =    'Урд тэнхлэг хоорондын зай (мм)'                     then 'Урд дугуй хоорондын зай (мм)'
        when old_label =    'Арын тэнхлэг хоорондын зай (мм)'                    then 'Хойд дугуй хоорондын зай (мм)'
        when old_label =    'Жолооны горим'                                      then 'Хөтлөгч'
        when old_label =    'Туслах төрөл'                                       then 'Жолооны хүч өгөгч'
        when old_label =    'Хөдөлгүүрийн моторын тоо'                           then 'Хөтлөх моторын тоо'
        when old_label in  ('Моторын зохион байгуулалт', 'Мотор зохион байгуулалт') then 'Моторын байрлал'
        when old_label =    'Илтгэгчдийн тоо'                                    then 'Чанга яригчийн тоо'
        when old_label =    'ABS цоожны эсрэг'                                   then 'ABS (тоормос түгжигдэхээс сэргийлэх)'
        when old_label like 'Агааржуулагчийн температур%'                        then 'Агааржуулагч'
        when old_label =    'Төсөл'                                              then 'Хувилбар'
        when old_label =    'I төрлийн анхдагч'                                  then 'Pioneer I'
        else old_label
      end as label,
      (select coalesce(array_agg(
         case
           when v in ('хойд дугуйгаар хөтлөгчтэй', 'Арын хөдөлгүүрийн хойд хөтөч', 'Арын хөдөлгүүрийн хойд дугуйгаар хөтлөгчтэй') then 'Хойд дугуйгаар (RWD)'
           when v = 'Хэвтээ' and old_label in ('Моторын зохион байгуулалт', 'Мотор зохион байгуулалт') then 'Хөндлөн'
           -- Naming standard (2026-11-20): тэнхлэг, нум, барабан тоормос, abbreviation + English + Mongolian.
           when v = 'Бөмбөрийн тоормос'                            then 'Барабан тоормос'
           when v in ('Дискэн тоормос', 'Диск тоормос')            then 'Диск тоормос'
           when v = 'Урд диск ба хойд хүрд'                        then 'Урд диск, хойд барабан'
           when v = 'Уртааш навчны пүршний бие даасан бус суспенз' then 'Хамаарах тэнхлэг, уртааш нумтай'
           when v = '5+2 уртааш навчны булаг, бие даасан бус суспенз, дээд навчны булаг' then 'Хамаарах тэнхлэг, 5+2 уртааш нумтай'
           when v = 'MacPherson бие даасан түдгэлзүүлэлт'          then 'Үл хамаарах тэнхлэг, Макферсон'
           when v = 'Давхар салаа бие даасан түдгэлзүүлэлт'        then 'Үл хамаарах тэнхлэг, давхар салаат гартай'
           when v = 'Цахим туслах (EPS)'                           then 'EPS (Electric Power Steering, цахилгаан хүч өгөгч)'
           when v = 'ABSi+wheel EPB'                               then 'EPB (Electric Parking Brake, цахилгаан зогсоолын тоормос)'
           when v = 'Лити төмрийн фосфат'                          then 'LFP (Lithium Iron Phosphate, литийн төмрийн фосфат)'
           when v = '●Гарын авлага'                                then '● Гар удирдлагатай'
           when v = 'I төрлийн анхдагч'                            then 'Pioneer I'
           else v
         end order by i), '{}')
       from unnest(vals) with ordinality as u(v, i)) as vals,
      exists (select 1 from unnest(vals) as u(v) where btrim(v) <> '') as has_values,
      not exists (select 1 from unnest(vals) as u(v) where btrim(v) not in ('-', '')) and cardinality(vals) > 0 as all_dash
    from cells
  ),
  kept as (
    select *, row_number() over (partition by (label = 'Агааржуулагч' and has_values) order by ord) as nth
    from renamed
    where not (
      -- mistranslated, meaningless row
      old_label like 'Идэвхгүй явган хүний%'
      -- the "Эрчим хүч" (engine) block of an electric car: every value is "-"
      or (old_label in ('Хөдөлгүүрийн загвар', 'Хамгийн их хүч (кВт)', 'Эрчим хүчний дээд хурд (rpm)', 'Хамгийн их эргэлт (Н·м)', 'Түлшний хэлбэр') and all_dash)
      or (old_label = 'Эрчим хүч' and not has_values)
      -- "Агааржуулагч" headings without values (the control row now carries the name)
      or (label = 'Агааржуулагч' and not has_values)
    )
  )
  select coalesce(jsonb_agg(to_jsonb(array[label] || vals) order by ord), '[]'::jsonb)
  from kept
  where not (label = 'Агааржуулагч' and has_values and nth > 1)   -- duplicated AC row: keep the first
$$;

update public.models set spec = pg_temp.fix_legacy(spec)
where slug in ('ec31', 'ec31l', 'c5-drone') and jsonb_typeof(spec) = 'array'
  and pg_temp.fix_legacy(spec) is distinct from spec;

commit;

-- ---------------------------------------------------------------------------
-- Check (read-only).
-- ---------------------------------------------------------------------------
select slug,
       specs->'values'->'engine_power' as engine_power,
       specs->'values'->'ac_power'     as ac_power,
       specs->'values'->'ac_time'      as ac_time,
       specs->'values'->'dc_time'      as dc_time,
       specs->'values'->'tyres'        as tyres,
       specs->'values'->'rear_susp'    as rear_susp,
       (select string_agg(e->>'label', '; ') from jsonb_array_elements(specs->'extras') as e where e->>'group' in ('extender', 'battery')) as extras
from public.models
where slug in ('ed71s', 'c5l', 'ec75pro-cargo', 'ec75pro-passenger', 'r5pro-cargo', 'r5pro-passenger', 'c5-box', 'ec35',
               'c5-reev', 'c5-reev-box', 'c5-reev-crew', 'c5-reev-crew-box', 'c5-cng', 'c5-cng-box', 'c5-cng-crew', 'c5-cng-crew-box')
order by slug;

select slug, jsonb_array_length(spec) as rows,
       (select string_agg(r->>0, ' · ') from jsonb_array_elements(spec) as r
         where r->>0 in ('Хувилбар', 'Туулах зай (CLTC), км', 'Хөтлөгч', 'Моторын байрлал', 'Агааржуулагч', 'Чанга яригчийн тоо')) as renamed
from public.models where slug in ('ec31', 'ec31l', 'c5-drone') order by slug;
