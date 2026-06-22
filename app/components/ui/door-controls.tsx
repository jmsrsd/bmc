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
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
            : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
        }`}
      >
        {isLocked ? (
          <><Unlock className="w-4 h-4" />Unlock</>
        ) : (
          <><Lock className="w-4 h-4" />Lock</>
        )}
      </button>
      {state?.error && <p className="text-xs text-red-400 mt-1">{state.error}</p>}
    </form>
  )
}
