'use client'

import { DataTable, type Column } from '@/components/ui/data-table'
import { AckButton } from './ack-button'
import { severityColor, relativeTime, type AlarmRow } from './_helpers'

export const columns: Column<AlarmRow>[] = [
  {
    header: 'Severity',
    cell: (alarm) => (
      <span
        className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: severityColor(alarm.severity) }}
      />
    ),
    className: 'w-12',
  },
  {
    header: 'Message',
    cell: (alarm) => alarm.message,
  },
  {
    header: 'Zone',
    cell: (alarm) => alarm.zoneName,
    className: 'w-40',
  },
  {
    header: 'Source',
    cell: (alarm) => alarm.source,
    className: 'w-32',
  },
  {
    header: 'Time',
    cell: (alarm) => (
      <span className="text-[12px] text-secondary whitespace-nowrap">
        {relativeTime(alarm.createdAt)}
      </span>
    ),
    className: 'w-28',
  },
  {
    header: '',
    cell: (alarm) => alarm.showAck ? <AckButton alarmId={alarm.id} /> : null,
    className: 'w-28 text-right',
  },
]

export function AlarmSection({ title, alarms, showAck }: { title: string; alarms: any[]; showAck?: boolean }) {
  const rows: AlarmRow[] = alarms.map((a) => ({ ...a, showAck }))

  return (
    <div className="mt-6 first:mt-0">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-[18px] font-semibold text-white">{title}</h2>
        <span className="text-[12px] font-medium text-secondary bg-elevated px-2 py-0.5 rounded-full">
          {alarms.length}
        </span>
      </div>
      <DataTable
        columns={columns}
        data={rows}
        keyExtractor={(a) => a.id}
        emptyMessage="No alarms"
      />
    </div>
  )
}
