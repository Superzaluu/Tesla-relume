-- Savings calculator: each model is compared with a similar combustion vehicle.
-- Consumption figures are starting estimates (2026-11-14) — edit them in /admin.
alter table public.models
  add column compare_name        text,
  add column compare_fuel        text check (compare_fuel in ('euro92', 'ai95', 'dt')),
  add column compare_consumption numeric check (compare_consumption > 0 and compare_consumption < 60),
  add column ev_consumption      numeric check (ev_consumption > 0 and ev_consumption < 80);

update public.models set compare_name = 'Hyundai Grand Starex 2.5', compare_fuel = 'dt', compare_consumption = 11
  where slug in ('ec75', 'ec75pro-cargo', 'ec75pro-passenger', 'r5', 'r5pro-cargo', 'r5pro-passenger', 'r5-service');
update public.models set compare_name = 'Kia Bongo III фургон', compare_fuel = 'dt', compare_consumption = 10
  where slug = 'ec35';
update public.models set compare_name = 'Hyundai Porter II 2.5', compare_fuel = 'dt', compare_consumption = 10.5
  where slug in ('c3', 'c5', 'c5l', 'ed71s', 'ec31', 'ec31l', 'ec31s', 'c5-cng', 'c5-drone', 'c5-reev', 'zz-test');
update public.models set compare_name = 'Hyundai Porter II хөргүүртэй', compare_fuel = 'dt', compare_consumption = 12
  where slug = 'c3-cold';
update public.models set compare_name = 'Hyundai Mighty 3.9', compare_fuel = 'dt', compare_consumption = 15
  where slug = 'c9';

-- Electricity use from the spec tables where the factory gives it (kWh/100 km); others use the 22 kWh default.
update public.models set ev_consumption = 18.6 where slug = 'c3';
update public.models set ev_consumption = 18.9 where slug = 'c3-cold';
update public.models set ev_consumption = 19.9 where slug = 'c5';
update public.models set ev_consumption = 21.3 where slug in ('c5-cng', 'c5-drone', 'c5-reev');
