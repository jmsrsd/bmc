'use client'

import React from 'react'
import { TableVirtuoso } from 'react-virtuoso'

export type Column = {
  header: string
  className?: string
}

type DataTableProps = {
  columns: Column[]
  data: { id: string; cells: React.ReactNode[] }[]
  emptyMessage?: string
}

/**
 * DataTable — virtual-scrolled table using TableVirtuoso.
 * Cells are pre-rendered server-side and passed as flat ReactNode[] per row.
 * Uses useWindowScroll for inline page-scroll.
 */
export function DataTable({
  columns,
  data,
  emptyMessage = 'No data',
}: DataTableProps) {
  if (data.length === 0) {
    return (
      <p className="text-[14px] text-[#8E8E93]">{emptyMessage}</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <TableVirtuoso
        data={data}
        useWindowScroll
        fixedHeaderContent={() => (
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className="text-left text-[12px] font-medium text-[#8E8E93] uppercase tracking-wider py-3 px-3 first:pl-0 last:pr-0 border-b border-[#242427]"
              >
                {col.header}
              </th>
            ))}
          </tr>
        )}
        itemContent={(_index, item) => (
          <>
            {item.cells.map((cell, i) => (
              <td
                key={i}
                className={`py-3 px-3 first:pl-0 last:pr-0 border-b border-[#242427]/50 ${columns[i]?.className ?? ''}`}
              >
                <span className="text-[14px] text-white">
                  {cell}
                </span>
              </td>
            ))}
          </>
        )}
      />
    </div>
  )
}
