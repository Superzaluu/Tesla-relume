-- «Эхлэх үнэ» set by the user (2026-11-21): EC75 ачааны 80,000,000 ₮; the others raised by the same ratio
-- (80,000,000 / 75,475,840 = +5.99% over 0017) and rounded to the nearest 2,000,000 ₮ (no odd amounts).
--   EC75 ачааны 80,000,000 · R5 ачааны 72,000,000 (72,052,980) · C3 задгай 72,000,000 (72,775,436)
--   EC31L 60,000,000 (60,493,679) · C5 EREV нэг кабин 92,000,000 (91,770,018).
-- Applied to Supabase on 2026-11-21. Safe to run twice.

update public.model_listings set price_from = p.price
from (values ('ec75-cargo', 80000000), ('r5-cargo', 72000000), ('c3', 72000000), ('ec31l', 60000000), ('c5-reev', 92000000)) as p(key, price)
where model_listings.key = p.key;
