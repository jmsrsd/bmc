'use client'

import { useActionState } from 'react'
import { clearElevatorRecall } from '@/lib/actions'
import { X } from 'lucide-react'

export function ElevatorClearRecallButton({ carId }: { carId: string }) {
  const [state, formAction, pending] = useActionState(clearElevatorRecall, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="carId" value={carId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-status-warning hover:opacity-90 text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <X className="w-3.5 h-3.5" />
        {pending ? '...' : 'Clear Recall'}
      </button>
      {state?.success && (
        <span className="text-xs text-status-normal">✓</span>
      )}
      {state?.error && (
        <span className="text-xs text-status-critical">{state.error}</span>
      )}
    </form>
  )
}