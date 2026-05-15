export interface FootballDataPlayer {
  id: number;
  name: string;
  position: string;
  nationality: string;
}

export interface FootballDataTeam {
  id: number;
  name: string;
  tla: string;
  crest: string;
  squad: FootballDataPlayer[];
}