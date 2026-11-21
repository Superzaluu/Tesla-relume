-- «Эхлэх үнэ» (user, 2026-11-21): the dealer's price of the lowest trim, per menu card (cargo and passenger
-- versions of one page have their own price). Shown on the cards, the model hero and the trim section as
-- "Эхлэх үнэ … ₮"; the trims themselves keep «Үнэ лавлах» (the visitor picks a trim and asks for its price).
-- Edited in /admin → Машины карт → «Эхлэх үнэ (₮)». Null = no price shown.
--
-- Source: ruichi_vehicles_data.csv from the user (2026-11-21), lowest row per card:
--   EC75 ачааны  67,745,600 (EC75 货运版 252 км)   R5 ачааны 60,881,600 (R5 货运版)   C3 задгай 61,505,600
--   EC31L 50,897,600   C5 EREV нэг кабин 77,911,600.
-- Not used: the EC75 Pro / R5 Pro rows (higher than their page's start), C3 битүү амбаар 69,617,600 (no page yet).
-- Safe before and after the code that reads it (old code selects listings with *). Safe to run twice.

alter table public.model_listings add column if not exists price_from bigint;

update public.model_listings set price_from = p.price
from (values ('ec75-cargo', 67745600), ('r5-cargo', 60881600), ('c3', 61505600), ('ec31l', 50897600), ('c5-reev', 77911600)) as p(key, price)
where model_listings.key = p.key;

-- Check (read only):
-- select key, price_from from public.model_listings where price_from is not null order by key;
