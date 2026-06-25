'use client'

import { useActionState } from 'react'
import { setHvacMode } from '@/lib/actions'

type Props = {
  zoneId: string
  currentMode: string
}

const MODES = ['COOL', 'HEAT', 'AUTO', 'VENT']

export function ModeSwitcher({ zoneId, currentMode }: Props) {
  const [state, formAction, pending] = useActionState(setHvacMode, null)

  const activeMode = state?.mode ?? currentMode
  const error = state?.error ?? null

  return (
    <form action={formAction} className="flex flex-wrap gap-1">
      <input type="hidden" name="zoneId" value={zoneId} />
      {MODES.map((mode) => {
        const isActive = activeMode === mode
        return (
          <button
            key={mode}
            type="submit"
            name="mode"
            value={mode}
            disabled={pending}
            className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors
              ${isActive
                ? 'bg-[#0A84FF] text-white'
                : 'bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#242427] hover:text-white'
              }
              ${pending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {mode}
          </button>
        )
      })}
      {error && <p className="w-full text-[12px] text-[#FF453A] mt-1">{error}</p>}
    </form>
  )
}
