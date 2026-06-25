import { describe, it, expect, vi, beforeEach } from 'vitest'
import { middleware } from '../../middleware'

function createNextResponse(init?: ResponseInit) {
  return new Response(null, init)
}

vi.mock('next/server', () => {
  const redirect = vi.fn((url) => ({
    status: 307,
    headers: new Headers({ Location: url.toString() }),
    redirected: true,
  }))
  const next = vi.fn(() => ({ status: 200, headers: new Headers() }))
  return {
    NextResponse: { redirect, next },
  }
})

function mockRequest(url: string, cookieValue?: string) {
  return {
    nextUrl: new URL(url, 'http://localhost:3000'),
    cookies: {
      get: vi.fn(() =>
        cookieValue ? { name: 'bmc_session', value: cookieValue } : undefined
      ),
    },
    url: `http://localhost:3000${url}`,
  } as any
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows /api/login path (public)', () => {
    const req = mockRequest('/api/login')
    const result = middleware(req)
    expect(result.status).toBe(200) // NextResponse.next()
  })

  it('allows /api/logout path (public)', () => {
    const req = mockRequest('/api/logout')
    const result = middleware(req)
    expect(result.status).toBe(200)
  })

  it('allows /_next/static path (public)', () => {
    const req = mockRequest('/_next/static/chunk.js')
    const result = middleware(req)
    expect(result.status).toBe(200)
  })

  it('allows /favicon.ico (public)', () => {
    const req = mockRequest('/favicon.ico')
    const result = middleware(req)
    expect(result.status).toBe(200)
  })

  it('returns 401 when no session cookie', () => {
    const req = mockRequest('/api/buildings/b1')
    const result = middleware(req)
    expect(result.status).toBe(401)
  })

  it('returns 401 when session cookie has wrong value', () => {
    const req = mockRequest('/api/buildings/b1', 'not-authenticated')
    const result = middleware(req)
    expect(result.status).toBe(401)
  })

  it('passes through when authenticated session cookie exists', () => {
    const req = mockRequest('/api/buildings/b1', 'authenticated')
    const result = middleware(req)
    expect(result.status).toBe(200) // NextResponse.next()
  })
})
