'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function RatingStars({ matchId }: { matchId: string }) {
  const [rating, setRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('ratings')
        .select('rating')
        .eq('user_id', user.id)
        .eq('match_id', matchId)
        .maybeSingle()
      setRating(data?.rating ?? null)
      setLoading(false)
    }
    check()
  }, [matchId])

  async function rate(value: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Connecte-toi pour noter ce match')
      return
    }
    await supabase.from('ratings').upsert(
      { user_id: user.id, match_id: matchId, rating: value },
      { onConflict: 'user_id,match_id' }
    )
    setRating(value)
  }

  if (loading) return null

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => rate(star)}
          className={`text-base leading-none transition-colors ${
            rating && star <= rating ? 'text-[#4e9a6b]' : 'text-[#f0ede4]/20 hover:text-[#4e9a6b]/60'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}