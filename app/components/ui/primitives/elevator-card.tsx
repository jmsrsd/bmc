'use client'

import { ReactNode } from 'react'
import { ArrowUp, ArrowDown, DoorOpen, DoorClosed } from 'lucide-react'
import { StatusBadge, StatusLed, MetricTile, Card } from '.'

interface ElevatorCar {
  id: string
  name: string
  state: string
  floor: number
  direction: string
  doorState: string
  recallFloor: number | null
}

function carStateStatus(state: string): 'normal' | 'warning' | 'critical' {
  if (state === 'FAULT') return 'critical'
  if (state === 'RECALL') return 'warning'
  return 'normal'
}

function DirectionIcon({ direction }: { direction: string }) {
  switch (direction) {
    case 'UP':
      return <ArrowUp className="w-5 h-5 text-status-normal" />
    case 'DOWN':
      return <ArrowDown className="w-5 h-5 text-status-critical" />
    default:
      return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground text-lg">—</span>
  }
}

function DoorIcon({ doorState }: { doorState: string }) {
  switch (doorState) {
    case 'OPEN':
      return <DoorOpen className="w-4 h-4 text-status-active" />
    default:
      return <DoorClosed className="w-4 h-4 text-muted-foreground" />
  }
}

interface ElevatorCardProps {
  car: ElevatorCar
  recallForm: ReactNode
  clearRecallBtn: ReactNode
}

export function ElevatorCard({ car, recallForm, clearRecallBtn }: ElevatorCardProps) {
  const status = carStateStatus(car.state)

  return (
    <Card
      className={`p-5 ${car.state === 'RECALL' ? 'border-status-warning/40' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-white">{car.name}</h3>
        <StatusBadge status={status}>{car.state}</StatusBadge>
      </div>

      {/* Floor + Direction */}
      <div className="flex items-center gap-4 mb-3">
        <MetricTile label="Floor" value={car.floor} />
        <div className="flex flex-col items-center">
          <DirectionIcon direction={car.direction} />
          <span className="text-xs text-muted-foreground mt-0.5 capitalize">
            {car.direction.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Door State */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <DoorIcon doorState={car.doorState} />
        <span>{car.doorState === 'OPEN' ? 'Open' : 'Closed'}</span>
      </div>

      {/* Recall Info */}
      {car.state === 'RECALL' && car.recallFloor != null && car.recallFloor > 0 && (
        <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-status-warning">
            Recalled to floor {car.recallFloor}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border-hairline/50">
        {recallForm}
        {clearRecallBtn}
      </div>
    </Card>
  )
}
