import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Zap, Flame, Droplets, Activity } from 'lucide-react'
import { redirect } from 'next/navigation'

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
  ELECTRIC: 'text-blue-500',
  GAS: 'text-amber-500',
  WATER: 'text-cyan-500',
}

const meterBarColors: Record<string, string> = {
  ELECTRIC: 'bg-blue-500',
  GAS: 'bg-amber-500',
  WATER: 'bg-cyan-500',
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
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Energy Management</h1>
        <p className="text-gray-400 mt-1">
          {meters.length} meter{meters.length !== 1 ? 's' : ''} monitored
        </p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Total Cumulative</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {totalCumulative.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
            <span className="text-sm font-normal text-gray-400">kWh</span>
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Current Load</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {totalCurrentLoad.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
            <span className="text-sm font-normal text-gray-400">kW</span>
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-1">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Meters Online</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {meters.length}{' '}
            <span className="text-sm font-normal text-gray-400">active</span>
          </p>
        </div>
      </div>

      {/* Per-Meter Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {meters.map((meter) => {
          const readings = meter.readings.slice(0, 48).reverse()
          const maxReading = Math.max(...readings.map((r) => r.value), 1)

          return (
            <div
              key={meter.id}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5"
            >
              {/* Meter Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={meterColors[meter.type] ?? 'text-gray-400'}>
                    {meterIcons[meter.type] ?? <Activity className="h-5 w-5" />}
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{meter.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{meter.type.toLowerCase()}</p>
                  </div>
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Current</p>
                  <p className="text-xl font-bold text-white">
                    {meter.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                    <span className="text-sm font-normal text-gray-400">{meter.unit}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cumulative</p>
                  <p className="text-xl font-bold text-white">
                    {meter.cumulative.toLocaleString(undefined, { maximumFractionDigits: 1 })}{' '}
                    <span className="text-sm font-normal text-gray-400">kWh</span>
                  </p>
                </div>
              </div>

              {/* Bar Chart */}
              {readings.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">
                    Last {readings.length > 24 ? '48' : readings.length} readings
                  </p>
                  <div className="flex items-end gap-[2px] h-20">
                    {readings.map((r) => {
                      const heightPct = (r.value / maxReading) * 100
                      return (
                        <div
                          key={r.id}
                          className={`flex-1 rounded-sm ${meterBarColors[meter.type] ?? 'bg-gray-600'}`}
                          style={{ height: `${Math.max(heightPct, 2)}%` }}
                          title={`${r.value} ${meter.unit} at ${r.timestamp.toLocaleString()}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {readings.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  No readings yet
                </p>
              )}
            </div>
          )
        })}
      </div>

      {meters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Zap className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-lg font-medium">No meters configured</p>
          <p className="text-sm">Add meters to start tracking energy usage.</p>
        </div>
      )}
    </div>
  )
}
