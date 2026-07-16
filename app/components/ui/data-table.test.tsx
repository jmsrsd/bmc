import { describe, it, expect } from 'vitest'
import { DataTable } from './data-table'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

describe('app/components/ui/data-table.tsx', () => {
  const columns = [
    { header: 'Name', cell: (item: any) => item.name, className: 'w-40' },
    { header: 'Value', cell: (item: any) => item.value },
  ]

  it('DataTable is exported', () => {
    expect(DataTable).toBeDefined()
    expect(typeof DataTable).toBe('function')
  })

  it('renders empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} keyExtractor={(i) => i.id} emptyMessage="No items" />)
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('renders table with data', () => {
    const data = [{ id: '1', name: 'Item 1', value: '100' }, { id: '2', name: 'Item 2', value: '200' }]
    render(<DataTable columns={columns} data={data} keyExtractor={(i) => i.id} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('200')).toBeInTheDocument()
  })

  it('renders headers', () => {
    const data = [{ id: '1', name: 'Item 1', value: '100' }]
    render(<DataTable columns={columns} data={data} keyExtractor={(i) => i.id} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Value')).toBeInTheDocument()
  })

  it('paginates when data exceeds pageSize', () => {
    const data = Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1), name: `Item ${i + 1}`, value: String(i + 1) }))
    render(<DataTable columns={columns} data={data} keyExtractor={(i) => i.id} pageSize={10} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 10')).toBeInTheDocument()
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument()
  })

  it('shows pagination controls when multiple pages', () => {
    const data = Array.from({ length: 15 }, (_, i) => ({ id: String(i + 1), name: `Item ${i + 1}`, value: String(i + 1) }))
    render(<DataTable columns={columns} data={data} keyExtractor={(i) => i.id} pageSize={10} />)
    expect(screen.getByText('← Prev')).toBeInTheDocument()
    expect(screen.getByText('Next →')).toBeInTheDocument()
    expect(screen.getByText(/Showing 1-10 of 15/)).toBeInTheDocument()
  })

  it('applies custom className to cells', () => {
    const customColumns = [
      { header: 'Name', cell: (item: any) => item.name, className: 'custom-class' },
    ]
    const data = [{ id: '1', name: 'Item 1' }]
    render(<DataTable columns={customColumns} data={data} keyExtractor={(i) => i.id} />)
    const cell = screen.getByText('Item 1').closest('td')
    expect(cell?.className).toContain('custom-class')
  })
})