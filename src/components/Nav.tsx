'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'

export default function Nav() {
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setLoggedIn(!!user))

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session?.user)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await signOut()
    setLoggedIn(false)
    router.push('/login')
  }

  return (
    <nav className="border-b p-4 flex justify-between items-center max-w-2xl mx-auto">
      <Link href="/" className="font-bold">Kickwatch</Link>
      <div className="flex gap-4 text-sm items-center">
        <Link href="/watchlist">Ma watchlist</Link>
        <Link href="/amis">Amis</Link>
        {loggedIn ? (
          <button onClick={handleLogout} className="border rounded px-3 py-1">
            Se déconnecter
          </button>
        ) : (
          <Link href="/login" className="border rounded px-3 py-1">
            Connexion
          </Link>
        )}
      </div>
    </nav>
  )
}