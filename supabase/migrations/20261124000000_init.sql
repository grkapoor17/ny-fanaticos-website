-- NY Fanaticos core schema: competitions, players, matches, and who played
-- in each match. Everyone can read; only emails in `admins` can write.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.competitions (
  id          text primary key,                 -- e.g. 'bowery-premier-d4-2026-fall'
  name        text not null,                    -- e.g. 'Bowery Premier League D4'
  season      text not null,                    -- e.g. '2026 Fall'
  status      text not null default 'Upcoming', -- free text: 'Champions', 'Semifinalists', ...
  summary     text not null default '',
  starts_on   date,                             -- used for ordering, newest first
  created_at  timestamptz not null default now(),
  unique (name, season)
);

create table public.players (
  id          text primary key,                 -- URL slug: /squad/<id>
  name        text not null,
  number      int,
  position    text not null default 'Midfielder'
              check (position in ('Goalkeeper', 'Defender', 'Midfielder', 'Forward')),
  captain     boolean not null default false,
  active      boolean not null default true,
  photo_path  text,                             -- object path in the 'player-photos' bucket
  sort_order  int not null default 0,           -- roster order (first 6 are featured on the homepage)
  created_at  timestamptz not null default now()
);

create table public.matches (
  id              text primary key default gen_random_uuid()::text,
  competition_id  text not null references public.competitions (id) on update cascade,
  stage           text not null default 'Regular Season',
  match_date      date,
  kickoff         text,                         -- as entered, e.g. '8:00 PM'
  venue           text,
  opponent        text not null,
  home_away       text check (home_away in ('home', 'away', 'neutral')),
  our_score       int check (our_score >= 0),
  opponent_score  int check (opponent_score >= 0),
  pens_for        int check (pens_for >= 0),
  pens_against    int check (pens_against >= 0),
  status          text not null default 'scheduled' check (status in ('scheduled', 'final')),
  note            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- a final result must have a score
  check (status = 'scheduled' or (our_score is not null and opponent_score is not null))
);

create index matches_competition_idx on public.matches (competition_id);
create index matches_date_idx on public.matches (match_date);

-- One row per person who played in a match. Squad members link to
-- `players`; guests/one-off call-ups have player_id = null and are kept by
-- the name recorded on matchday.
create table public.match_players (
  match_id     text not null references public.matches (id) on delete cascade,
  name         text not null,
  player_id    text references public.players (id) on update cascade on delete set null,
  goals        int not null default 0 check (goals >= 0),
  lineup_order int not null default 0,
  primary key (match_id, name)
);

create index match_players_player_idx on public.match_players (player_id);

-- Emails allowed to use /admin. Add a row here to give another captain access.
create table public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger matches_touch_updated_at
  before update on public.matches
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Access rules (row level security)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Table-level grants (explicit so we don't depend on the project's
-- "grant API access automatically" setting). RLS below decides which rows.
grant select on public.competitions, public.players, public.matches, public.match_players to anon, authenticated;
grant insert, update, delete on public.competitions, public.players, public.matches, public.match_players to authenticated;
revoke all on public.admins from anon, authenticated;

alter table public.competitions  enable row level security;
alter table public.players       enable row level security;
alter table public.matches       enable row level security;
alter table public.match_players enable row level security;
alter table public.admins        enable row level security; -- no policies: not readable via the API

create policy "public read" on public.competitions  for select using (true);
create policy "public read" on public.players       for select using (true);
create policy "public read" on public.matches       for select using (true);
create policy "public read" on public.match_players for select using (true);

create policy "admin write" on public.competitions  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.players       for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.matches       for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin write" on public.match_players for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Player photo storage (publicly viewable, admin-only uploads)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('player-photos', 'player-photos', true)
on conflict (id) do nothing;

create policy "admin upload player photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'player-photos' and public.is_admin());
create policy "admin update player photos" on storage.objects
  for update to authenticated using (bucket_id = 'player-photos' and public.is_admin());
create policy "admin delete player photos" on storage.objects
  for delete to authenticated using (bucket_id = 'player-photos' and public.is_admin());
