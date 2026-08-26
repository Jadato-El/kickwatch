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
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">Kickwatch</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleSignIn} className="flex-1 bg-black text-white rounded p-2">
            Se connecter
          </button>
          <button onClick={handleSignUp} className="flex-1 border rounded p-2">
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  )
}