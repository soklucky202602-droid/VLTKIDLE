-- VLTK Idle online account storage
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot smallint not null check (slot between 0 and 2),
  name text not null default 'Tân thủ',
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique(user_id, slot)
);

alter table public.characters enable row level security;

drop policy if exists "characters_select_own" on public.characters;
create policy "characters_select_own" on public.characters for select using (auth.uid() = user_id);

drop policy if exists "characters_insert_own" on public.characters;
create policy "characters_insert_own" on public.characters for insert with check (auth.uid() = user_id);

drop policy if exists "characters_update_own" on public.characters;
create policy "characters_update_own" on public.characters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "characters_delete_own" on public.characters;
create policy "characters_delete_own" on public.characters for delete using (auth.uid() = user_id);

create index if not exists characters_user_id_idx on public.characters(user_id);
