/**
 * Squad data model, built to support individual player pages and full
 * statistics later. Positions are placeholder (all "Midfielder") until
 * the club provides real ones — update as that info comes in.
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
  { id: "gautam", name: "Gautam Kapoor", number: 10, position: "Midfielder", appearances: 0, goals: 0, assists: 0, captain: true, active: true },
  { id: "caleb", name: "Caleb Smith-Salzberg", number: 18, position: "Defender", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "onur", name: "Onur Gurol", number: 11, position: "Forward", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "ben", name: "Ben Richardson", number: 19, position: "Midfielder", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "vikram", name: "Vikram Arun", number: 3, position: "Defender", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "sriram", name: "Sriram Chidambaram", number: 33, position: "Goalkeeper", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "avi", name: "Avi Jaiswa;", number: 17, position: "Defender", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "rev", name: "Revanth Pothana", number: 6, position: "Midfielder", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "varun", name: "Varun Garu", number: 21, position: "Midfielder", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "roger", name: "Roger Freites", number: 9, position: "Forward", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "miles", name: "Miles Rochester", number: 8, position: "Midfielder", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "max", name: "Max Rochester", number: 7, position: "Forward", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "lucas", name: "Lucas Vienne", number: 1, position: "Goalkeeper", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
  { id: "sid", name: "Siddharth Kapoor", number: 99, position: "Goalkeeper", appearances: 0, goals: 0, assists: 0, captain: false, active: true },
];

export const squadIsPlaceholder = false;

export const positionOrder: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export function playersByPosition(position: Position): Player[] {
  return players.filter((p) => p.position === position).sort((a, b) => a.number - b.number);
}

export const featuredPlayers: Player[] = players.slice(0, 6);
