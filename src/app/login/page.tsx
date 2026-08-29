'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSignIn() {
    const { error } = await signIn(email, password)
    if (error) setError(error.message)
    else router.push('/')
  }

  async function handleSignUp() {
    const { error } = await signUp(email, password)
    if (error) setError(error.message)
    else setError('Compte créé ! Vérifie tes emails pour confirmer.')
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-5">
        <h1 className="font-[family-name:var(--font-oswald)] uppercase tracking-wide text-2xl font-semibold text-center">
          Kickwatch
        </h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#14291f] border border-[#f0ede4]/15 rounded px-3 py-2 text-sm placeholder:text-[#7c9188] focus:outline-none focus:border-[#f5a623] transition-colors"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-[#14291f] border border-[#f0ede4]/15 rounded px-3 py-2 text-sm placeholder:text-[#7c9188] focus:outline-none focus:border-[#f5a623] transition-colors"
        />
        {error && <p className="text-[#e07a5f] text-sm">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSignIn}
            className="flex-1 bg-[#f5a623] text-[#0d1f17] font-medium rounded py-2 text-sm hover:bg-[#f5a623]/90 transition-colors"
          >
            Se connecter
          </button>
          <button
            onClick={handleSignUp}
            className="flex-1 border border-[#f0ede4]/25 rounded py-2 text-sm hover:border-[#f5a623] hover:text-[#f5a623] transition-colors"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  )
}