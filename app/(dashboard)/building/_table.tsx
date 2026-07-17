'use client'

import { DataTable, type Column } from '@/components/ui/data-table'

export function BuildingOverviewTable({ rows }: { rows: any[] }) {
  const columns: Column<any>[] = [
    { header: 'Zone', cell: (z) => <span className="text-[14px] font-medium text-white">{z.zoneName}</span> },
    { header: 'Type', cell: (z) => <span className="text-[12px] text-secondary uppercase">{z.zoneType}</span> },
    { header: 'Area', cell: (z) => <span className="text-[12px] text-secondary">{z.area ? `${z.area} m²` : '—'}</span> },
    { header: 'Temp', cell: (z) => <span className="text-[14px] font-['JetBrains_Mono'] text-white">{z.temp}</span> },
    { header: 'HVAC', cell: (z) => {
      const on = z.hvacState === 'ON'
      return <span className={`text-[12px] ${on ? 'text-normal' : 'text-secondary'}`}>{z.hvacMode}</span>
    }},
    { header: 'Light', cell: (z) => {
      const has = z.dimLevel !== null
      return <span className={`text-[12px] ${has ? 'text-active' : 'text-secondary'}`}>{z.dimLevel !== null ? `${z.dimLevel}%` : '—'}</span>
    }},
    { header: 'Doors', cell: (z) => <span className="text-[12px] text-body">{z.doors}</span> },
  ]

  return (
    <DataTable
      columns={columns}
      data={rows}
      keyExtractor={(z) => z.id}
      emptyMessage="No zones found"
    />
  )
}
