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
            ? 'bg-[#32D74B]/10 text-[#32D74B] hover:bg-[#32D74B]/20 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50'
            : 'bg-[#FF9F0A]/10 text-[#FF9F0A] hover:bg-[#FF9F0A]/20 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50'
        }
      >
        {pending ? '...' : isLocked ? 'Unlock' : 'Lock'}
      </button>
      {state?.error && <p className="text-[#FF453A] text-xs mt-1">{state.error}</p>}
    </form>
  )
}
