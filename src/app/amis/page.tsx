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

  if (!userId) return <div className="p-8">Connecte-toi pour voir tes amis.</div>

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-2xl font-bold">Amis</h1>

      <div>
        <h2 className="font-semibold mb-2">Ajouter un ami</h2>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email de ton ami"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 border rounded p-2"
          />
          <button onClick={sendRequest} className="bg-black text-white rounded px-4">
            Envoyer
          </button>
        </div>
        {message && <p className="text-sm mt-2">{message}</p>}
      </div>

      {pending.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Demandes reçues</h2>
          <div className="space-y-2">
            {pending.map((req) => (
              <div key={req.id} className="flex justify-between items-center border rounded p-3">
                <span>{req.email}</span>
                <div className="flex gap-2">
                  <button onClick={() => respond(req.id, true)} className="text-sm bg-black text-white rounded px-3 py-1">
                    Accepter
                  </button>
                  <button onClick={() => respond(req.id, false)} className="text-sm border rounded px-3 py-1">
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2">Tes amis</h2>
        {friends.length === 0 ? (
          <p className="text-sm text-gray-500">Pas encore d'amis.</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => (
              <div key={f.id} className="border rounded p-3">{f.email}</div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-semibold mb-2">Activité de tes amis</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun de tes amis n'a encore noté de match.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((a) => (
              <div key={a.id} className="border rounded p-3">
                <div className="text-sm text-gray-500">{a.email}</div>
                <div className="font-medium">
                  {a.matches.home_team} vs {a.matches.away_team}
                </div>
                <div className="text-yellow-500">{'★'.repeat(a.rating)}{'☆'.repeat(5 - a.rating)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}