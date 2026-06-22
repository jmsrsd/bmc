'use client'

import { useActionState } from 'react'
import { setTemperature, setFanSpeed, setHvacMode } from '@/lib/actions'

export function SetpointForm({ zoneId, currentSetpoint }: { zoneId: string; currentSetpoint: number | null }) {
  const [state, formAction, pending] = useActionState(setTemperature, null)

  return (
    <form action={formAction} className="flex items-center gap-3">
      <input type="hidden" name="zoneId" value={zoneId} />
      <label className="text-sm text-gray-400">Setpoint</label>
      <input
        type="number"
        name="setpoint"
        min={16}
        max={30}
        step={0.5}
        defaultValue={currentSetpoint ?? 22}
        className="w-20 px-2.5 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
      <span className="text-sm text-gray-400">°C</span>
      <button
        type="submit"
        disabled={pending}
        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {pending ? '...' : 'Set'}
      </button>
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-400">Updated</p>}
    </form>
  )
}

export function FanSpeedButtons({ zoneId, currentSpeed }: { zoneId: string; currentSpeed: string }) {
  const speeds = ['OFF', 'LOW', 'MEDIUM', 'HIGH', 'AUTO'] as const
  const [state, formAction, pending] = useActionState(setFanSpeed, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="zoneId" value={zoneId} />
      <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
        Fan Speed
      </p>
      <div className="flex flex-wrap gap-1.5">
        {speeds.map((speed) => (
          <button
            key={speed}
            type="submit"
            name="speed"
            value={speed}
            disabled={pending}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentSpeed === speed
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            {speed.charAt(0) + speed.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {state?.error && <p className="text-xs text-red-400 mt-1">{state.error}</p>}
    </form>
  )
}

export function HvacModeButtons({ zoneId, currentMode }: { zoneId: string; currentMode: string }) {
  const modes = ['COOL', 'HEAT', 'AUTO', 'VENT'] as const
  const [state, formAction, pending] = useActionState(setHvacMode, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="zoneId" value={zoneId} />
      <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
        Mode
      </p>
      <div className="flex flex-wrap gap-1.5">
        {modes.map((mode) => (
          <button
            key={mode}
            type="submit"
            name="mode"
            value={mode}
            disabled={pending}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              currentMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } disabled:opacity-50`}
          >
            {mode.charAt(0) + mode.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {state?.error && <p className="text-xs text-red-400 mt-1">{state.error}</p>}
    </form>
  )
}
