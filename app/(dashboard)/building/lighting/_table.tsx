'use client'

import { DataTable, type Column } from '@/components/ui/data-table'
import { LightingControls } from './lighting-controls'

export function LightingTable({ rows }: { rows: any[] }) {
  const columns: Column<any>[] = [
    { header: 'Zone', cell: (z) => <span className="text-[14px] font-medium text-white">{z.zoneName}</span> },
    { header: 'Floor', cell: (z) => <span className="text-[12px] text-secondary">{z.floor >= 0 ? `F${z.floor}` : `B${Math.abs(z.floor)}`}</span> },
    { header: 'Scene', cell: (z) => <span className="text-[12px] text-body">{z.scene}</span> },
    { header: 'Controls', cell: (z) => <LightingControls zoneId={z.id} initialDim={z.dimLevel} initialState={z.state} /> },
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
