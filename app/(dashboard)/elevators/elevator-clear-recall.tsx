'use client'

import { useActionState } from 'react'
import { clearElevatorRecall } from '@/lib/actions'

type Props = {
  carId: string
  carName: string
}

export function ElevatorClearRecall({ carId, carName }: Props) {
  const [state, formAction, pending] = useActionState(clearElevatorRecall, null)

  const success = state?.success === true
  const error = state?.error ?? null

  if (success) {
    return (
      <p className="text-[12px] text-[#32D74B] mt-4">
        Cleared — {carName} returned to NORMAL
      </p>
    )
  }

  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="carId" value={carId} />
      <button
        type="submit"
        disabled={pending}
        className="text-[13px] font-semibold px-3 py-2 rounded-lg bg-[#32D74B]/10 text-[#32D74B] border border-[#32D74B]/20 transition-colors hover:bg-[#32D74B]/20 disabled:opacity-50"
      >
        {pending ? 'Clearing...' : 'Clear Recall'}
      </button>
      {error && <p className="text-[12px] text-[#FF453A] mt-1">{error}</p>}
    </form>
  )
}
