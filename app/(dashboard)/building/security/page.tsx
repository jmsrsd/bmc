import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { DoorLockButton } from './door-lock-button'

const STATUS_COLORS: Record<string, string> = {
  UNLOCKED: '#32D74B',
  LOCKED: '#FF9F0A',
  FORCED: '#FF453A',
}

const STATUS_LABELS: Record<string, string> = {
  UNLOCKED: 'Unlocked',
  LOCKED: 'Locked',
  FORCED: 'Forced',
}

type DoorRow = {
  id: string
  doorName: string
  zoneName: string
  state: string
  statusColor: string
  statusLabel: string
}

const columns: Column<DoorRow>[] = [
  {
    header: 'Zone',
    cell: (door) => (
      <span className="text-[12px] text-[#8E8E93]">{door.zoneName}</span>
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
        <span className="text-[13px] text-[#8E8E93]">{door.statusLabel}</span>
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

export default async function SecurityPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          doors: true,
        },
      },
    },
  })

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[#8E8E93] text-[14px]">Building not found</p>
      </div>
    )
  }

  const rows: DoorRow[] = building.zones
    .filter((z) => z.doors.length > 0)
    .flatMap((zone) =>
      zone.doors.map((door) => ({
        id: door.id,
        doorName: door.name,
        zoneName: zone.name,
        state: door.state,
        statusColor: STATUS_COLORS[door.state] ?? '#6B7280',
        statusLabel: STATUS_LABELS[door.state] ?? door.state,
      })),
    )

  return (
    <div>
      <PageHeader title="Access Control" subtitle="Door lock/unlock status" />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={rows}
          keyExtractor={(d) => d.id}
          emptyMessage="No doors found"
        />
      </div>
    </div>
  )
}
