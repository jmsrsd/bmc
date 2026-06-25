'use client'

import { useActionState } from 'react'
import { recallElevator } from '@/lib/actions'

type Props = {
  carId: string
  currentFloor: number
  carName: string
}

export function ElevatorRecallForm({ carId, currentFloor, carName }: Props) {
  const [state, formAction, pending] = useActionState(recallElevator, null)

  const error = state?.error ?? null

  return (
    <form action={formAction} className="mt-4 space-y-2">
      <input type="hidden" name="carId" value={carId} />
      <div className="flex items-center gap-2">
        <input
          type="number"
          name="targetFloor"
          defaultValue={currentFloor}
          min={-2}
          max={50}
          className="w-20 bg-[#1C1C1E] border border-[#242427] rounded-lg px-3 py-2 text-[13px] text-white placeholder-[#8E8E93] outline-none focus:border-[#0A84FF] transition-colors"
        />
        <button
          type="submit"
          disabled={pending}
          className="text-[13px] font-semibold px-3 py-2 rounded-lg bg-[#FF9F0A]/10 text-[#FF9F0A] border border-[#FF9F0A]/20 transition-colors hover:bg-[#FF9F0A]/20 disabled:opacity-50"
        >
          {pending ? 'Recalling...' : 'Recall'}
        </button>
      </div>
      {error && <p className="text-[12px] text-[#FF453A] mt-1">{error}</p>}
    </form>
  )
}
