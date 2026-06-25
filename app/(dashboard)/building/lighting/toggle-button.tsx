'use client'

import { useActionState } from 'react'
import { toggleLight } from '@/lib/actions'

type Props = {
  zoneId: string
  currentState: string
}

export function ToggleButton({ zoneId, currentState }: Props) {
  const [state, formAction, pending] = useActionState(toggleLight, null)

  const isOn = (state?.state ?? currentState) === 'ON'
  const error = state?.error ?? null

  const nextState = isOn ? 'OFF' : 'ON'

  return (
    <form action={formAction}>
      <input type="hidden" name="zoneId" value={zoneId} />
      <input type="hidden" name="newState" value={nextState} />
      <button
        type="submit"
        disabled={pending}
        className="text-[13px] font-semibold px-3 py-1 rounded-lg border transition-colors disabled:opacity-50"
        style={{
          color: isOn ? '#32D74B' : '#AEAEB2',
          borderColor: isOn ? '#32D74B' : '#AEAEB2',
          backgroundColor: isOn ? 'rgba(50,215,75,0.08)' : 'rgba(174,174,178,0.08)',
        }}
      >
        {pending ? '...' : isOn ? 'ON' : 'OFF'}
      </button>
      {error && <p className="text-[12px] text-[#FF453A] mt-1">{error}</p>}
    </form>
  )
}
