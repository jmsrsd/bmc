'use client'

import { useActionState } from 'react'
import { acknowledgeAlarm } from '@/lib/actions'

type Props = {
  alarmId: string
}

export function AckButton({ alarmId }: Props) {
  const [state, formAction, pending] = useActionState(acknowledgeAlarm, null)

  const acknowledged = state?.success === true
  const error = state?.error ?? null

  if (acknowledged) {
    return (
      <span className="text-[12px] text-secondary">Acknowledged</span>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="alarmId" value={alarmId} />
      <input type="hidden" name="comment" value="" />
      <button
        type="submit"
        disabled={pending}
        className="text-[13px] font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-50 bg-active/10 text-active"
      >
        {pending ? '...' : 'Acknowledge'}
      </button>
      {error && <p className="text-[12px] text-critical mt-1">{error}</p>}
    </form>
  )
}
