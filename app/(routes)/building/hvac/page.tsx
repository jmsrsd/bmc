import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { StatusLed, BackLink, PageHeader, EmptyState, MetricTile, PillTabs } from '@/components/ui/primitives'
import { SetpointForm, FanSpeedButtons, HvacModeButtons } from '@/components/ui/hvac-controls'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'HVAC Control | BMC',
  description: 'Per-zone HVAC control — temperature setpoint, fan speed, and mode',
}

function hvacStateBg(state: string): string {
  switch (state) {
    case 'ON':
      return 'bg-status-normal/20 border-status-normal/30'
    case 'FAULT':
      return 'bg-status-critical/20 border-status-critical/30'
    case 'STANDBY':
      return 'bg-status-warning/20 border-status-warning/30'
    default:
      return 'bg-bg-surface/50 border-border-hairline/30'
  }
}

function hvacStatus(state: string): 'normal' | 'warning' | 'critical' {
  if (state === 'FAULT') return 'critical'
  if (state === 'STANDBY') return 'warning'
  return 'normal'
}

interface PageProps {
  searchParams: Promise<{ zone?: string }>
}

export default async function HVACPage({ searchParams }: PageProps) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { zone: filterZone } = await searchParams

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

  const filteredZones = filterZone
    ? zones.filter((z) => z.id === filterZone)
    : zones

  const zonesWithHvac = zones.filter((z) => z.hvacUnits.length > 0)

  return (
    <div className="space-y-6">
      <BackLink href="/building" label="Building Overview" />

      <PageHeader
        title="HVAC Control"
        subtitle={filterZone
          ? `Showing zone: ${filteredZones[0]?.name ?? 'Unknown'}`
          : 'All zones'}
      />

      {/* Zone Filter Pills */}
      <PillTabs
        tabs={[
          { label: 'All Zones', href: '/building/hvac', active: !filterZone },
          ...zonesWithHvac.map((z) => ({
            label: z.name,
            href: `/building/hvac?zone=${z.id}`,
            active: filterZone === z.id,
          })),
        ]}
      />

      {/* HVAC Units Grid */}
      {filteredZones.length === 0 || filteredZones.every((z) => z.hvacUnits.length === 0) ? (
        <EmptyState
          icon={null}
          title="No HVAC Units"
          description={filterZone
            ? 'No HVAC units found for the selected zone.'
            : 'No HVAC units configured in this building.'}
        />
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
                    className="bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-6"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {zone.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Floor {zone.floor} · {hvac.type}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${hvacStateBg(
                          hvac.state
                        )}`}
                      >
                        <StatusLed status={hvacStatus(hvac.state)} />
                        {hvac.state}
                      </span>
                    </div>

                    {/* Temperature Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <MetricTile
                        label="Current"
                        value={tempSensor ? tempSensor.value.toFixed(1) : '--'}
                        unit="°C"
                      />
                      <MetricTile
                        label="Supply"
                        value={hvac.supplyTemp?.toFixed(1) ?? '--'}
                        valueColor="text-status-active"
                        unit="°C"
                      />
                      <MetricTile
                        label="Return"
                        value={hvac.returnTemp?.toFixed(1) ?? '--'}
                        valueColor="text-status-warning"
                        unit="°C"
                      />
                    </div>

                    {/* Setpoint Form */}
                    <div className="mb-4 p-3 bg-bg-elevated/30 rounded-lg border border-border-hairline/50">
                      <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                        Temperature Setpoint
                      </p>
                      <SetpointForm
                        zoneId={zone.id}
                        currentSetpoint={hvac.setpoint}
                      />
                    </div>

                    {/* Fan Speed Buttons */}
                    <div className="mb-4 p-3 bg-bg-elevated/30 rounded-lg border border-border-hairline/50">
                      <FanSpeedButtons
                        zoneId={zone.id}
                        currentSpeed={hvac.fanSpeed}
                      />
                    </div>

                    {/* HVAC Mode Buttons */}
                    <div className="p-3 bg-bg-elevated/30 rounded-lg border border-border-hairline/50">
                      <HvacModeButtons
                        zoneId={zone.id}
                        currentMode={hvac.mode}
                      />
                    </div>

                    {/* Footer Stats */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border-hairline/50 text-xs text-muted-foreground">
                      <span>Runtime: {hvac.runHours}h</span>
                      {hvac.alarmPriority && hvac.alarmPriority > 0 ? (
                        <span className="flex items-center gap-1 text-status-critical">
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