-- Models with cargo and passenger versions on one page (EC75, R5) have different seat counts.
-- `seats` is the cargo (or only) version, `seats_passenger` the passenger version.
alter table public.models add column seats_passenger text;
