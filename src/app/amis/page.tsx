'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AmisPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      await loadRequests(user.id)
    }
    load()
  }, [])

  async function loadRequests(uid: string) {
    const { data: incomingRows } = await supabase
      .from('friendships')
      .select('id, user_id')
      .eq('friend_id', uid)
      .eq('status', 'pending')

    const incomingIds = (incomingRows || []).map((r) => r.user_id)
    const { data: incomingProfiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', incomingIds.length ? incomingIds : ['00000000-0000-0000-0000-000000000000'])

    setPending(
      (incomingRows || []).map((r) => ({
        id: r.id,
        email: incomingProfiles?.find((p) => p.id === r.user_id)?.email,
      }))
    )

    const { data: sent } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', uid)
      .eq('status', 'accepted')
    const { data: received } = await supabase
      .from('friendships')
      .select('user_id')
      .eq('friend_id', uid)
      .eq('status', 'accepted')

    const friendIds = [
      ...(sent || []).map((r) => r.friend_id),
      ...(received || []).map((r) => r.user_id),
    ]

    const { data: friendProfiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', friendIds.length ? friendIds : ['00000000-0000-0000-0000-000000000000'])

    setFriends(friendProfiles || [])

    if (friendIds.length > 0) {
      const { data: ratings } = await supabase
        .from('ratings')
        .select('id, user_id, rating, comment, created_at, matches(home_team, away_team, match_date, league)')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(20)

      setActivity(
        (ratings || []).map((r: any) => ({
          ...r,
          email: friendProfiles?.find((p) => p.id === r.user_id)?.email,
        }))
      )
    } else {
      setActivity([])
    }
  }

  async function sendRequest() {
    if (!userId) return
    setMessage('')

    const { data: target } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (!target) {
      setMessage("Aucun utilisateur trouvé avec cet email.")
      return
    }
    if (target.id === userId) {
      setMessage("Tu ne peux pas t'ajouter toi-même.")
      return
    }

    const { error } = await supabase
      .from('friendships')
      .insert({ user_id: userId, friend_id: target.id, status: 'pending' })

    if (error) setMessage("Erreur : " + error.message)
    else setMessage("Demande envoyée !")
    setEmail('')
  }

  async function respond(requestId: string, accept: boolean) {
    if (accept) {
      await supabase.from('friendships').update({ status: 'accepted' }).eq('id', requestId)
    } else {
      await supabase.from('friendships').delete().eq('id', requestId)
    }
    if (userId) loadRequests(userId)
  }

  const inputClass =
    'flex-1 bg-[#14291f] border border-[#f0ede4]/15 rounded px-3 py-2 text-sm placeholder:text-[#7c9188] focus:outline-none focus:border-[#f5a623] transition-colors'
  const sectionTitle = 'font-[family-name:var(--font-oswald)] uppercase tracking-wide text-sm text-[#7c9188] mb-3'
  const card = 'bg-[#14291f] border-l-2 border-[#f0ede4]/10 rounded-r p-3'

  if (!userId) return <div className="max-w-2xl mx-auto px-4 py-8">Connecte-toi pour voir tes amis.</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <h1 className="font-[family-name:var(--font-oswald)] uppercase tracking-wide text-2xl font-semibold">Amis</h1>

      <div>
        <h2 className={sectionTitle}>Ajouter un ami</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email de ton ami"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={sendRequest}
            className="bg-[#f5a623] text-[#0d1f17] font-medium rounded px-4 text-sm hover:bg-[#f5a623]/90 transition-colors"
          >
            Envoyer
          </button>
        </div>
        {message && <p className="text-sm mt-2 text-[#7c9188]">{message}</p>}
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className={sectionTitle}>Demandes reçues</h2>
          <div className="space-y-2">
            {pending.map((req) => (
              <div key={req.id} className={`${card} flex justify-between items-center`}>
                <span className="text-sm">{req.email}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(req.id, true)}
                    className="text-xs uppercase tracking-wide bg-[#f5a623] text-[#0d1f17] font-medium rounded-full px-3 py-1"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => respond(req.id, false)}
                    className="text-xs uppercase tracking-wide border border-[#f0ede4]/25 text-[#f0ede4]/70 rounded-full px-3 py-1 hover:border-[#f5a623] hover:text-[#f5a623]"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className={sectionTitle}>Tes amis</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-[#7c9188]">Pas encore d'amis.</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.id} className={`${card} text-sm`}>{f.email}</div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className={sectionTitle}>Activité de tes amis</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-[#7c9188]">Aucun de tes amis n'a encore noté de match.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((a) => (
              <div key={a.id} className={card}>
                <div className="text-xs text-[#7c9188] mb-1">{a.email}</div>
                <div className="font-[family-name:var(--font-oswald)] font-medium text-[15px]">
                  {a.matches.home_team} <span className="text-[#7c9188]">vs</span> {a.matches.away_team}
                </div>
                <div className="text-[#4e9a6b] mt-1">
                  {'★'.repeat(a.rating)}
                  <span className="text-[#f0ede4]/15">{'★'.repeat(5 - a.rating)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}