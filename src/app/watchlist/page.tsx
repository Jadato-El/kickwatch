'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import RatingStars from '@/components/RatingStars'
import WatchlistButton from '@/components/WatchlistButton'

export default function WatchlistPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data: entries } = await supabase
        .from('watchlist')
        .select('match_id, matches(*)')
        .eq('user_id', user.id)

      const list = (entries || [])
        .map((e: any) => e.matches)
        .filter(Boolean)
        .sort((a: any, b: any) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

      setMatches(list)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return null
  if (!userId) return <div className="max-w-2xl mx-auto px-4 py-8">Connecte-toi pour voir ta watchlist.</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-[family-name:var(--font-oswald)] uppercase tracking-wide text-2xl font-semibold mb-6">
        Ma watchlist
      </h1>
      {matches.length === 0 ? (
        <p className="text-sm text-[#7c9188]">Aucun match dans ta watchlist pour l'instant.</p>
      ) : (
        <div className="space-y-2">
          {matches.map((match: any) => (
            <div key={match.id} className="bg-[#14291f] border-l-2 border-[#f5a623]/60 rounded-r p-4">
              <div className="flex justify-between items-start gap-3">
                <span className="font-[family-name:var(--font-oswald)] font-medium text-[15px]">
                  {match.home_team} <span className="text-[#7c9188]">vs</span> {match.away_team}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-sm text-[#f5a623] shrink-0">
                  {new Date(match.match_date).toLocaleString('fr-FR', {
                    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="text-xs text-[#7c9188] mt-1">{match.league}</div>
              <div className="flex justify-between items-center mt-3">
                <RatingStars matchId={match.id} />
                <WatchlistButton matchId={match.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}