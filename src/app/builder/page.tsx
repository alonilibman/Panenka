"use client";
import { useState, useEffect, useMemo } from "react";
import { fetchWorldCupSquad, fetchWorldCupTeams } from "@/lib/football-data";
import { FootballDataPlayer, FootballDataTeam, SquadSlot, PositionKey } from "@/types/api";

type FormationType = "4-4-2" | "4-3-3" | "3-5-2" | "5-3-2" | "3-4-3" | "4-5-1" | "5-4-1";

const getCategory = (pos: string): PositionKey => {
  const p = pos?.toLowerCase() || "";
  if (p.includes("goalkeeper")) return "GK";
  if (p.includes("offence") || p.includes("forward") || p.includes("attacker") || p.includes("winger") || p.includes("striker")) return "ATT";
  if (p.includes("midfield")) return "MID";
  return "DEF";
};

export default function BuilderPage() {
  const [squad, setSquad] = useState<SquadSlot[]>([]);
  const [teams, setTeams] = useState<FootballDataTeam[]>([]);
  const [marketCache, setMarketCache] = useState<Record<number, FootballDataPlayer[]>>({});
  
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const [formation, setFormation] = useState<FormationType>("4-4-2");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const slots: SquadSlot[] = [
      ...Array(2).fill(0).map((_, i) => ({ id: `GK-${i}`, position: "GK" as PositionKey, player: null, isStarter: i === 0 })),
      ...Array(5).fill(0).map((_, i) => ({ id: `DEF-${i}`, position: "DEF" as PositionKey, player: null, isStarter: false })),
      ...Array(5).fill(0).map((_, i) => ({ id: `MID-${i}`, position: "MID" as PositionKey, player: null, isStarter: false })),
      ...Array(3).fill(0).map((_, i) => ({ id: `ATT-${i}`, position: "ATT" as PositionKey, player: null, isStarter: false })),
    ];
    setSquad(slots);
    fetchWorldCupTeams().then(setTeams);
  }, []);

  useEffect(() => {
    const [d, m, a] = formation.split("-").map(Number);
    setSquad(prev => prev.map(slot => {
      const idx = parseInt(slot.id.split("-")[1]);
      let isStarter = false;
      if (slot.position === "GK" && idx === 0) isStarter = true;
      if (slot.position === "DEF" && idx < d) isStarter = true;
      if (slot.position === "MID" && idx < m) isStarter = true;
      if (slot.position === "ATT" && idx < a) isStarter = true;
      return { ...slot, isStarter };
    }));
  }, [formation]);

  const stats = useMemo(() => {
    const players = squad.filter(s => s.player).map(s => s.player!);
    const totalSpent = players.reduce((sum, p) => sum + p.price, 0);
    const nationCounts: Record<string, number> = {};
    players.forEach(p => nationCounts[p.nationality] = (nationCounts[p.nationality] || 0) + 1);
    return { totalSpent, nationCounts };
  }, [squad]);

  const globalPool = useMemo(() => Object.values(marketCache).flat(), [marketCache]);
  const activeSlot = squad.find(s => s.id === activeSlotId);

  const filteredMarket = useMemo(() => {
    if (!activeSlot) return [];
    return globalPool.filter(p => {
      const cat = getCategory(p.position);
      const matchesPos = cat === activeSlot.position;
      const matchesNation = selectedNation ? p.nationality === selectedNation : true;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesPos && matchesNation && matchesSearch;
    }).sort((a, b) => b.price - a.price);
  }, [globalPool, activeSlot, selectedNation, searchTerm]);

  const addPlayer = (player: any) => {
    if (squad.some(s => s.player?.id === player.id)) return alert("DUPLICATE");
    if ((stats.nationCounts[player.nationality] || 0) >= 3) return alert("NATION CAP (3)");
    if (stats.totalSpent + player.price > 100) return alert("BUDGET EXCEEDED");
    setSquad(prev => prev.map(s => s.id === activeSlotId ? { ...s, player } : s));
    setActiveSlotId(null);
  };

  return (
    <main className="h-screen bg-black text-white p-4 font-['Outfit'] flex gap-6 overflow-hidden">
      
      {/* SCOUT SIDEBAR */}
      <aside className="w-[380px] bg-[#111] rounded-[2.5rem] p-6 border border-white/10 flex flex-col gap-4 flex-shrink-0">
        <h2 className="text-4xl font-black italic text-blue-600 uppercase tracking-tighter">Scout</h2>
        <input type="text" placeholder="Search..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}}
               className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold outline-none" />
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => {setSelectedNation(null); setCurrentPage(1);}} className={`px-4 py-2 rounded-xl text-[10px] font-black border ${!selectedNation ? 'bg-blue-600 border-blue-600' : 'border-white/10 text-gray-500'}`}>Any</button>
          {teams.map(t => (
            <button key={t.id} onClick={() => { setSelectedNation(t.name); fetchWorldCupSquad(t.id).then(d => setMarketCache(prev => ({...prev, [t.id]: d}))); }}
                    className={`flex-shrink-0 w-10 h-10 p-2 rounded-xl border ${selectedNation === t.name ? 'bg-blue-600 border-blue-600' : 'bg-white/5 border-white/10'}`}>
              <img src={t.crest} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {activeSlotId ? filteredMarket.slice((currentPage-1)*8, currentPage*8).map(p => (
            <button key={p.id} onClick={() => addPlayer(p)} className="w-full bg-white/5 p-4 rounded-[1.5rem] flex items-center justify-between hover:bg-blue-600 group transition-all">
              <div className="flex items-center gap-3 text-left">
                <img src={p.nationCrest} className="w-6 h-6 object-contain" alt="" />
                <div><p className="font-bold text-sm leading-none">{p.name}</p><p className="text-[9px] font-black opacity-40 uppercase">{p.nationality}</p></div>
              </div>
              <span className="font-mono font-black text-blue-500 group-hover:text-white">${p.price}M</span>
            </button>
          )) : <div className="h-full flex items-center justify-center opacity-20 text-[10px] font-black text-center p-10 uppercase tracking-widest">Select position</div>}
        </div>

        {filteredMarket.length > 8 && (
          <div className="flex justify-center gap-1.5 pt-2 border-t border-white/5">
             {Array.from({ length: Math.ceil(filteredMarket.length / 8) }).map((_, i) => (
               <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-7 h-7 rounded-lg text-[10px] font-black ${currentPage === i+1 ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'}`}>{i+1}</button>
             ))}
          </div>
        )}
      </aside>

      {/* FIELD VIEW */}
      <section className="flex-1 flex flex-col gap-4 h-full min-w-[800px]">
        <div className="flex-[6] bg-[#1a3a1a] rounded-[3.5rem] border-[10px] border-white/10 relative flex flex-col p-6 overflow-hidden shadow-2xl">
          {/* Pitch Lines */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: `repeating-linear-gradient(90deg, #1a3a1a, #1a3a1a 10%, #204420 10%, #204420 20%)` }}>
            <div className="absolute inset-6 border-2 border-white/20 rounded-[2rem]" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/20 rounded-full" />
          </div>
          
          <div className="absolute top-6 left-8 z-20">
            <div className="flex gap-1.5 bg-black/40 backdrop-blur-md p-1 rounded-xl">
              {["4-4-2", "4-3-3", "3-5-2", "5-3-2", "5-4-1", "3-4-3"].map(f => (
                <button key={f} onClick={() => setFormation(f as any)} className={`px-2 py-1 rounded-lg text-[9px] font-black ${formation === f ? 'bg-white text-black' : 'text-white/40'}`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="absolute top-6 right-8 text-right z-20">
            <p className={`text-5xl font-black italic tracking-tighter ${stats.totalSpent > 100 ? 'text-red-500' : 'text-white'}`}>${(100 - stats.totalSpent).toFixed(1)}M</p>
          </div>

          {/* PLAYER GRID */}
          <div className="relative z-10 flex-1 flex flex-col justify-between py-6">
            {["ATT", "MID", "DEF", "GK"].map(pos => (
              <div key={pos} className="flex justify-center items-center gap-10">
                {squad.filter(s => s.position === pos && s.isStarter).map(slot => (
                  <button key={slot.id} onClick={() => slot.player ? setSquad(prev => prev.map(s => s.id === slot.id ? {...s, player: null} : s)) : setActiveSlotId(slot.id)}
                          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 flex flex-col items-center justify-center transition-all ${slot.player ? 'bg-white border-white scale-110 shadow-xl text-black' : activeSlotId === slot.id ? 'bg-blue-600 border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.4)]' : 'border-white/20 bg-black/20 hover:border-white/40'}`}>
                    {slot.player ? (
                      <div className="text-center px-1">
                        <p className="text-[9px] font-black uppercase leading-none truncate w-16 mx-auto">{slot.player.name.split(' ').pop()}</p>
                        <p className="text-[8px] font-bold text-blue-600 mt-0.5">${slot.player.price}M</p>
                        <img src={slot.player.nationCrest} className="w-4 h-4 mx-auto mt-1" alt="" />
                      </div>
                    ) : <span className="text-[9px] font-black text-white/20">{slot.position}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* SUBS SECTION - Fixed Visibility */}
        <div className="flex-1 max-h-24 bg-[#333] rounded-[2.5rem] border-2 border-white/40 p-4 flex items-center justify-center gap-5 shadow-2xl">
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 -rotate-90">Subs</p>
           {squad.filter(s => !s.isStarter).map(slot => (
             <button key={slot.id} onClick={() => slot.player ? setSquad(prev => prev.map(s => s.id === slot.id ? {...s, player: null} : s)) : setActiveSlotId(slot.id)}
                     className={`w-14 h-14 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${slot.player ? 'bg-gray-800 border-white shadow-lg' : 'border-white/20 border-dashed bg-black/40 hover:bg-black/60'}`}>
                {slot.player ? (
                  <div className="text-center">
                    <p className="text-[8px] font-black uppercase truncate w-12 text-white">{slot.player.name.split(' ').pop()}</p>
                    <img src={slot.player.nationCrest} className="w-3 h-3 mx-auto mt-1" alt="" />
                  </div>
                ) : <span className="text-[7px] font-black text-white/30">{slot.position}</span>}
             </button>
           ))}
        </div>
      </section>
    </main>
  );
}