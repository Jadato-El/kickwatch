import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET() {
  const now = new Date()
  const in90min = new Date(now.getTime() + 90 * 60 * 1000)

  const { data: entries, error } = await supabaseAdmin
    .from('watchlist')
    .select('id, user_id, matches(home_team, away_team, match_date, league)')
    .eq('notify', true)
    .eq('notified', false)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const toNotify = (entries || []).filter((e: any) => {
    const matchDate = new Date(e.matches.match_date)
    return matchDate > now && matchDate <= in90min
  })

  if (toNotify.length === 0) return NextResponse.json({ sent: 0 })

  const userIds = toNotify.map((e: any) => e.user_id)
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .in('id', userIds)

  let sent = 0
  for (const entry of toNotify as any[]) {
    const email = profiles?.find((p) => p.id === entry.user_id)?.email
    if (!email) continue

    await resend.emails.send({
      from: 'Kickwatch <onboarding@resend.dev>',
      to: email,
      subject: `⚽ ${entry.matches.home_team} vs ${entry.matches.away_team} commence bientôt`,
      html: `<p>${entry.matches.home_team} vs ${entry.matches.away_team} (${entry.matches.league}) commence à ${new Date(entry.matches.match_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>`,
    })

    await supabaseAdmin.from('watchlist').update({ notified: true }).eq('id', entry.id)
    sent++
  }

  return NextResponse.json({ sent })
}