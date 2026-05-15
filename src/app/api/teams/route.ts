import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const BASE_URL = "https://api.football-data.org/v4";

  if (!apiKey) {
    return NextResponse.json({ error: "Missing Key" }, { status: 500 });
  }

  try {
    const response = await fetch(`${BASE_URL}/competitions/WC/teams`, {
      method: "GET",
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 86400 } 
    });

    if (!response.ok) {
      return NextResponse.json({ error: "API Failure" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.teams || []);
  } catch (error) {
    return NextResponse.json({ error: "Fetch Error" }, { status: 500 });
  }
}