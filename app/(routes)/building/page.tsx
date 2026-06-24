import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  StatusLed,
  BackLink,
  PageHeader,
  StatCard,
  EmptyState,
  SensorTile,
} from '@/components/ui/primitives'
import {
  Building2,
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Cpu,
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Building Overview | BMC',
  description: 'Zone status overview — temperature, occupancy, and subsystem health',
}

// ─── Helpers ────────────────────────────────────────────────────

function hvacStatusColor(state: string): string {
  switch (state) {
    case 'ON': return 'bg-status-normal'
    case 'FAULT': return 'bg-status-critical'
    case 'STANDBY': return 'bg-status-warning'
    default: return 'bg-bg-elevated'
  }
}

function hvacStatusLed(state: string): 'normal' | 'warning' | 'critical' {
  if (state === 'FAULT') return 'critical'
  if (state === 'STANDBY') return 'warning'
  return 'normal'
}

function hvacStatusLabel(state: string): string {
  switch (state) {
    case 'ON': return 'Running'
    case 'FAULT': return 'Fault'
    case 'STANDBY': return 'Standby'
    default: return 'Off'
  }
}

function findSensor(sensors: { type: string; value: number; unit: string }[], type: string): { value: number; unit: string } | null {
  const s = sensors.find((s) => s.type === type)
  return s ? { value: s.value, unit: s.unit } : null
}

// ─── Zone Card (inline) ─────────────────────────────────────────

interface ZoneWithRelations {
  id: string
  name: string
  floor: number
  area: number | null
  type: string
  hvacUnits: { state: string; mode: string; setpoint: number | null }[]
  sensors: { type: string; value: number; unit: string }[]
  lightZones: { state: string; dimLevel: number }[]
  doors: { state: string }[]
}

function ZoneCard({ zone }: { zone: ZoneWithRelations }) {
  const hvac = zone.hvacUnits[0]
  const tempSensor = findSensor(zone.sensors, 'TEMPERATURE')
  const humiditySensor = findSensor(zone.sensors, 'HUMIDITY')
  const lightsOn = zone.lightZones.filter((l) => l.state === 'ON').length
  const doorsLocked = zone.doors.filter((d) => d.state === 'LOCKED').length

  return (
    <div className="bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-6 hover:bg-bg-surface transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
          <p className="text-sm text-muted-foreground">Floor {zone.floor}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-bg-surface text-muted-foreground font-medium capitalize">
          {zone.type.toLowerCase()}
        </span>
      </div>
      {zone.area && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Gauge className="w-4 h-4" />
          <span>{zone.area} m²</span>
        </div>
      )}
      {hvac && (
        <div className="flex items-center gap-2 mb-3">
          <StatusLed status={hvacStatusLed(hvac.state)} />
          <span className="text-sm text-foreground">HVAC {hvacStatusLabel(hvac.state)}</span>
          {hvac.setpoint && <span className="text-xs text-muted-foreground ml-auto font-mono">Setpoint: {hvac.setpoint}°C</span>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {tempSensor ? (
          <SensorTile
            icon={<Thermometer className="w-4 h-4" />}
            iconColor="text-status-active"
            value={tempSensor.value.toFixed(1)}
            label="Temp (°C)"
          />
        ) : (
          <SensorTile icon={<Thermometer className="w-4 h-4" />} iconColor="text-muted-foreground" value="—" label="No sensor" />
        )}
        {humiditySensor ? (
          <SensorTile
            icon={<Droplets className="w-4 h-4" />}
            iconColor="text-status-active"
            value={humiditySensor.value.toFixed(0)}
            label="Humidity (%)"
          />
        ) : (
          <SensorTile icon={<Droplets className="w-4 h-4" />} iconColor="text-muted-foreground" value="—" label="No sensor" />
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border-hairline/50">
        <span>{lightsOn > 0 ? `${lightsOn} light${lightsOn !== 1 ? 's' : ''} on` : 'Lights off'}</span>
        <span>{doorsLocked > 0 ? `${doorsLocked} door${doorsLocked !== 1 ? 's' : ''} locked` : 'All doors open'}</span>
      </div>
      <Link
        href={`/building/hvac?zone=${zone.id}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-status-active hover:opacity-80 transition-colors"
      >
        <Wind className="w-3.5 h-3.5" /> HVAC Control
      </Link>
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────

export default async function BuildingOverviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [building, activeAlarmCount] = await Promise.all([
    prisma.building.findUnique({
      where: { id: 'b1' },
      include: {
        zones: {
          include: {
            hvacUnits: { select: { state: true, mode: true, setpoint: true } },
            sensors: { select: { type: true, value: true, unit: true } },
            lightZones: { select: { state: true, dimLevel: true } },
            doors: { select: { state: true } },
          },
          orderBy: { floor: 'asc' },
        },
      },
    }),
    prisma.alarm.count({ where: { buildingId: 'b1', status: 'open' } }),
  ])

  if (!building) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon={<Building2 className="w-12 h-12" />}
          title="Building Not Found"
          description="No building data available. Please seed the database."
        />
      </div>
    )
  }

  const zones = building.zones
  const totalZones = zones.length
  const allHvacUnits = zones.flatMap((z) => z.hvacUnits)
  const totalHvacUnits = allHvacUnits.length
  const hvacFault = allHvacUnits.filter((u) => u.state === 'FAULT').length
  const totalSensors = zones.reduce((sum, z) => sum + z.sensors.length, 0)

  return (
    <div className="space-y-8">
      <BackLink href="/" label="Dashboard" />
      <PageHeader
        title={building.name}
        subtitle={building.address ?? null}
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="w-5 h-5 text-status-active" />} label="Total Zones" value={totalZones} />
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-status-critical" />} label="Active Alarms" value={activeAlarmCount} highlight={activeAlarmCount > 0} />
        <StatCard icon={<Wind className="w-5 h-5 text-status-active" />} label="HVAC Units" value={`${totalHvacUnits}${hvacFault > 0 ? ` (${hvacFault} fault)` : ''}`} />
        <StatCard icon={<Cpu className="w-5 h-5 text-status-active" />} label="Sensors" value={totalSensors} />
      </div>
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Zones</h2>
        {zones.length === 0 ? (
          <EmptyState
            icon={<Building2 className="w-12 h-12" />}
            title="No zones"
            description="No zones configured"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {zones.map((zone) => <ZoneCard key={zone.id} zone={zone} />)}
          </div>
        )}
      </section>
    </div>
  )
}
