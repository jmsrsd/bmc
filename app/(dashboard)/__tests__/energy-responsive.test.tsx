import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

vi.mock('@/lib/prisma', () => ({
  prisma: { building: { findUnique: vi.fn() } },
}))

vi.mock('@/lib/mock-db', () => ({
  prisma: { building: { findUnique: vi.fn() } },
}))

vi.mock('@/components/ui/page-header', () => ({
  PageHeader: ({ title }: { title: string }) =>
    React.createElement('h1', null, title),
}))

describe('EnergyPage - responsive stat grid', () => {
  it('summary section uses grid-cols-1 sm:grid-cols-3 (not bare grid-cols-3)', async () => {
    const buildingData = {
      id: 'b1',
      meters: [
        { id: 'm1', name: 'M1', type: 'E', value: 100, unit: 'kW', cumulative: 50000, readings: [] },
        { id: 'm2', name: 'M2', type: 'E', value: 200, unit: 'kW', cumulative: 70000, readings: [] },
        { id: 'm3', name: 'M3', type: 'E', value: 300, unit: 'kW', cumulative: 90000, readings: [] },
      ],
    }

    const { prisma } = await import('@/lib/prisma')
    ;(prisma.building.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(buildingData)

    const { default: EnergyPage } = await import('@/app/(dashboard)/energy/page')
    const pageElement = await EnergyPage()
    const html = renderToString(pageElement as React.ReactElement)

    // Check that bare "grid-cols-3" (no prefix) is NOT present
    // "lg:grid-cols-3" is fine — that's the meter card grid
    const tokens = html.split(/\s+/)
    const bareGridCols3 = tokens.filter((t) => t === 'grid-cols-3')
    expect(bareGridCols3).toHaveLength(0)

    // Summary must have responsive breakpoint
    expect(html).toContain('grid-cols-1')
    expect(html).toContain('sm:grid-cols-3')
  })
})
