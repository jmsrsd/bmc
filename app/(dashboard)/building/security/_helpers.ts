export const STATUS_COLORS: Record<string, string> = {
  UNLOCKED: '#32D74B',
  LOCKED: '#FF9F0A',
  FORCED: '#FF453A',
}

export const STATUS_LABELS: Record<string, string> = {
  UNLOCKED: 'Unlocked',
  LOCKED: 'Locked',
  FORCED: 'Forced',
}

export type DoorRow = {
  id: string
  doorName: string
  zoneName: string
  state: string
  statusColor: string
  statusLabel: string
}

export function buildSecurityRows(building: any): DoorRow[] {
  if (!building) return []
  return building.zones
    .filter((z: any) => z.doors.length > 0)
    .flatMap((zone: any) =>
      zone.doors.map((door: any) => ({
        id: door.id,
        doorName: door.name,
        zoneName: zone.name,
        state: door.state,
        statusColor: STATUS_COLORS[door.state] ?? '#8E8E93',
        statusLabel: STATUS_LABELS[door.state] ?? door.state,
      }))
    )
}
