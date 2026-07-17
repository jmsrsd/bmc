'use client'

import { DataTable, type Column } from '@/components/ui/data-table'
import { DoorLockButton } from './door-lock-button'
import { STATUS_COLORS, STATUS_LABELS, type DoorRow } from './_helpers'

export const columns: Column<DoorRow>[] = [
  {
    header: 'Zone',
    cell: (door) => (
      <span className="text-[12px] text-secondary">{door.zoneName}</span>
    ),
    className: 'w-40',
  },
  {
    header: 'Door',
    cell: (door) => (
      <span className="text-[14px] font-medium text-white">{door.doorName}</span>
    ),
  },
  {
    header: 'Status',
    cell: (door) => (
      <div className="flex items-center gap-2">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: door.statusColor }}
        />
        <span className="text-[13px] text-secondary">{door.statusLabel}</span>
      </div>
    ),
    className: 'w-36',
  },
  {
    header: '',
    cell: (door) => (
      <div className="flex justify-end">
        <DoorLockButton
          doorId={door.id}
          currentState={door.state}
          doorName={door.doorName}
        />
      </div>
    ),
    className: 'w-32 text-right',
  },
]
