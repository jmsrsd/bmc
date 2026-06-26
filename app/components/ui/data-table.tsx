import React from 'react'

export type Column<T> = {
  header: string
  cell: (item: T) => React.ReactNode
  className?: string
}

type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (item: T) => string
  emptyMessage?: string
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <p className="text-[14px] text-[#8E8E93]">{emptyMessage}</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#242427]">
            {columns.map((col) => (
              <th
                key={col.header}
                className="text-left text-[12px] font-medium text-[#8E8E93] uppercase tracking-wider py-3 px-3 first:pl-0 last:pr-0"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className="border-b border-[#242427]/50 last:border-b-0 hover:bg-[#121214]/30 transition-colors"
            >
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={`py-3 px-3 first:pl-0 last:pr-0 ${col.className ?? ''}`}
                >
                  <span className="text-[14px] text-white">
                    {col.cell(item)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
