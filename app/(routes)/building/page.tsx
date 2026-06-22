import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  AlertTriangle,
  Thermometer,
  Droplets,
  Wind,
  ArrowLeft,
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
    case 'ON': return 'bg-green-500'
    case 'FAULT': return 'bg-red-500'
    case 'STANDBY': return 'bg-amber-500'
    default: return 'bg-gray-500'
  }
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
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:bg-gray-700/50 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
          <p className="text-sm text-gray-400">Floor {zone.floor}</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 font-medium capitalize">
          {zone.type.toLowerCase()}
        </span>
      </div>
      {zone.area && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Gauge className="w-4 h-4" />
          <span>{zone.area} m²</span>
        </div>
      )}
      {hvac && (
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2.5 h-2.5 rounded-full ${hvacStatusColor(hvac.state)}`} />
          <span className="text-sm text-gray-300">HVAC {hvacStatusLabel(hvac.state)}</span>
          {hvac.setpoint && <span className="text-xs text-gray-500 ml-auto">Setpoint: {hvac.setpoint}°C</span>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {tempSensor ? (
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <Thermometer className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{tempSensor.value.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Temp (°C)</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <Thermometer className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <p className="text-sm text-gray-500">No sensor</p>
          </div>
        )}
        {humiditySensor ? (
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <Droplets className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{humiditySensor.value.toFixed(0)}</p>
            <p className="text-xs text-gray-500">Humidity (%)</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-lg p-3 text-center">
            <Droplets className="w-4 h-4 text-gray-600 mx-auto mb-1" />
            <p className="text-sm text-gray-500">No sensor</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-700/50">
        <span>{lightsOn > 0 ? `${lightsOn} light${lightsOn !== 1 ? 's' : ''} on` : 'Lights off'}</span>
        <span>{doorsLocked > 0 ? `${doorsLocked} door${doorsLocked !== 1 ? 's' : ''} locked` : 'All doors open'}</span>
      </div>
      <Link
        href={`/building/hvac?zone=${zone.id}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <Wind className="w-3.5 h-3.5" /> HVAC Control
      </Link>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  highlight?: boolean
}

function StatCard({ icon, label, value, highlight }: StatCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${highlight ? 'bg-red-500/10' : 'bg-gray-700/50'}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className={`text-2xl font-bold ${highlight ? 'text-red-400' : 'text-white'}`}>{value}</p>
      </div>
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
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
          <Building2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Building Not Found</h2>
          <p className="text-gray-400">No building data available. Please seed the database.</p>
        </div>
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
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Dashboard
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-white">{building.name}</h1>
        {building.address && <p className="text-gray-400 mt-1">{building.address}</p>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="w-5 h-5 text-blue-400" />} label="Total Zones" value={totalZones} />
        <StatCard icon={<AlertTriangle className="w-5 h-5 text-red-400" />} label="Active Alarms" value={activeAlarmCount} highlight={activeAlarmCount > 0} />
        <StatCard icon={<Wind className="w-5 h-5 text-cyan-400" />} label="HVAC Units" value={`${totalHvacUnits}${hvacFault > 0 ? ` (${hvacFault} fault)` : ''}`} />
        <StatCard icon={<Cpu className="w-5 h-5 text-purple-400" />} label="Sensors" value={totalSensors} />
      </div>
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Zones</h2>
        {zones.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-400">No zones configured</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {zones.map((zone) => <ZoneCard key={zone.id} zone={zone} />)}
          </div>
        )}
      </section>
    </div>
  )
}
