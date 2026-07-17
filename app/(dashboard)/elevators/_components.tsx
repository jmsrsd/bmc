'use client'

import { STATE_COLORS } from './_helpers'

export function Arrow({ direction }: { direction: string }) {
  if (direction === 'UP') return <span className="text-normal text-[16px]">↑</span>
  if (direction === 'DOWN') return <span className="text-active text-[16px]">↓</span>
  return <span className="text-secondary text-[16px]">—</span>
}

export function StatusDot({ state }: { state: string }) {
  const color = STATE_COLORS[state] ?? '#8E8E93'
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      aria-label={`Status: ${state}`}
    />
  )
}
