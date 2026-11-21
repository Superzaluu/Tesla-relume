-- New dealer prices (user, 2026-11-21, ruichi_web_data_updated.csv): «Эхлэх үнэ» per card, the lowest row per card
-- as in 0016. Applied to Supabase on 2026-11-21. Safe to run twice.
--   EC75 ачааны 75,475,840 (EC75 货运版 252 км)   R5 ачааны 67,978,240 (R5 货运版)   C3 задгай 68,659,840
--   EC31L 57,072,640   C5 EREV нэг кабин 86,580,240.
-- Not used (as in 0016): EC75 Pro 102,058,240 / 109,555,840, R5 Pro 102,739,840, EC75 货运版 310 км 85,018,240,
-- C3 битүү амбаар 77,520,640 (no page yet).

update public.model_listings set price_from = p.price
from (values ('ec75-cargo', 75475840), ('r5-cargo', 67978240), ('c3', 68659840), ('ec31l', 57072640), ('c5-reev', 86580240)) as p(key, price)
where model_listings.key = p.key;
