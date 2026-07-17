'use client'

import { DataTable } from '@/components/ui/data-table'
import { buildSecurityRows } from './_helpers'
import { columns } from './_components'

export function SecurityTable({ building }: { building: any }) {
  const rows = buildSecurityRows(building)

  return (
    <DataTable
      columns={columns}
      data={rows}
      keyExtractor={(d) => d.id}
      emptyMessage="No doors found"
    />
  )
}
