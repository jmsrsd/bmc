'use client'

import { useActionState } from 'react'
import { setDoorState } from '@/lib/actions'
import { Lock, Unlock } from 'lucide-react'

export function DoorLockButton({
  doorId,
  currentState,
}: {
  doorId: string
  currentState: string
}) {
  const isLocked = currentState === 'LOCKED'
  const [state, formAction, pending] = useActionState(setDoorState, null)

  return (
    <form action={formAction}>
      <input type="hidden" name="doorId" value={doorId} />
      <input type="hidden" name="newState" value={isLocked ? 'UNLOCKED' : 'LOCKED'} />
      <button
        type="submit"
        disabled={pending}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          isLocked
            ? 'bg-status-warning/20 text-status-warning border border-status-warning/30 hover:bg-status-warning/30'
            : 'bg-status-normal/20 text-status-normal border border-status-normal/30 hover:bg-status-normal/30'
        }`}
      >
        {isLocked ? (
          <><Unlock className="w-4 h-4" />Unlock</>
        ) : (
          <><Lock className="w-4 h-4" />Lock</>
        )}
      </button>
      {state?.error && <p className="text-xs text-status-critical mt-1">{state.error}</p>}
    </form>
  )
}