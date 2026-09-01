/**
 * Squad data model, built to support individual player pages and full
 * statistics later. Real roster details have not been supplied yet, so
 * every entry below is an explicit placeholder — swap in real players
 * (and their photos via images.ts) as the club provides them.
 */

export type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

export type Player = {
  id: string;
  name: string;
  number: number;
  position: Position;
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets?: number;
  captain: boolean;
  active: boolean;
};

export const players: Player[] = [
  { id: "player-1", name: "Player Name", number: 1, position: "Goalkeeper", appearances: 0, goals: 0, assists: 0, cleanSheets: 0, captain: false, active: true },
  { id: "player-2", name: "Player Name", number: 2, position: "Defender", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "player-3", name: "Player Name", number: 4, position: "Defender", appearances: 0, goals: 0, assists: 0, captain: true, active: true },
  { id: "player-4", name: "Player Name", number: 6, position: "Midfielder", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "player-5", name: "Player Name", number: 8, position: "Midfielder", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "player-6", name: "Player Name", number: 9, position: "Forward", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "player-7", name: "Player Name", number: 10, position: "Forward", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "player-8", name: "Player Name", number: 11, position: "Forward", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
];

export const squadIsPlaceholder = true;

export const positionOrder: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export function playersByPosition(position: Position): Player[] {
  return players.filter((p) => p.position === position).sort((a, b) => a.number - b.number);
}

export const featuredPlayers: Player[] = players.slice(0, 6);
