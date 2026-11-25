-- Squads & fees: who signed up (and paid) for each competition.
--
-- PRIVATE: unlike the other tables, nothing here is readable by the public
-- site — only admins can read or write it. Money is stored in whole cents.

-- The league's entry fee for a competition, split across its squad.
create table public.competition_fees (
  competition_id   text primary key references public.competitions (id) on update cascade on delete cascade,
  league_fee_cents integer not null check (league_fee_cents >= 0),
  updated_at       timestamptz not null default now()
);

-- A player who joined a competition's squad, and how their fee is worked out:
--   full   = one share of (league fee − custom amounts)
--   half   = half a share (e.g. missing half the season)
--   custom = a fixed amount agreed with them
create table public.squad_members (
  competition_id   text not null references public.competitions (id) on update cascade on delete cascade,
  player_id        text not null references public.players (id) on update cascade on delete restrict,
  fee_type         text not null default 'full' check (fee_type in ('full', 'half', 'custom')),
  custom_fee_cents integer check (custom_fee_cents >= 0),
  note             text,
  created_at       timestamptz not null default now(),
  primary key (competition_id, player_id),
  check ((fee_type = 'custom') = (custom_fee_cents is not null))
);

-- Every payment received (negative amount = refund). Payments block removing
-- the member (and so deleting the competition or player) so history isn't lost.
create table public.squad_payments (
  id             uuid primary key default gen_random_uuid(),
  competition_id text not null,
  player_id      text not null,
  amount_cents   integer not null check (amount_cents <> 0),
  paid_on        date not null default current_date,
  method         text,
  note           text,
  created_at     timestamptz not null default now(),
  foreign key (competition_id, player_id)
    references public.squad_members (competition_id, player_id) on update cascade on delete restrict
);
create index squad_payments_competition_idx on public.squad_payments (competition_id, player_id);
create index squad_members_player_idx on public.squad_members (player_id);

create trigger competition_fees_touch before update on public.competition_fees
  for each row execute function public.touch_updated_at();

-- Admins only. No grants or policies for anon at all.
revoke all on public.competition_fees, public.squad_members, public.squad_payments from anon, public;
grant select, insert, update, delete on public.competition_fees, public.squad_members, public.squad_payments to authenticated;

alter table public.competition_fees enable row level security;
alter table public.squad_members enable row level security;
alter table public.squad_payments enable row level security;

create policy "admin only" on public.competition_fees for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.squad_members for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin only" on public.squad_payments for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
