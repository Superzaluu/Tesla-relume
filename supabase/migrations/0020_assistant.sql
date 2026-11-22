-- «AI туслах» (user test #1, 2026-11-23, item 10). Every question the site assistant gets is logged; the ones it
-- could not answer from the site's data are 'open' and wait for an admin in /admin/assistant/. An admin's answer
-- can be added to assistant_knowledge, which the assistant reads on every question, so it learns from them.

create table if not exists public.assistant_questions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  question      text not null check (char_length(question) between 1 and 1000),
  ai_answer     text check (ai_answer is null or char_length(ai_answer) <= 4000),
  -- open = the assistant could not answer (waits for an admin) · ai = answered by the assistant
  -- admin = answered by an admin · dismissed = not a real question
  status        text not null default 'open' check (status in ('open', 'ai', 'admin', 'dismissed')),
  page          text check (page is null or char_length(page) <= 300),
  contact       text check (contact is null or char_length(contact) <= 160),
  admin_answer  text check (admin_answer is null or char_length(admin_answer) <= 4000),
  answered_at   timestamptz
);
create index if not exists assistant_questions_status_idx on public.assistant_questions (status, created_at desc);

create table if not exists public.assistant_knowledge (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  question        text not null check (char_length(question) between 2 and 500),
  answer          text not null check (char_length(answer) between 1 and 4000),
  active          boolean not null default true,
  source_question uuid references public.assistant_questions (id) on delete set null
);

alter table public.assistant_questions enable row level security;
alter table public.assistant_knowledge enable row level security;

-- The site's server logs questions with the public key (insert only, never read back).
create policy "Site logs assistant questions" on public.assistant_questions
  for insert to anon, authenticated with check (status in ('open', 'ai') and admin_answer is null and answered_at is null);
create policy "Admins read assistant questions" on public.assistant_questions
  for select to authenticated using ((select public.is_admin()));
create policy "Admins update assistant questions" on public.assistant_questions
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Active knowledge is public site information: the assistant reads it with the public key.
create policy "Anyone reads active knowledge" on public.assistant_knowledge
  for select to anon, authenticated using (active or (select public.is_admin()));
create policy "Admins write knowledge" on public.assistant_knowledge
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on public.assistant_questions, public.assistant_knowledge from anon, authenticated;
grant insert on public.assistant_questions to anon, authenticated;
grant select, update on public.assistant_questions to authenticated;
grant select on public.assistant_knowledge to anon, authenticated;
grant insert, update, delete on public.assistant_knowledge to authenticated;
