import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { HvacControls } from './hvac-controls'
import { stripTowerPrefix } from '@/lib/zone-group'
import { EmptyState } from '@/components/ui/empty-state'

export default async function HvacPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          hvacUnits: true,
          sensors: {
            where: { type: 'TEMPERATURE' },
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      },
    },
  })

  if (!building) return <EmptyState message="Building not found" />

  const columns: Column[] = [
    { header: 'Zone' },
    { header: 'Floor' },
    { header: 'Temp' },
    { header: 'Setpoint' },
    { header: 'State' },
    { header: 'Controls' },
  ]

  const rows = building.zones.map((zone: any) => {
    const hvac = zone.hvacUnits[0]
    const tempSensor = zone.sensors[0]
    return {
      id: zone.id,
      cells: [
        <span key="n" className="text-[14px] font-medium text-white">{stripTowerPrefix(zone.name)}</span>,
        <span key="f" className="text-[12px] text-[#8E8E93]">{zone.floor >= 0 ? `F${zone.floor}` : `B${Math.abs(zone.floor)}`}</span>,
        <span key="t" className="text-[14px] font-['JetBrains_Mono'] text-white">
          {tempSensor?.value !== null ? `${tempSensor?.value.toFixed(1)}°C` : '--°C'}
        </span>,
        <span key="s" className="text-[12px] text-[#8E8E93]">{hvac?.setpoint ?? 22}°C</span>,
        (() => {
          const on = hvac?.state === 'ON'
          return <span key="st" className={`text-[12px] ${on ? 'text-[#32D74B]' : 'text-[#6B7280]'}`}>{hvac?.state ?? 'OFF'}</span>
        })(),
        <HvacControls
          key="c"
          zoneId={zone.id}
          initialSetpoint={hvac?.setpoint ?? 22}
          currentTemp={tempSensor?.value ?? null}
          currentSpeed={hvac?.fanSpeed ?? 'AUTO'}
          currentMode={hvac?.mode ?? 'AUTO'}
        />,
      ],
    }
  })

  return (
    <div>
      <PageHeader title="HVAC Control" subtitle="Zone temperature, fan speed & mode" />
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={rows}
          emptyMessage="No zones found"
        />
      </div>
    </div>
  )
}
