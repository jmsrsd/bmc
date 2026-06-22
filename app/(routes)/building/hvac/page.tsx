import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Thermometer,
  Wind,
  Fan,
  Activity,
  Snowflake,
  Sun,
  Repeat,
  Wind as Vent,
} from 'lucide-react'
import { SetpointForm, FanSpeedButtons, HvacModeButtons } from '@/components/ui/hvac-controls'
import { AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'HVAC Control | BMC',
  description: 'Per-zone HVAC control — temperature setpoint, fan speed, and mode',
}

// ─── Server Component Helpers ───────────────────────────────────

function hvacStateColor(state: string): string {
  switch (state) {
    case 'ON':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'FAULT':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'STANDBY':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

function hvacStateDot(state: string): string {
  switch (state) {
    case 'ON':
      return 'bg-green-500'
    case 'FAULT':
      return 'bg-red-500'
    case 'STANDBY':
      return 'bg-amber-500'
    default:
      return 'bg-gray-500'
  }
}

// ─── Page ───────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ zone?: string }>
}

export default async function HVACPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { zone: filterZone } = await searchParams

  // Query all zones with their HVAC units and temperature sensors
  const zones = await prisma.zone.findMany({
    where: { buildingId: 'b1' },
    include: {
      hvacUnits: true,
      sensors: {
        where: { type: 'TEMPERATURE' },
        select: { value: true, unit: true, timestamp: true },
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
    },
    orderBy: { floor: 'asc' },
  })

  // Filter by zone if specified
  const filteredZones = filterZone
    ? zones.filter((z) => z.id === filterZone)
    : zones

  // Collect all zones that have HVAC units for filter buttons
  const zonesWithHvac = zones.filter((z) => z.hvacUnits.length > 0)

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/building"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Building Overview
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Thermometer className="w-8 h-8 text-cyan-400" />
          HVAC Control
        </h1>
        <p className="text-gray-400 mt-1">
          {filterZone
            ? `Showing zone: ${filteredZones[0]?.name ?? 'Unknown'}`
            : 'All zones'}
        </p>
      </div>

      {/* Zone Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/building/hvac"
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            !filterZone
              ? 'bg-cyan-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All Zones
        </Link>
        {zonesWithHvac.map((z) => (
          <Link
            key={z.id}
            href={`/building/hvac?zone=${z.id}`}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              filterZone === z.id
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {z.name}
          </Link>
        ))}
      </div>

      {/* HVAC Units Grid */}
      {filteredZones.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
          <Wind className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No HVAC Units
          </h2>
          <p className="text-gray-400">
            {filterZone
              ? 'No HVAC units found for the selected zone.'
              : 'No HVAC units configured in this building.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredZones.map(
            (zone) =>
              zone.hvacUnits.length > 0 &&
              zone.hvacUnits.map((hvac) => {
                const tempSensor = zone.sensors[0]

                return (
                  <div
                    key={hvac.id}
                    className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {zone.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                          Floor {zone.floor} · {hvac.type}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${hvacStateColor(
                          hvac.state
                        )}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${hvacStateDot(
                            hvac.state
                          )}`}
                        />
                        {hvac.state}
                      </span>
                    </div>

                    {/* Temperature Display */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Current</p>
                        <p className="text-xl font-bold text-white">
                          {tempSensor
                            ? tempSensor.value.toFixed(1)
                            : '--'}
                        </p>
                        <p className="text-xs text-gray-500">°C</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Supply</p>
                        <p className="text-xl font-bold text-cyan-400">
                          {hvac.supplyTemp?.toFixed(1) ?? '--'}
                        </p>
                        <p className="text-xs text-gray-500">°C</p>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Return</p>
                        <p className="text-xl font-bold text-orange-400">
                          {hvac.returnTemp?.toFixed(1) ?? '--'}
                        </p>
                        <p className="text-xs text-gray-500">°C</p>
                      </div>
                    </div>

                    {/* Setpoint Form */}
                    <div className="mb-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                        Temperature Setpoint
                      </p>
                      <SetpointForm
                        zoneId={zone.id}
                        currentSetpoint={hvac.setpoint}
                      />
                    </div>

                    {/* Fan Speed Buttons */}
                    <div className="mb-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                      <FanSpeedButtons
                        zoneId={zone.id}
                        currentSpeed={hvac.fanSpeed}
                      />
                    </div>

                    {/* HVAC Mode Buttons */}
                    <div className="p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                      <HvacModeButtons
                        zoneId={zone.id}
                        currentMode={hvac.mode}
                      />
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-700/50 text-xs text-gray-500">
                      <span>Runtime: {hvac.runHours}h</span>
                      {hvac.alarmPriority && hvac.alarmPriority > 0 ? (
                        <span className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          Alarm P{hvac.alarmPriority}
                        </span>
                      ) : null}
                      <span>
                        Occ:{' '}
                        {hvac.occupancyMode ? 'Occupied' : 'Unoccupied'}
                      </span>
                    </div>
                  </div>
                )
              })
          )}
        </div>
      )}
    </div>
  )
}
