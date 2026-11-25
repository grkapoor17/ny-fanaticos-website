-- Appearances/goals per matchday name, split by which squad player (if any)
-- the name is linked to. Used by the admin panel to show counts and to list
-- guest names that can be linked to a player.
create view public.match_player_names
with (security_invoker = true) as
select
  name,
  player_id,
  count(*)::int   as appearances,
  sum(goals)::int as goals
from public.match_players
group by name, player_id;

grant select on public.match_player_names to anon, authenticated;
