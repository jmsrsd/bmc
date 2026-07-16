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
      <p className="text-[12px] text-normal mt-2">
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
        className="w-full bg-elevated border border-hairline rounded-lg px-3 py-2 text-[13px] text-white placeholder-secondary outline-none focus:border-active transition-colors"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full text-[13px] font-semibold px-3 py-2 rounded-lg bg-critical/10 text-critical border border-critical/20 transition-colors hover:bg-critical/20 disabled:opacity-50"
      >
        {pending ? 'Clearing...' : 'Clear Alarm'}
      </button>
      {error && <p className="text-[12px] text-critical mt-1">{error}</p>}
    </form>
  )
}
