import { describe, it, expect, vi } from 'vitest'
import { sseEvent } from '../route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    zone: { findMany: vi.fn().mockResolvedValue([]) },
    sensor: { findMany: vi.fn().mockResolvedValue([]), update: vi.fn().mockResolvedValue({}) },
    hVACUnit: { findMany: vi.fn().mockResolvedValue([]) },
    lightZone: { findMany: vi.fn().mockResolvedValue([]) },
    door: { findMany: vi.fn().mockResolvedValue([]) },
    alarm: { findMany: vi.fn().mockResolvedValue([]) },
    elevator: { findMany: vi.fn().mockResolvedValue([]) },
    firePanel: { findMany: vi.fn().mockResolvedValue([]) },
    meter: { findMany: vi.fn().mockResolvedValue([]) },
  },
}))

describe('app/api/stream/building/[id]/route.ts - pure functions', () => {
  it('exports sseEvent function', () => {
    expect(sseEvent).toBeDefined()
    expect(typeof sseEvent).toBe('function')
  })

  it('formats snapshot event correctly', () => {
    const data = { buildingId: 'b1', zones: [] }
    const result = sseEvent('snapshot', data)
    expect(result).toBe('event: snapshot\ndata: {"buildingId":"b1","zones":[]}\n\n')
  })

  it('formats telemetry event correctly', () => {
    const data = { zoneId: 'z1', type: 'TEMPERATURE', value: 22.5, unit: '°C', ts: '2024-01-01T00:00:00.000Z' }
    const result = sseEvent('telemetry', data)
    expect(result).toContain('event: telemetry')
    expect(result).toContain('"zoneId":"z1"')
    expect(result).toContain('"value":22.5')
  })

  it('formats heartbeat event correctly', () => {
    const data = { ts: '2024-01-01T00:00:00.000Z', sequence: 1 }
    const result = sseEvent('heartbeat', data)
    expect(result).toBe('event: heartbeat\ndata: {"ts":"2024-01-01T00:00:00.000Z","sequence":1}\n\n')
  })

  it('handles empty object', () => {
    const result = sseEvent('test', {})
    expect(result).toBe('event: test\ndata: {}\n\n')
  })

  it('handles string data', () => {
    const result = sseEvent('message', 'hello')
    expect(result).toBe('event: message\ndata: "hello"\n\n')
  })

  it('handles null data', () => {
    const result = sseEvent('test', null)
    expect(result).toBe('event: test\ndata: null\n\n')
  })

  it('handles array data', () => {
    const result = sseEvent('list', [1, 2, 3])
    expect(result).toBe('event: list\ndata: [1,2,3]\n\n')
  })

  it('escapes newlines in JSON', () => {
    const result = sseEvent('test', { msg: 'line1\nline2' })
    expect(result).toContain('line1\\nline2')
  })
})

describe('app/api/stream/building/[id]/route.ts - GET handler', () => {
  it('exports GET function', async () => {
    const { GET } = await import('../route')
    expect(GET).toBeDefined()
    expect(typeof GET).toBe('function')
  })

  it('returns Response with text/event-stream content type', async () => {
    const { GET } = await import('../route')
    const params = Promise.resolve({ id: 'b1' })
    const response = await GET(new Request('http://localhost'), { params })
    expect(response).toBeInstanceOf(Response)
    expect(response.headers.get('Content-Type')).toBe('text/event-stream')
    expect(response.headers.get('Cache-Control')).toBe('no-cache')
    expect(response.headers.get('Connection')).toBe('keep-alive')
  })

  it('sends snapshot event on stream start', async () => {
    const { GET } = await import('../route')
    const params = Promise.resolve({ id: 'b1' })
    const response = await GET(new Request('http://localhost'), { params })
    const reader = response.body?.getReader()
    const { value } = await reader?.read()!
    const text = new TextDecoder().decode(value)
    expect(text).toContain('event: snapshot')
    expect(text).toContain('buildingId')
  })

  it('stream is a ReadableStream', async () => {
    const { GET } = await import('../route')
    const params = Promise.resolve({ id: 'b1' })
    const response = await GET(new Request('http://localhost'), { params })
    expect(response.body).toBeInstanceOf(ReadableStream)
  })

  it('stream has cancel function attached', async () => {
    const { GET } = await import('../route')
    const params = Promise.resolve({ id: 'b1' })
    const response = await GET(new Request('http://localhost'), { params })
    const stream = response.body
    // @ts-expect-error testing internal cancel property
    expect(typeof stream?.cancel).toBe('function')
  })

  it('response headers include CORS-friendly settings', async () => {
    const { GET } = await import('../route')
    const params = Promise.resolve({ id: 'b1' })
    const response = await GET(new Request('http://localhost'), { params })
    expect(response.headers.get('Cache-Control')).toBe('no-cache')
    expect(response.headers.get('Connection')).toBe('keep-alive')
  })
})