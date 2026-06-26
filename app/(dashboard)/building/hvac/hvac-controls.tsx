'use client'

import { useActionState } from 'react'
import { setTemperature, setFanSpeed, setHvacMode } from '@/lib/actions'
import { Slider } from '@/components/ui/slider'

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
        <span className="text-[12px] text-[#8E8E93] block mb-1">Temp: {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : '—'}</span>
        <Slider
          name="setpoint"
          min={16}
          max={30}
          step={0.5}
          value={setpoint}
          unit="°C"
          disabled={tempPending}
        />
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
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${active ? 'bg-[#0A84FF] text-white' : 'bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#242427] hover:text-white'}`}
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
              className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${active ? 'bg-[#0A84FF] text-white' : 'bg-[#1C1C1E] text-[#8E8E93] hover:bg-[#242427] hover:text-white'}`}
            >
              {m}
            </button>
          )
        })}
      </form>
    </div>
  )
}
