import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { DataTable } from '../data-table'

// Mock react-virtuoso for node-environment SSR tests.
vi.mock('react-virtuoso', () => {
  const React = require('react')
  return {
    TableVirtuoso: ({ data, fixedHeaderContent, itemContent }: any) => {
      const header = fixedHeaderContent ? fixedHeaderContent() : null
      const rows = data && data.length > 0
        ? data.map((item: any, i: number) =>
            React.createElement('tr', { key: i },
              itemContent(i, item)
            )
          )
        : null
      return React.createElement('div', { className: 'mock-virtuoso' },
        React.createElement('table', { style: { borderSpacing: 0 } },
          React.createElement('thead', null, header),
          React.createElement('tbody', null, rows),
        ),
      )
    },
  }
})

describe('DataTable', () => {
  const columns = [
    { header: 'ID' },
    { header: 'Name' },
    { header: 'Value' },
  ]

  it('renders column headers', () => {
    const html = renderToString(
      React.createElement(DataTable, {
        columns,
        data: [{ id: '1', cells: [React.createElement('span', { key: 1 }, '1'), React.createElement('span', { key: 2 }, 'Test'), React.createElement('span', { key: 3 }, '42')] }],
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
          { id: '1', cells: [React.createElement('span', { key: 1 }, 'Alpha'), React.createElement('span', { key: 2 }, '10')] },
          { id: '2', cells: [React.createElement('span', { key: 1 }, 'Beta'), React.createElement('span', { key: 2 }, '20')] },
        ],
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
        emptyMessage: 'Nothing here',
      }),
    )
    expect(html).toContain('Nothing here')
  })

  it('renders table element when data exists', () => {
    const html = renderToString(
      React.createElement(DataTable, {
        columns,
        data: [{ id: '1', cells: [React.createElement('span', { key: 1 }, '1')] }],
      }),
    )
    expect(html).toContain('<table')
    expect(html).toContain('<thead')
    expect(html).toContain('<tbody')
  })
})
