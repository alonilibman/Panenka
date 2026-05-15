"use client";
import { useState, useMemo } from "react";
import { FootballDataPlayer } from "@/types/api";

interface DatabaseTableProps {
  players: FootballDataPlayer[];
  teamName: string;
}

/**
 * THE STRICT MAPPING ENGINE
 * Forces everything into: GK, DEF, MID, ATT
 */
const formatPosition = (pos: string) => {
  if (!pos) return "N/A";
  const p = pos.toLowerCase();

  if (p.includes("goalkeeper")) return "GK";
  
  if (p.includes("back") || p.includes("defender")) return "DEF";
  
  if (p.includes("midfield")) return "MID";
  
  if (
    p.includes("forward") || 
    p.includes("winger") || 
    p.includes("striker") || 
    p.includes("attacker") || 
    p.includes("offence")
  ) {
    return "ATT";
  }

  // Fallback for anything else (rare with this API)
  return "MID"; 
};

export default function DatabaseTable({ players, teamName }: DatabaseTableProps) {
  const [search, setSearch] = useState("");

  const filteredPlayers = useMemo(() => {
    return players.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [players, search]);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-end bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-black">
            {teamName}
          </h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            {players.length} Data Points Verified
          </p>
        </div>
        <input
          type="text"
          placeholder="Search Squad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black font-bold uppercase text-xs"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="p-6">Player Identity</th>
              <th className="p-6">Position</th>
              <th className="p-6">Nationality</th>
              <th className="p-6 text-right">API_ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-bold">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-6 flex items-center gap-4">
                    {/* Minimal Face Icon */}
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-gray-900 text-lg tracking-tight">
                      {player.name}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className="bg-black text-white px-4 py-2 rounded-md text-[11px] font-black italic tracking-[0.1em]">
                      {formatPosition(player.position)}
                    </span>
                  </td>
                  <td className="p-6 text-gray-500 text-sm uppercase tracking-wide">
                    {player.nationality}
                  </td>
                  <td className="p-6 text-right font-mono text-[10px] text-gray-300">
                    {player.id}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-20 text-center text-gray-200 font-black uppercase italic text-2xl">
                  Roster Empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}