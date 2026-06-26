'use client'

import { useActionState } from 'react'
import { setDimLevel, toggleLight } from '@/lib/actions'
import { Slider } from '@/components/ui/slider'

type Props = {
  zoneId: string
  initialDim: number
  initialState: string
}

export function LightingControls({ zoneId, initialDim, initialState }: Props) {
  const [dimState, dimAction, dimPending] = useActionState(setDimLevel, null)
  const [toggleState, toggleAction, togglePending] = useActionState(toggleLight, null)

  const dimLevel = dimState?.level ?? initialDim
  const isOn = (toggleState?.state ?? initialState) === 'ON'

  return (
    <div className="flex flex-col gap-3">
      {/* ON/OFF Toggle */}
      <form action={toggleAction}>
        <input type="hidden" name="zoneId" value={zoneId} />
        <input type="hidden" name="newState" value={isOn ? 'OFF' : 'ON'} />
        <button
          type="submit"
          disabled={togglePending}
          className="text-[13px] font-semibold px-3 py-1 rounded-lg border transition-colors disabled:opacity-50"
          style={{
            color: isOn ? '#32D74B' : '#AEAEB2',
            borderColor: isOn ? '#32D74B' : '#AEAEB2',
            backgroundColor: isOn ? 'rgba(50,215,75,0.08)' : 'rgba(174,174,178,0.08)',
          }}
        >
          {togglePending ? '...' : isOn ? 'ON' : 'OFF'}
        </button>
      </form>

      {/* Dim Slider */}
      <Slider
        name="level"
        min={0}
        max={100}
        step={1}
        value={dimLevel}
        unit="%"
        disabled={dimPending}
      />
    </div>
  )
}
