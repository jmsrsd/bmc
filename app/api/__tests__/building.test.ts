import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../building/route'

const mockFindMany = vi.hoisted(() => vi.fn())
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('@/lib/mock-db', () => ({
  prisma: {
    building: {
      findMany: mockFindMany,
      create: mockCreate,
    },
  },
}))

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/building', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/building', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with buildings array', async () => {
    const buildings = [
      { id: 'b1', name: 'Building A', address: '123 Main St' },
      { id: 'b2', name: 'Building B', address: '456 Oak Ave' },
    ]
    mockFindMany.mockResolvedValue(buildings)

    const response = await GET()

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual(buildings)
  })

  it('returns 200 with empty array', async () => {
    mockFindMany.mockResolvedValue([])

    const response = await GET()

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual([])
  })

  it('returns 500 when prisma.findMany throws', async () => {
    mockFindMany.mockRejectedValue(new Error('db error'))

    const response = await GET()

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Failed to fetch buildings' })
  })
})

describe('POST /api/building', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 201 with created building', async () => {
    const body = { name: 'New Building', address: '789 Pine St' }
    const created = { id: 'b3', ...body }
    mockCreate.mockResolvedValue(created)

    const response = await POST(makeRequest(body))

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data).toEqual(created)
    expect(mockCreate).toHaveBeenCalledWith({
      data: { name: 'New Building', address: '789 Pine St' },
    })
  })

  it('returns 500 when prisma.create throws', async () => {
    mockCreate.mockRejectedValue(new Error('db error'))

    const response = await POST(makeRequest({ name: 'X', address: 'Y' }))

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ error: 'Failed to create building' })
  })
})
