import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  const BASE_URL = "https://api.football-data.org/v4";

  if (!apiKey) {
    return NextResponse.json({ error: "No API Key Found" }, { status: 500 });
  }

  try {
    const response = await fetch(`${BASE_URL}/teams/${id}`, {
      method: "GET",
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Provider Error" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data.squad || []);
  } catch (error) {
    return NextResponse.json({ error: "Server Crash" }, { status: 500 });
  }
}