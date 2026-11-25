-- Forfeits (walkovers/byes): a result that wasn't played.
alter table public.matches add column forfeit boolean not null default false;

update public.matches set forfeit = true
where id in ('groupstage-summer-1', 'groupstage-summer-4'); -- "Bye" vs Englantina, "Walkover" vs The Trotters

-- Saves a match and replaces its lineup in one transaction, so a failure
-- can't leave a match with half a lineup. Runs as the caller (security
-- invoker), so the normal rules apply: only admins can write.
--   p_match:  matches columns as JSON; include "id" to update, omit to create
--   p_lineup: [{ "name", "player_id" (null for guests), "goals" }, ...] in lineup order
create or replace function public.save_match(p_match jsonb, p_lineup jsonb)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id text := nullif(p_match ->> 'id', '');
begin
  if v_id is not null then
    update public.matches set
      competition_id = p_match ->> 'competition_id',
      stage          = p_match ->> 'stage',
      match_date     = (p_match ->> 'match_date')::date,
      kickoff        = p_match ->> 'kickoff',
      venue          = p_match ->> 'venue',
      opponent       = p_match ->> 'opponent',
      home_away      = p_match ->> 'home_away',
      our_score      = (p_match ->> 'our_score')::int,
      opponent_score = (p_match ->> 'opponent_score')::int,
      pens_for       = (p_match ->> 'pens_for')::int,
      pens_against   = (p_match ->> 'pens_against')::int,
      status         = p_match ->> 'status',
      forfeit        = coalesce((p_match ->> 'forfeit')::boolean, false),
      note           = p_match ->> 'note'
    where id = v_id;
    if not found then
      raise exception 'Match % not found, or you are not allowed to edit it', v_id;
    end if;
  else
    insert into public.matches (
      competition_id, stage, match_date, kickoff, venue, opponent, home_away,
      our_score, opponent_score, pens_for, pens_against, status, forfeit, note
    ) values (
      p_match ->> 'competition_id',
      p_match ->> 'stage',
      (p_match ->> 'match_date')::date,
      p_match ->> 'kickoff',
      p_match ->> 'venue',
      p_match ->> 'opponent',
      p_match ->> 'home_away',
      (p_match ->> 'our_score')::int,
      (p_match ->> 'opponent_score')::int,
      (p_match ->> 'pens_for')::int,
      (p_match ->> 'pens_against')::int,
      p_match ->> 'status',
      coalesce((p_match ->> 'forfeit')::boolean, false),
      p_match ->> 'note'
    )
    returning id into v_id;
  end if;

  delete from public.match_players where match_id = v_id;

  insert into public.match_players (match_id, name, player_id, goals, lineup_order)
  select
    v_id,
    trim(e ->> 'name'),
    nullif(e ->> 'player_id', ''),
    coalesce((e ->> 'goals')::int, 0),
    (ord - 1)::int
  from jsonb_array_elements(coalesce(p_lineup, '[]'::jsonb)) with ordinality as t(e, ord);

  return v_id;
end;
$$;

revoke execute on function public.save_match(jsonb, jsonb) from public, anon;
grant execute on function public.save_match(jsonb, jsonb) to authenticated;
