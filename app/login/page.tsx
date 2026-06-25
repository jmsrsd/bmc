'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

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
        router.push('/building')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.message || 'Invalid password')
      }
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-8 w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-[24px] font-semibold text-white tracking-[-0.02em]">
          BMC
        </h1>
        <p className="text-[14px] font-medium text-[#8E8E93] mt-1">
          Biomedical Campus
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-3 py-2.5 bg-[#1C1C1E] border border-[#242427] rounded-lg text-[14px] text-white placeholder-[#8E8E93] focus:outline-none focus:border-[#0A84FF] transition-colors"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-[12px] text-[#FF453A]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-2.5 bg-[#0A84FF] text-white text-[14px] font-medium rounded-lg hover:bg-[#0A84FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          <ArrowRight size={16} />
        </button>
      </form>
    </div>
  )
}
