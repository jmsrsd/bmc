import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { DataTable, type Column } from '@/components/ui/data-table'
import { AckButton } from './ack-button'
import { ALARM_SEVERITY_COLORS } from '@/lib/ui-tokens/status'

function relativeTime(date: Date) {
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-ID', { month: 'short', day: 'numeric' })
}

const columns: Column[] = [
  { header: 'Severity', className: 'w-12' },
  { header: 'Message' },
  { header: 'Zone', className: 'w-40' },
  { header: 'Source', className: 'w-32' },
  { header: 'Time', className: 'w-28' },
  { header: '', className: 'w-28 text-right' },
]

function AlarmSection({ title, alarms, showAck }: { title: string; alarms: any[]; showAck?: boolean }) {
  const rows = alarms.map((a: any) => ({
    id: a.id,
    cells: [
      <span
        key="sev"
        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: ALARM_SEVERITY_COLORS[a.severity] ?? '#8E8E93' }}
      />,
      a.message,
      a.zoneName,
      a.source,
      <span key="time" className="text-[12px] text-[#8E8E93] whitespace-nowrap">
        {relativeTime(a.createdAt)}
      </span>,
      showAck ? <AckButton alarmId={a.id} /> : null,
    ],
  }))

  return (
    <div className="mt-6 first:mt-0">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[18px] font-semibold text-white">{title}</h2>
        <span className="text-[12px] font-medium text-[#8E8E93] bg-[#1C1C1E] px-2 py-0.5 rounded-full">
          {alarms.length}
        </span>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        emptyMessage="No alarms"
      />
    </div>
  )
}

export default async function AlarmsPage() {
  const alarms = await prisma.alarm.findMany({
    where: { buildingId: 'b1' },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const openAlarms = alarms.filter((a) => a.status === 'open')
  const acknowledgedAlarms = alarms.filter((a) => a.status === 'acknowledged')

  return (
    <div>
      <PageHeader title="Alarms" subtitle="Active and acknowledged alerts" />
      <div className="mt-6">
        <AlarmSection title="Open Alarms" alarms={openAlarms} showAck />
        <AlarmSection title="Acknowledged" alarms={acknowledgedAlarms} />
      </div>
    </div>
  )
}
