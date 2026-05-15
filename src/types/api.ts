export type PositionKey = "GK" | "DEF" | "MID" | "ATT";

export interface FootballDataPlayer {
  id: number;
  name: string;
  position: string;
  nationality: string;
  nationCrest: string; 
  price: number; 
}

export interface FootballDataTeam {
  id: number;
  name: string;
  tla: string;
  crest: string;
  squad: FootballDataPlayer[];
}

export interface SquadSlot {
  id: string;
  position: PositionKey;
  player: FootballDataPlayer | null;
  isStarter: boolean;
}