"use client";
import { useState, useEffect } from "react";
import { fetchWorldCupSquad, fetchWorldCupTeams } from "@/lib/football-data";
import DatabaseTable from "@/components/DatabaseTable";
import { FootballDataPlayer, FootballDataTeam } from "@/types/api";

export default function DatabasePage() {
  const [teams, setTeams] = useState<FootballDataTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<FootballDataTeam | null>(null);
  const [players, setPlayers] = useState<FootballDataPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const allTeams = await fetchWorldCupTeams();
      setTeams(allTeams);
    }
    init();
  }, []);

  const handleSelectTeam = async (team: FootballDataTeam) => {
    if (loading) return;
    setLoading(true);
    setSelectedTeam(team);
    try {
      const squad = await fetchWorldCupSquad(team.id);
      setPlayers(squad);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <header>
          <h1 className="text-8xl font-black italic tracking-tighter uppercase leading-[0.8] text-black">
            PANENKA<span className="text-blue-600">.</span>
          </h1>
          <p className="mt-4 text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">
            Core Data Validation Engine
          </p>
        </header>

        {/* Team Selection Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => handleSelectTeam(team)}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                selectedTeam?.id === team.id 
                ? "bg-black border-black text-white shadow-xl scale-110 z-10" 
                : "bg-white border-gray-100 text-gray-900 hover:border-gray-400 shadow-sm"
              }`}
            >
              <img src={team.crest} alt="" className="w-6 h-6 object-contain" />
              <span className="text-[8px] font-black uppercase text-center leading-none">
                {team.tla}
              </span>
            </button>
          ))}
        </div>

        {/* Table Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing...</p>
            </div>
          ) : selectedTeam ? (
            <DatabaseTable players={players} teamName={selectedTeam.name} />
          ) : (
            <div className="flex items-center justify-center py-32 border-4 border-dashed border-gray-200 rounded-[3rem]">
              <p className="text-gray-300 font-black text-2xl uppercase italic tracking-tighter">
                Click a nation to verify squad
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}