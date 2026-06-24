'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const { message } = await res.json()
        setError(message || 'Invalid password')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-canvas px-4">
      <div className="w-full max-w-sm bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
          BMC
        </h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Building Management Control
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter demo password"
              className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border-hairline text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-status-active focus:border-transparent"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-status-critical bg-status-critical/20 border border-status-critical/40 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2 px-4 rounded-lg bg-status-active hover:opacity-90 text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}