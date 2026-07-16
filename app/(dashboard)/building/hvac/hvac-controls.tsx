'use client'

import { useActionState } from 'react'
import { setTemperature, setFanSpeed, setHvacMode } from '@/lib/actions'

type Props = {
  zoneId: string
  initialSetpoint: number
  currentTemp: number | null
  currentSpeed: string
  currentMode: string
}

export function HvacControls({ zoneId, initialSetpoint, currentTemp, currentSpeed, currentMode }: Props) {
  const [tempState, tempAction, tempPending] = useActionState(setTemperature, null)
  const [speedState, speedAction, speedPending] = useActionState(setFanSpeed, null)
  const [modeState, modeAction, modePending] = useActionState(setHvacMode, null)

  const setpoint = tempState?.setpoint ?? initialSetpoint
  const speed = speedState?.speed ?? currentSpeed
  const mode = modeState?.mode ?? currentMode

  const SPEEDS = ['OFF', 'LOW', 'MEDIUM', 'HIGH', 'AUTO']

  return (
    <div className="flex flex-col gap-3">
      {/* Temperature Display + Setpoint Slider */}
      <div>
        <span className="text-[12px] text-secondary block mb-1">Temp: {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : '—'}</span>
        <form action={tempAction} className="relative">
          <input type="hidden" name="zoneId" value={zoneId} />
          <input
            type="range"
            name="setpoint"
            min="16"
            max="30"
            step="0.5"
            defaultValue={setpoint}
            className="w-full h-[6px] rounded-full appearance-none cursor-pointer bg-hairline
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-[18px]
              [&::-webkit-slider-thumb]:h-[18px]
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-active
              [&::-webkit-slider-thumb]:shadow-md
              [&::-webkit-slider-thumb]:cursor-pointer"
            onChange={(e) => {
              if (!tempPending) {
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[11px] text-secondary">16°</span>
            <span className="text-[13px] font-medium text-white">{setpoint}°C</span>
            <span className="text-[11px] text-secondary">30°</span>
          </div>
        </form>
      </div>

      {/* Fan Speed Buttons */}
      <form action={speedAction} className="flex flex-wrap gap-1">
        <input type="hidden" name="zoneId" value={zoneId} />
        {SPEEDS.map((s) => {
          const active = speed === s
          return (
            <button
              key={s}
              type="submit"
              name="speed"
              value={s}
              disabled={speedPending}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${active ? 'bg-active text-white' : 'bg-elevated text-secondary hover:bg-hairline hover:text-white'}`}
            >
              {s}
            </button>
          )
        })}
      </form>

      {/* Mode Buttons */}
      <form action={modeAction} className="flex flex-wrap gap-1">
        <input type="hidden" name="zoneId" value={zoneId} />
        {['COOL', 'HEAT', 'AUTO', 'VENT'].map((m) => {
          const active = mode === m
          return (
            <button
              key={m}
              type="submit"
              name="mode"
              value={m}
              disabled={modePending}
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${active ? 'bg-active text-white' : 'bg-elevated text-secondary hover:bg-hairline hover:text-white'}`}
            >
              {m}
            </button>
          )
        })}
      </form>
    </div>
  )
}