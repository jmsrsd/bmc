'use client'

import { useActionState } from 'react'
import { recallElevator } from '@/lib/actions'
import { ArrowUpFromLine } from 'lucide-react'

export function ElevatorRecallForm({ carId, currentFloor }: { carId: string; currentFloor: number }) {
  const [state, formAction, pending] = useActionState(recallElevator, null)

  return (
    <form action={formAction} className="flex items-center gap-2 flex-1">
      <input type="hidden" name="carId" value={carId} />
      <input
        type="number"
        name="targetFloor"
        defaultValue={currentFloor}
        min={-2}
        max={50}
        className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Floor"
        disabled={pending}
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowUpFromLine className="w-3.5 h-3.5" />
        {pending ? '...' : 'Recall'}
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
