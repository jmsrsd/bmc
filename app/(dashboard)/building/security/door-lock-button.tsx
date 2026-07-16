'use client'

import { useActionState } from 'react'
import { setDoorState } from '@/lib/actions'

type Props = {
  doorId: string
  currentState: string
  doorName: string
}

export function DoorLockButton({ doorId, currentState, doorName }: Props) {
  const [state, formAction, pending] = useActionState(setDoorState, null)

  const isLocked = currentState === 'LOCKED' || currentState === 'FORCED'

  return (
    <form action={formAction}>
      <input type="hidden" name="doorId" value={doorId} />
      <input type="hidden" name="newState" value={isLocked ? 'UNLOCKED' : 'LOCKED'} />
      <button
        type="submit"
        disabled={pending}
        className={
          isLocked
            ? 'bg-normal/10 text-normal hover:bg-normal/20 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50'
            : 'bg-warning/10 text-warning hover:bg-warning/20 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50'
        }
      >
        {pending ? '...' : isLocked ? 'Unlock' : 'Lock'}
      </button>
      {state?.error && <p className="text-critical text-xs mt-1">{state.error}</p>}
    </form>
  )
}
