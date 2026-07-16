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
  pageSize?: number
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data',
  pageSize = 10,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1)

  if (data.length === 0) {
    return (
      <p className="text-[14px] text-secondary">{emptyMessage}</p>
    )
  }

  const totalPages = Math.ceil(data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, data.length)
  const paginatedData = data.slice(startIndex, endIndex)

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))

  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-hairline">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className="text-left text-[12px] font-medium text-secondary uppercase tracking-wider py-3 px-3 first:pl-0 last:pr-0"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="border-b border-hairline/50 last:border-b-0 hover:bg-surface/30 transition-colors"
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between py-3 border-t border-hairline mt-1">
          <span className="text-[12px] text-secondary">
            Showing {startIndex + 1}-{endIndex} of {data.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-2 py-1 min-h-[44px] text-[12px] text-secondary hover:bg-hairline disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-2 py-1 min-h-[44px] text-[12px] text-secondary hover:bg-hairline disabled:opacity-30 disabled:cursor-not-allowed rounded transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}