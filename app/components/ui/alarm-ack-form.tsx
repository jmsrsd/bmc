'use client'

import { useActionState } from 'react'
import { acknowledgeAlarm } from '@/lib/actions'

interface AlarmAckFormProps {
  alarmId: string
}

export function AlarmAckForm({ alarmId }: AlarmAckFormProps) {
  const [state, formAction, pending] = useActionState(acknowledgeAlarm, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="alarmId" value={alarmId} />
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1 text-xs font-medium bg-status-active hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? '...Acking' : 'Acknowledge'}
      </button>
      {state?.success && <span className="text-xs text-status-normal ml-2">✓</span>}
      {state?.error && <span className="text-xs text-status-critical ml-2">{state.error}</span>}
    </form>
  )
}