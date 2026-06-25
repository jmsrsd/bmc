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
      <span className="text-[12px] text-[#8E8E93]">Acknowledged</span>
    )
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="alarmId" value={alarmId} />
      <input type="hidden" name="comment" value="" />
      <button
        type="submit"
        disabled={pending}
        className="text-[13px] font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-50 bg-[#0A84FF]/10 text-[#0A84FF]"
      >
        {pending ? '...' : 'Acknowledge'}
      </button>
      {error && <p className="text-[12px] text-[#FF453A] mt-1">{error}</p>}
    </form>
  )
}
