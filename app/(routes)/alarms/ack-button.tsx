'use client'

import { useActionState } from 'react'
import { acknowledgeAlarm } from '@/lib/actions'
import { Check } from 'lucide-react'

export function AcknowledgeButton({ alarmId }: { alarmId: string }) {
  const [state, formAction, pending] = useActionState(acknowledgeAlarm, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="alarmId" value={alarmId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-status-active hover:opacity-90 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        <Check className="h-3.5 w-3.5" />
        {pending ? 'Acknowledging...' : 'Acknowledge'}
      </button>
      {state?.success && (
        <p className="text-xs text-status-normal mt-1">Acknowledged</p>
      )}
      {state?.error && (
        <p className="text-xs text-status-critical mt-1">{state.error}</p>
      )}
    </form>
  )
}