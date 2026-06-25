import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../[id]/route'

const mockFindUnique = vi.hoisted(() => vi.fn())
const mockFindManyAlarms = vi.hoisted(() => vi.fn())

vi.mock('@/lib/prisma', () => ({
  prisma: {
    building: {
      findUnique: mockFindUnique,
    },
    alarm: {
      findMany: mockFindManyAlarms,
    },
  },
}))

describe('GET /api/buildings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with building including zones, sensors, alarms', async () => {
    const building = {
      id: 'b1',
      name: 'Building A',
      address: '123 Main St',
      zones: [
        {
          id: 'z1',
          name: 'Zone 1',
          sensors: [{ id: 's1', type: 'temperature' }],
          hvacUnits: [],
          lightZones: [],
          doors: [],
        },
      ],
      elevators: [],
      firePanels: [],
      meters: [],
      cameras: [],
      tenants: [],
    }
    const alarms = [{ id: 'a1', buildingId: 'b1', message: 'Fire alarm' }]
    mockFindUnique.mockResolvedValue(building)
    mockFindManyAlarms.mockResolvedValue(alarms)

    const response = await GET(
      new Request('http://localhost:3000/api/buildings/b1'),
      { params: Promise.resolve({ id: 'b1' }) }
    )

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.id).toBe('b1')
    expect(data.zones).toHaveLength(1)
    expect(data.alarms).toEqual(alarms)
  })

  it('returns 404 when building not found', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(
      new Request('http://localhost:3000/api/buildings/bogus'),
      { params: Promise.resolve({ id: 'bogus' }) }
    )

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data).toEqual({ error: 'Building not found' })
  })

  it('returns 500 on prisma error', async () => {
    mockFindUnique.mockRejectedValue(new Error('db error'))

    const response = await GET(
      new Request('http://localhost:3000/api/buildings/b1'),
      { params: Promise.resolve({ id: 'b1' }) }
    )

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Failed to fetch building' })
  })
})