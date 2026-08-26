import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
  })
  const data = await res.json()

  const matches = data.response.map((fixture: any) => ({
    external_id: fixture.fixture.id.toString(),
    home_team: fixture.teams.home.name,
    away_team: fixture.teams.away.name,
    league: fixture.league.name,
    match_date: fixture.fixture.date,
    status: fixture.fixture.status.short,
    home_score: fixture.goals.home,
    away_score: fixture.goals.away,
  }))

  const { error } = await supabaseAdmin
    .from('matches')
    .upsert(matches, { onConflict: 'external_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ inserted: matches.length })
}