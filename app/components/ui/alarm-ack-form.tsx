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
        className="px-3 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? '...Acking' : 'Acknowledge'}
      </button>
      {state?.success && <span className="text-xs text-green-400 ml-2">✓</span>}
      {state?.error && <span className="text-xs text-red-400 ml-2">{state.error}</span>}
    </form>
  )
}
