import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Zap, Flame, Droplets, Activity } from 'lucide-react'
import { BackLink, PageHeader, StatCard, EmptyState } from '@/components/ui/primitives'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Energy Monitoring | BMC',
  description: 'Real-time energy consumption — electric, water, gas, and HVAC meters',
}

const meterIcons: Record<string, React.ReactNode> = {
  ELECTRIC: <Zap className="h-5 w-5" />,
  GAS: <Flame className="h-5 w-5" />,
  WATER: <Droplets className="h-5 w-5" />,
}

const meterColors: Record<string, string> = {
  ELECTRIC: 'text-status-active',
  GAS: 'text-status-warning',
  WATER: 'text-status-active',
}

const meterBarColors: Record<string, string> = {
  ELECTRIC: 'bg-status-active',
  GAS: 'bg-status-warning',
  WATER: 'bg-status-active',
}

async function getMeters() {
  return prisma.meter.findMany({
    include: {
      readings: {
        orderBy: { timestamp: 'desc' },
        take: 48,
      },
    },
  })
}

export default async function EnergyPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const meters = await getMeters()

  const totalCumulative = meters.reduce((sum, m) => sum + m.cumulative, 0)
  const totalCurrentLoad = meters.reduce((sum, m) => sum + m.value, 0)

  return (
    <div className="space-y-6">
      <BackLink href="/" />

      <PageHeader
        title="Energy Management"
        subtitle={`${meters.length} meter${meters.length !== 1 ? 's' : ''} monitored`}
      />

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Total Cumulative"
          value={`${totalCumulative.toLocaleString(undefined, { maximumFractionDigits: 1 })} kWh`}
        />
        <StatCard
          icon={<Zap className="h-4 w-4" />}
          label="Current Load"
          value={`${totalCurrentLoad.toLocaleString(undefined, { maximumFractionDigits: 1 })} kW`}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Meters Online"
          value={`${meters.length} active`}
        />
      </div>

      {/* Per-Meter Breakdown */}
      {meters.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-12 w-12" />}
          title="No meters configured"
          description="Add meters to start tracking energy usage."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {meters.map((meter) => {
            const readings = meter.readings.slice(0, 48).reverse()
            const maxReading = Math.max(...readings.map((r) => r.value), 1)

            return (
              <div
                key={meter.id}
                className="bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-5"
              >
                {/* Meter Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={meterColors[meter.type] ?? 'text-muted-foreground'}>
                      {meterIcons[meter.type] ?? <Activity className="h-5 w-5" />}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{meter.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{meter.type.toLowerCase()}</p>
                    </div>
                  </div>
                </div>

                {/* Values */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-xl font-bold text-white font-mono">
                      {meter.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                      <span className="text-sm font-normal text-muted-foreground">{meter.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cumulative</p>
                    <p className="text-xl font-bold text-white font-mono">
                      {meter.cumulative.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                      <span className="text-sm font-normal text-muted-foreground">kWh</span>
                    </p>
                  </div>
                </div>

                {/* Bar Chart */}
                {readings.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Last {readings.length > 24 ? '48' : readings.length} readings
                    </p>
                    <div className="flex items-end gap-[2px] h-20">
                      {readings.map((r) => {
                        const heightPct = (r.value / maxReading) * 100
                        return (
                          <div
                            key={r.id}
                            className={`flex-1 rounded-sm ${meterBarColors[meter.type] ?? 'bg-bg-elevated'}`}
                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                            title={`${r.value} ${meter.unit} at ${r.timestamp.toLocaleString()}`}
                          />
                        )
                      })}
                    </div>
                  </div>
                )}

                {readings.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No readings yet
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
