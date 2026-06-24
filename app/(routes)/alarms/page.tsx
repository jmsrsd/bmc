import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AlertTriangle } from 'lucide-react'
import { AcknowledgeButton } from './ack-button'
import {
  BackLink,
  PageHeader,
  FilterTabs,
  EmptyState,
  StatusBadge,
} from '@/components/ui/primitives'
import { relativeTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Alarms | BMC',
  description: 'Active alarm center — severity filtering and acknowledgement',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const severityBorder: Record<string, string> = {
  critical: 'border-l-status-critical',
  warning: 'border-l-status-warning',
  info: 'border-l-status-active',
}

export default async function AlarmsPage(props: { searchParams: SearchParams }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const searchParams = await props.searchParams
  const statusFilter = typeof searchParams?.status === 'string' ? searchParams.status : undefined

  const where = statusFilter && ['open', 'acknowledged', 'resolved'].includes(statusFilter)
    ? { status: statusFilter }
    : {}

  const [alarms, totalCount] = await Promise.all([
    prisma.alarm.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.alarm.count(),
  ])

  const activeCount = await prisma.alarm.count({ where: { status: 'open' } })

  const tabs = [
    { label: 'All', href: '/alarms', active: !statusFilter },
    { label: 'Open', href: '/alarms?status=open', active: statusFilter === 'open' },
    { label: 'Acknowledged', href: '/alarms?status=acknowledged', active: statusFilter === 'acknowledged' },
    { label: 'Resolved', href: '/alarms?status=resolved', active: statusFilter === 'resolved' },
  ]

  return (
    <div className="space-y-6">
      <BackLink href="/" label="Dashboard" />
      <PageHeader
        title="Alarm Center"
        subtitle={`${totalCount} total · ${activeCount} active`}
      />
      <FilterTabs tabs={tabs} />

      {alarms.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title="No alarms"
          description={`All clear — no ${statusFilter ?? ''} alarms to show.`}
        />
      ) : (
        <div className="space-y-3">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`bg-bg-surface/50 backdrop-blur border border-border-hairline border-l-4 ${severityBorder[alarm.severity] ?? 'border-l-border-hairline'} rounded-xl p-4`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={alarm.severity as 'critical' | 'warning' | 'info' | 'normal'}>
                      {alarm.severity}
                    </StatusBadge>
                    <span className="text-sm font-medium text-white">
                      {alarm.type}
                    </span>
                    {alarm.zoneName && (
                      <span className="text-sm text-muted-foreground">
                        · {alarm.zoneName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{alarm.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(alarm.createdAt)}
                    </span>
                    <StatusBadge status={alarm.status === 'open' ? 'warning' : alarm.status === 'acknowledged' ? 'info' : 'normal'}>
                      {alarm.status}
                    </StatusBadge>
                  </div>
                </div>

                <div className="shrink-0">
                  {alarm.status === 'open' && (
                    <AcknowledgeButton alarmId={alarm.id} />
                  )}
                  {alarm.status === 'acknowledged' && alarm.acknowledgedAt && (
                    <div className="text-xs text-muted-foreground text-right">
                      <p>Acknowledged</p>
                      <p className="mt-0.5">{relativeTime(alarm.acknowledgedAt)}</p>
                      {alarm.acknowledgedBy && (
                        <p className="mt-0.5">by {alarm.acknowledgedBy}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
