'use client'

import { DoorLockButton } from '@/components/ui/door-controls'
import { StatusBadge, StatusLed, Card } from '.'

interface DoorCardDoor {
  id: string
  name: string
  zone: { name: string; floor: number }
  state: string
  alarmState: string
}

const doorStateStatus: Record<string, 'critical' | 'warning' | 'normal'> = {
  FORCED: 'critical',
  LOCKED: 'warning',
  UNLOCKED: 'normal',
}

export function DoorCard({ door }: { door: DoorCardDoor }) {
  const status = doorStateStatus[door.state] ?? 'normal'

  return (
    <Card className={`p-5 ${door.state === 'FORCED' ? 'border-status-critical/50' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{door.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {door.zone.name} · Floor {door.zone.floor}
          </p>
        </div>
        <StatusBadge status={status}>
          {door.state}
        </StatusBadge>
      </div>

      {/* Status detail line */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <StatusLed status={status} />
        <span
          className={`font-medium ${
            door.state === 'FORCED'
              ? 'text-status-critical'
              : door.state === 'LOCKED'
                ? 'text-status-warning'
                : 'text-status-normal'
          }`}
        >
          {door.state.charAt(0) + door.state.slice(1).toLowerCase()}
        </span>
        {door.alarmState !== 'NORMAL' && (
          <span className="text-xs text-status-critical bg-status-critical/10 px-2 py-0.5 rounded-full ml-auto">
            Alarm: {door.alarmState}
          </span>
        )}
      </div>

      {/* Door lock action */}
      {door.state !== 'FORCED' && (
        <div className="pt-3 border-t border-border-hairline/50">
          <DoorLockButton doorId={door.id} currentState={door.state} />
        </div>
      )}
    </Card>
  )
}
