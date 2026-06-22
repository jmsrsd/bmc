'use client'

import { useActionState } from 'react'
import { setDimLevel, toggleLight } from '@/lib/actions'
import { Sun, Moon } from 'lucide-react'

export function DimSlider({ zoneId, currentLevel }: { zoneId: string; currentLevel: number }) {
  const [state, formAction, pending] = useActionState(setDimLevel, null)

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="zoneId" value={zoneId} />
      <div className="flex items-center gap-3">
        <Sun className="w-4 h-4 text-yellow-400 shrink-0" />
        <input
          type="range"
          name="level"
          min={0}
          max={100}
          defaultValue={currentLevel}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
        <span className="text-sm font-medium text-white w-10 text-right">
          {currentLevel}%
        </span>
      </div>
      <button type="submit" className="hidden">Update</button>
      {state?.error && <p className="text-xs text-red-400">{state.error}</p>}
      {state?.success && <p className="text-xs text-green-400">Updated</p>}
    </form>
  )
}

export function LightToggle({ zoneId, currentState }: { zoneId: string; currentState: string }) {
  const [state, formAction, pending] = useActionState(toggleLight, null)
  const isOn = currentState === 'ON'

  return (
    <form action={formAction}>
      <input type="hidden" name="zoneId" value={zoneId} />
      <input type="hidden" name="newState" value={isOn ? 'OFF' : 'ON'} />
      <button
        type="submit"
        disabled={pending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
          isOn
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
            : 'bg-gray-700 text-gray-400 border border-gray-600 hover:bg-gray-600'
        } disabled:opacity-50`}
      >
        {isOn ? (
          <><Sun className="w-4 h-4" />Turn Off</>
        ) : (
          <><Moon className="w-4 h-4" />Turn On</>
        )}
      </button>
      {state?.error && <p className="text-xs text-red-400 mt-1">{state.error}</p>}
    </form>
  )
}
