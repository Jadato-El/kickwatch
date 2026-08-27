import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '1')
  const startDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  let totalInserted = 0
  const baseDate = new Date(startDate)

  for (let i = 0; i < days; i++) {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]

    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${dateStr}`, {
      headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
    })
    const data = await res.json()

    const matches = (data.response || []).map((fixture: any) => ({
      external_id: fixture.fixture.id.toString(),
      home_team: fixture.teams.home.name,
      away_team: fixture.teams.away.name,
      league: fixture.league.name,
      match_date: fixture.fixture.date,
      status: fixture.fixture.status.short,
      home_score: fixture.goals.home,
      away_score: fixture.goals.away,
    }))

    if (matches.length > 0) {
      const { error } = await supabaseAdmin
        .from('matches')
        .upsert(matches, { onConflict: 'external_id' })
      if (!error) totalInserted += matches.length
    }
  }

  return NextResponse.json({ inserted: totalInserted, days })
}