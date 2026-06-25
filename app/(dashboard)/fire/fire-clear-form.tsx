'use client'

import { useActionState } from 'react'
import { clearFireAlarm } from '@/lib/actions'

type Props = {
  panelId: string
  panelName: string
}

export function FireClearForm({ panelId, panelName }: Props) {
  const [state, formAction, pending] = useActionState(clearFireAlarm, null)

  const success = state?.success ?? false
  const error = state?.error ?? null

  if (success) {
    return (
      <p className="text-[12px] text-[#32D74B] mt-2">
        Cleared — {panelName} reset to NORMAL
      </p>
    )
  }

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="panelId" value={panelId} />
      <input
        type="text"
        name="comment"
        placeholder="Clear comment (optional)"
        className="w-full bg-[#1C1C1E] border border-[#242427] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#8E8E93] outline-none focus:border-[#0A84FF] transition-colors"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full text-[13px] font-semibold px-3 py-2 rounded-lg bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 transition-colors hover:bg-[#FF453A]/20 disabled:opacity-50"
      >
        {pending ? 'Clearing...' : 'Clear Alarm'}
      </button>
      {error && <p className="text-[12px] text-[#FF453A] mt-1">{error}</p>}
    </form>
  )
}
