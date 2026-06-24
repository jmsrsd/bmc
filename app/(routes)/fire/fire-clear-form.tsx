'use client'

import { useActionState } from 'react'
import { clearFireAlarm } from '@/lib/actions'
import { CheckCircle } from 'lucide-react'

export function FireClearForm({ panelId }: { panelId: string }) {
  const [state, formAction, pending] = useActionState(clearFireAlarm, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="panelId" value={panelId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-status-critical hover:opacity-90 text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle className="w-4 h-4" />
        {pending ? 'Clearing...' : 'Clear Alarm'}
      </button>
      {state?.success && (
        <p className="text-xs text-status-normal mt-1">Alarm cleared</p>
      )}
      {state?.error && (
        <p className="text-xs text-status-critical mt-1">{state.error}</p>
      )}
    </form>
  )
}