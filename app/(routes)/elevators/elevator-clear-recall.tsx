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
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <X className="w-3.5 h-3.5" />
        {pending ? '...' : 'Clear Recall'}
      </button>
      {state?.success && (
        <span className="text-xs text-green-400">✓</span>
      )}
      {state?.error && (
        <span className="text-xs text-red-400">{state.error}</span>
      )}
    </form>
  )
}
