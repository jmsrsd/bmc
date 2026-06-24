import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Building2, Bell, Wind, Zap, Thermometer, Shield, Lightbulb, Gauge } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AlarmAckForm } from '@/components/ui/alarm-ack-form'
import { PageHeader, StatCard, StatusBadge, EmptyState } from '@/components/ui/primitives'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'BMC Dashboard | Building Management Control',
  description: 'Real-time building monitoring dashboard — HVAC, lighting, security, alarms, energy, fire safety, and elevators',
}

// ─── Helpers ────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface QuickActionCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}

function QuickActionCard({ href, icon, title, description }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-6 hover:bg-bg-surface hover:border-muted-foreground/20 transition-all group"
    >
      <div className="p-3 rounded-lg bg-bg-elevated/50 w-fit mb-4 group-hover:bg-status-active/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  )
}

// ─── Page ───────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // ── Parallel data queries ───────────────────────────────────

  const [building, activeAlarms, hvacUnits, sensorCount, meters] = await Promise.all([
    prisma.building.findUnique({
      where: { id: 'b1' },
      include: { _count: { select: { zones: true } } },
    }),
    prisma.alarm.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.hVACUnit.findMany({ select: { state: true } }),
    prisma.sensor.count(),
    prisma.meter.findMany({
      where: { type: 'ELECTRIC' },
      select: { cumulative: true },
    }),
  ])

  const buildingName = building?.name ?? 'Unknown Building'
  const zoneCount = building?._count?.zones ?? 0

  const hvacOn = hvacUnits.filter((u) => u.state === 'ON').length
  const hvacFault = hvacUnits.filter((u) => u.state === 'FAULT').length
  const hvacTotal = hvacUnits.length

  const totalEnergy = meters.reduce((sum, m) => sum + m.cumulative, 0)
  const energyKw = totalEnergy.toLocaleString(undefined, { maximumFractionDigits: 0 })

  const alarmCount = activeAlarms.length

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" subtitle={buildingName} />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Building2 className="w-6 h-6 text-status-active" />}
          label="Zones"
          value={zoneCount}
        />
        <StatCard
          icon={<Bell className="w-6 h-6 text-status-critical" />}
          label="Active Alarms"
          value={alarmCount}
          highlight={alarmCount > 0}
        />
        <StatCard
          icon={<Wind className="w-6 h-6 text-status-active" />}
          label="HVAC Online"
          value={`${hvacOn} / ${hvacTotal}`}
        />
        <StatCard
          icon={<Zap className="w-6 h-6 text-status-warning" />}
          label="Energy Today"
          value={`${energyKw} kW`}
        />
      </div>

      {/* Active Alarms Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-status-critical" />
          Active Alarms
        </h2>
        {activeAlarms.length === 0 ? (
          <EmptyState title="No active alarms" />
        ) : (
          <div className="space-y-3">
            {activeAlarms.map((alarm) => (
              <div
                key={alarm.id}
                className="bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <StatusBadge status={alarm.severity as 'critical' | 'warning' | 'info' | 'normal'}>
                    {alarm.severity}
                  </StatusBadge>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{alarm.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {alarm.zoneName} · {timeAgo(alarm.createdAt)}
                    </p>
                  </div>
                </div>
                <AlarmAckForm alarmId={alarm.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            href="/building/hvac"
            icon={<Thermometer className="w-6 h-6 text-status-active" />}
            title="HVAC Control"
            description="Manage temperature, fan speed, and modes across zones"
          />
          <QuickActionCard
            href="/building/lighting"
            icon={<Lightbulb className="w-6 h-6 text-status-warning" />}
            title="Lighting"
            description="Control dim levels and scenes per zone"
          />
          <QuickActionCard
            href="/building/security"
            icon={<Shield className="w-6 h-6 text-status-normal" />}
            title="Security"
            description="Monitor and control door locks and access"
          />
          <QuickActionCard
            href="/energy"
            icon={<Gauge className="w-6 h-6 text-status-active" />}
            title="Energy"
            description="View consumption metrics and trends"
          />
        </div>
      </section>
    </div>
  )
}
