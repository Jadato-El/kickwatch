import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '7')
  const startDate = searchParams.get('date') || new Date().toISOString().split('T')[0]

  const from = new Date(startDate)
  const to = new Date(from)
  to.setDate(to.getDate() + days - 1)

  const dateFrom = from.toISOString().split('T')[0]
  const dateTo = to.toISOString().split('T')[0]

  const res = await fetch(
    `https://api.football-data.org/v4/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
    { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! } }
  )
  const data = await res.json()

  if (!data.matches) {
    return NextResponse.json({ error: data.message || 'Erreur API', inserted: 0 }, { status: 500 })
  }

  const matches = data.matches.map((m: any) => ({
    external_id: `fd-${m.id}`,
    home_team: m.homeTeam.name,
    away_team: m.awayTeam.name,
    league: m.competition.name,
    match_date: m.utcDate,
    status: m.status,
    home_score: m.score?.fullTime?.home ?? null,
    away_score: m.score?.fullTime?.away ?? null,
  }))

  const { error } = await supabaseAdmin
    .from('matches')
    .upsert(matches, { onConflict: 'external_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ inserted: matches.length })
}