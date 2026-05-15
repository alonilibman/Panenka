import { FootballDataPlayer, FootballDataTeam } from "@/types/api";

export async function fetchWorldCupTeams(): Promise<FootballDataTeam[]> {
  try {
    const response = await fetch("/api/teams");
    if (!response.ok) throw new Error("Teams Error");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchWorldCupSquad(teamId: number): Promise<FootballDataPlayer[]> {
  try {
    const response = await fetch(`/api/squad/${teamId}`);
    if (!response.ok) throw new Error("Squad Error");
    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}