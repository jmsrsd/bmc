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
        <Sun className="w-4 h-4 text-status-active shrink-0" />
        <input
          type="range"
          name="level"
          min={0}
          max={100}
          defaultValue={currentLevel}
          className="w-full h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-status-active"
          onChange={(e) => e.currentTarget.form?.requestSubmit()}
        />
        <span className="text-sm font-medium text-white w-10 text-right font-mono">
          {currentLevel}%
        </span>
      </div>
      <button type="submit" className="hidden">Update</button>
      {state?.error && <p className="text-xs text-status-critical">{state.error}</p>}
      {state?.success && <p className="text-xs text-status-normal">Updated</p>}
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
            ? 'bg-status-active/20 text-status-active border border-status-active/30 hover:bg-status-active/30'
            : 'bg-bg-surface text-muted-foreground border border-border-hairline hover:bg-gray-600'
        } disabled:opacity-50`}
      >
        {isOn ? (
          <><Sun className="w-4 h-4" />Turn Off</>
        ) : (
          <><Moon className="w-4 h-4" />Turn On</>
        )}
      </button>
      {state?.error && <p className="text-xs text-status-critical mt-1">{state.error}</p>}
    </form>
  )
}