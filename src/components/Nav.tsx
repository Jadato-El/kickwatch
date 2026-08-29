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
    <nav className="border-b border-[#f0ede4]/10 bg-[#0d1f17]/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex flex-wrap justify-between items-center gap-3 px-4 py-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-oswald)] uppercase tracking-wide text-lg font-semibold text-[#f5a623]"
        >
          Kickwatch
        </Link>
        <div className="flex flex-wrap gap-5 text-sm items-center font-[family-name:var(--font-oswald)] uppercase tracking-wide">
          <Link href="/watchlist" className="text-[#f0ede4]/80 hover:text-[#f5a623] transition-colors">
            Ma watchlist
          </Link>
          <Link href="/amis" className="text-[#f0ede4]/80 hover:text-[#f5a623] transition-colors">
            Amis
          </Link>
          {loggedIn ? (
            <button
              onClick={handleLogout}
              className="border border-[#f0ede4]/30 rounded px-3 py-1 text-xs hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
            >
              Se déconnecter
            </button>
          ) : (
            <Link
              href="/login"
              className="border border-[#f5a623] text-[#f5a623] rounded px-3 py-1 text-xs hover:bg-[#f5a623] hover:text-[#0d1f17] transition-colors"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}