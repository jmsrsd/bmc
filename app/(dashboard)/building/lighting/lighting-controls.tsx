'use client'

import { useActionState } from 'react'
import { setDimLevel, toggleLight } from '@/lib/actions'

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
      <form action={dimAction} className="relative">
        <input type="hidden" name="zoneId" value={zoneId} />
        <input
          type="range"
          name="level"
          min="0"
          max="100"
          step="1"
          defaultValue={dimLevel}
          className="w-full h-[6px] rounded-full appearance-none cursor-pointer bg-hairline
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-[18px]
            [&::-webkit-slider-thumb]:h-[18px]
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-active
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-[18px]
            [&::-moz-range-thumb]:h-[18px]
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-active
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
          onChange={(e) => {
            if (!dimPending) {
              e.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-secondary">0%</span>
          <span className="text-[13px] font-medium text-white">{dimLevel}%</span>
          <span className="text-[11px] text-secondary">100%</span>
        </div>
        <button type="submit" className="hidden" />
      </form>
    </div>
  )
}