'use client'

import { useActionState } from 'react'
import { setTemperature } from '@/lib/actions'

type Props = {
  zoneId: string
  initialSetpoint: number
}

export function TemperatureSlider({ zoneId, initialSetpoint }: Props) {
  const [state, formAction, pending] = useActionState(setTemperature, null)

  const currentValue = state?.setpoint ?? initialSetpoint
  const error = state?.error ?? null

  return (
    <form action={formAction} className="relative">
      <input type="hidden" name="zoneId" value={zoneId} />
      <input
        type="range"
        name="setpoint"
        min="16"
        max="30"
        step="0.5"
        defaultValue={currentValue}
        className="w-full h-[6px] rounded-full appearance-none cursor-pointer bg-[#242427]
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-[18px]
          [&::-webkit-slider-thumb]:h-[18px]
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#0A84FF]
          [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-[18px]
          [&::-moz-range-thumb]:h-[18px]
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-[#0A84FF]
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:shadow-md
          [&::-moz-range-thumb]:cursor-pointer"
        onChange={(e) => {
          if (!pending) {
            e.currentTarget.form?.requestSubmit()
          }
        }}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[11px] text-[#8E8E93]">16</span>
        <span className="text-[13px] font-medium text-white">{currentValue}°C</span>
        <span className="text-[11px] text-[#8E8E93]">30</span>
      </div>
      <button type="submit" className="hidden" />
      {error && <p className="text-[12px] text-[#FF453A] mt-1">{error}</p>}
      {pending && <p className="text-[12px] text-[#8E8E93] mt-1">Updating...</p>}
    </form>
  )
}
