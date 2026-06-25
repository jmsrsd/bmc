import React from 'react'
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DataTable } from '../data-table'

type TestItem = { id: string; name: string; value: number }

describe('DataTable', () => {
  const columns = [
    { header: 'ID', cell: (item: TestItem) => React.createElement('span', null, item.id) },
    { header: 'Name', cell: (item: TestItem) => React.createElement('span', null, item.name) },
    { header: 'Value', cell: (item: TestItem) => React.createElement('span', null, String(item.value)) },
  ]

  it('renders column headers', () => {
    const html = renderToString(
      React.createElement(DataTable, {
        columns,
        data: [{ id: '1', name: 'Test', value: 42 }],
        keyExtractor: (item: TestItem) => item.id,
      }),
    )
    expect(html).toContain('ID')
    expect(html).toContain('Name')
    expect(html).toContain('Value')
  })

  it('renders data rows', () => {
    const html = renderToString(
      React.createElement(DataTable, {
        columns,
        data: [
          { id: '1', name: 'Alpha', value: 10 },
          { id: '2', name: 'Beta', value: 20 },
        ],
        keyExtractor: (item: TestItem) => item.id,
      }),
    )
    expect(html).toContain('Alpha')
    expect(html).toContain('Beta')
    expect(html).toContain('10')
    expect(html).toContain('20')
  })

  it('shows empty message when no data', () => {
    const html = renderToString(
      React.createElement(DataTable, {
        columns,
        data: [],
        keyExtractor: (item: TestItem) => item.id,
        emptyMessage: 'Nothing here',
      }),
    )
    expect(html).toContain('Nothing here')
  })

  it('renders table element when data exists', () => {
    const html = renderToString(
      React.createElement(DataTable, {
        columns,
        data: [{ id: '1', name: 'Test', value: 42 }],
        keyExtractor: (item: TestItem) => item.id,
      }),
    )
    expect(html).toContain('<table')
    expect(html).toContain('<thead')
    expect(html).toContain('<tbody')
  })

  it('renders custom JSX cell content', () => {
    const customColumns = [
      {
        header: 'With Badge',
        cell: (item: TestItem) =>
          React.createElement('span', { className: 'badge' }, item.name, ' badge'),
      },
    ]
    const html = renderToString(
      React.createElement(DataTable, {
        columns: customColumns,
        data: [{ id: '1', name: 'Alert', value: 1 }],
        keyExtractor: (item: TestItem) => item.id,
      }),
    )
    expect(html).toContain('Alert')
    expect(html).toContain('badge')
  })
})
