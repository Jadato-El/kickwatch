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
    <button onClick={toggle} className="text-sm px-3 py-1 rounded border">
      {inWatchlist ? '✓ Dans ma watchlist' : '+ Ajouter à ma watchlist'}
    </button>
  )
}