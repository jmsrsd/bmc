import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock Prisma ──────────────────────────────────────────────

const mockPrisma = {
  zone: { findMany: vi.fn() },
  meter: { findMany: vi.fn() },
  alarm: { findMany: vi.fn() },
  elevator: { findMany: vi.fn() },
  camera: { findMany: vi.fn() },
  firePanel: { findMany: vi.fn() },
  building: { findUnique: vi.fn() },
}
vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

// ─── Mock Auth ────────────────────────────────────────────────

let mockSession: any = { user: { id: 'test-user', role: 'admin', name: 'Test' } }
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(() => mockSession),
}))

// ─── Dynamic import helper ────────────────────────────────────

async function getRoute() {
  return await import('../ui-config/route')
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSession = { user: { id: 'test-user', role: 'admin', name: 'Test' } }
})

// ─── GET /api/buildings/[id]/ui-config ────────────────────────

describe('GET /api/buildings/[id]/ui-config', () => {
  it('returns 200 with valid UiConfigResponse', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { GET } = await getRoute()
    const req = new Request('http://localhost/api/buildings/b1/ui-config') as any
    const res = await GET(req, { params: Promise.resolve({ id: 'b1' }) })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({
      version: 1,
      buildingId: 'b1',
      buildingName: 'Test Building',
      zones: [],
      global: [],
      navLinks: [],
    })
  })

  it('returns 401 when no session', async () => {
    mockSession = null

    const { GET } = await getRoute()
    const req = new Request('http://localhost/api/buildings/b1/ui-config') as any
    const res = await GET(req, { params: Promise.resolve({ id: 'b1' }) })

    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toHaveProperty('error')
  })

  it('includes correct response headers', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { GET } = await getRoute()
    const req = new Request('http://localhost/api/buildings/b1/ui-config') as any
    const res = await GET(req, { params: Promise.resolve({ id: 'b1' }) })

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/json')
    expect(res.headers.get('etag')).toBeTruthy()
    expect(res.headers.get('x-sdui-version')).toBe('1')
    expect(res.headers.get('cache-control')).toBe('no-cache, must-revalidate')
  })

  it('returns 304 on matching If-None-Match', async () => {
    mockPrisma.zone.findMany.mockResolvedValue([])
    mockPrisma.meter.findMany.mockResolvedValue([])
    mockPrisma.alarm.findMany.mockResolvedValue([])
    mockPrisma.elevator.findMany.mockResolvedValue([])
    mockPrisma.camera.findMany.mockResolvedValue([])
    mockPrisma.firePanel.findMany.mockResolvedValue([])
    mockPrisma.building.findUnique.mockResolvedValue({ name: 'Test Building' })

    const { GET } = await getRoute()

    // First request to capture ETag
    const req1 = new Request('http://localhost/api/buildings/b1/ui-config') as any
    const res1 = await GET(req1, { params: Promise.resolve({ id: 'b1' }) })
    const etag = res1.headers.get('etag')
    expect(etag).toBeTruthy()

    // Second request with If-None-Match
    const req2 = new Request('http://localhost/api/buildings/b1/ui-config', {
      headers: { 'If-None-Match': etag! },
    }) as any
    const res2 = await GET(req2, { params: Promise.resolve({ id: 'b1' }) })

    expect(res2.status).toBe(304)
    expect(await res2.text()).toBe('')
  })
})
