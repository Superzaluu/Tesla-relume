-- Structured technical specs filled from the admin form (see src/data/specSheet.ts).
-- Shape: { configs: [{name, sold}], values: {fieldKey: [value per config]}, extras: [{group, label, values}] }.
-- While null, the page converts the old free-form table in models.spec on the fly; models.spec stays as a backup.
alter table public.models add column if not exists specs jsonb;

comment on column public.models.specs is 'Structured spec sheet (admin form). Null = derived from models.spec.';
