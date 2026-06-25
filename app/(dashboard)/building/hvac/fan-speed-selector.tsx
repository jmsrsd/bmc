'use client'

import { useActionState } from 'react'
import { setFanSpeed } from '@/lib/actions'

type Props = {
  zoneId: string
  currentSpeed: string
}

const SPEEDS = ['OFF', 'LOW', 'MEDIUM', 'HIGH', 'AUTO']

export function FanSpeedSelector({ zoneId, currentSpeed }: Props) {
  const [state, formAction, pending] = useActionState(setFanSpeed, null)

  const activeSpeed = state?.speed ?? currentSpeed
  const error = state?.error ?? null

  return (
    <form action={formAction} className="flex flex-wrap gap-1">
      <input type="hidden" name="zoneId" value={zoneId} />
      {SPEEDS.map((speed) => {
        const isActive = activeSpeed === speed
        return (
          <button
            key={speed}
            type="submit"
            name="speed"
            value={speed}
            disabled={pending}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-[#0A84FF] text-white'
                : 'bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#242427] hover:text-white'
              }
              ${pending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {speed}
          </button>
        )
      })}
      {error && <p className="w-full text-[12px] text-[#FF453A] mt-1">{error}</p>}
    </form>
  )
}
