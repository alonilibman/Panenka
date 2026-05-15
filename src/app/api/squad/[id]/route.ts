import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  try {
    const response = await fetch(`https://api.football-data.org/v4/teams/${id}`, {
      headers: { "X-Auth-Token": apiKey || "" },
      next: { revalidate: 3600 }
    });

    const data = await response.json();
    const nation = data.name;
    const crest = data.crest;

    // TIER SYSTEM
    const tier1 = ["France", "Argentina", "England", "Brazil", "Portugal", "Spain", "Germany", "Netherlands"];
    const tier2 = ["Italy", "Belgium", "Uruguay", "Morocco", "USA", "Japan", "Colombia", "Australia"];
    
    const nationBase = tier1.includes(nation) ? 9.5 : tier2.includes(nation) ? 7.5 : 5.0;

    const squad = (data.squad || []).map((player: any) => {
      const pos = player.position?.toLowerCase() || "";
      const name = player.name.toLowerCase();
      
      // 1. POSITION MULTIPLIER (Fixed Mapping)
      let mult = 1.0;
      if (pos.includes("goalkeeper")) mult = 0.8;
      else if (pos.includes("defen") || pos.includes("back")) mult = 1.0;
      else if (pos.includes("midfield")) mult = 1.25;
      else if (pos.includes("offence") || pos.includes("forward") || pos.includes("attacker") || pos.includes("winger") || pos.includes("striker")) mult = 1.5;

      // 2. STAR TAX
      const stars = ["haaland", "mbappé", "bellingham", "vinícius", "foden", "yamal", "saka", "musiala", "kane", "wirtz"];
      let bonus = stars.some(s => name.includes(s)) ? 5.5 : 0;

      return {
        ...player,
        price: parseFloat(Math.min((nationBase * mult) + bonus, 15.0).toFixed(1)),
        nationality: nation,
        nationCrest: crest
      };
    });

    return NextResponse.json(squad);
  } catch (error) {
    return NextResponse.json({ error: "Fail" }, { status: 500 });
  }
}