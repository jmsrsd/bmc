import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { AcknowledgeButton } from './ack-button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Alarms | BMC',
  description: 'Active alarm center — severity filtering and acknowledgement',
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const severityBorder: Record<string, string> = {
  critical: 'border-l-red-500',
  warning: 'border-l-yellow-500',
  info: 'border-l-blue-500',
}

const severityBadge: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  info: 'bg-blue-500/10 text-blue-500',
}

const statusBadge: Record<string, string> = {
  open: 'bg-yellow-500/10 text-yellow-500',
  acknowledged: 'bg-blue-500/10 text-blue-500',
  resolved: 'bg-green-500/10 text-green-500',
}

const statusFilters = [
  { label: 'All', value: undefined },
  { label: 'Open', value: 'open' },
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Resolved', value: 'resolved' },
] as const

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
        <h1 className="text-3xl font-bold text-white">Alarm Center</h1>
        <p className="text-gray-400 mt-1">
          {totalCount} total · {activeCount} active
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gray-700">
        {statusFilters.map((f) => {
          const href = f.value ? `/alarms?status=${f.value}` : '/alarms'
          const active = statusFilter === f.value || (!statusFilter && !f.value)
          return (
            <Link
              key={f.label}
              href={href}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? 'border-cyan-400 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {/* Alarm List */}
      {alarms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <AlertTriangle className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-lg font-medium">No alarms</p>
          <p className="text-sm">All clear — no {statusFilter ?? ''} alarms to show.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`bg-gray-800/50 backdrop-blur border border-gray-700 border-l-4 ${severityBorder[alarm.severity] ?? 'border-l-gray-700'} rounded-xl p-4`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        severityBadge[alarm.severity] ?? 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {alarm.severity}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {alarm.type}
                    </span>
                    {alarm.zoneName && (
                      <span className="text-sm text-gray-400">
                        · {alarm.zoneName}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-200">{alarm.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500">
                      {relativeTime(alarm.createdAt)}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        statusBadge[alarm.status] ?? 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {alarm.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0">
                  {alarm.status === 'open' && (
                    <AcknowledgeButton alarmId={alarm.id} />
                  )}
                  {alarm.status === 'acknowledged' && alarm.acknowledgedAt && (
                    <div className="text-xs text-gray-400 text-right">
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
