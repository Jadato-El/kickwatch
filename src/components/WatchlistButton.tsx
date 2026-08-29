'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function WatchlistButton({ matchId }: { matchId: string }) {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('match_id', matchId)
        .maybeSingle()
      setInWatchlist(!!data)
      setLoading(false)
    }
    check()
  }, [matchId])

  async function toggle() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Connecte-toi pour ajouter à ta watchlist')
      return
    }
    if (inWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('match_id', matchId)
      setInWatchlist(false)
    } else {
      await supabase.from('watchlist').insert({ user_id: user.id, match_id: matchId })
      setInWatchlist(true)
    }
  }

  if (loading) return null

  return (
    <button
      onClick={toggle}
      className={`text-xs uppercase tracking-wide font-[family-name:var(--font-oswald)] px-3 py-1.5 rounded-full border transition-colors ${
        inWatchlist
          ? 'bg-[#f5a623] border-[#f5a623] text-[#0d1f17] font-semibold'
          : 'border-[#f0ede4]/25 text-[#f0ede4]/70 hover:border-[#f5a623] hover:text-[#f5a623]'
      }`}
    >
      {inWatchlist ? '★ Dans ma watchlist' : '+ Watchlist'}
    </button>
  )
}