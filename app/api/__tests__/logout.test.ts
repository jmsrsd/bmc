import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../logout/route'

const mockClearSessionCookie = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({
  clearSessionCookie: mockClearSessionCookie,
}))

describe('POST /api/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockClearSessionCookie.mockReturnValue({
      name: 'bmc_session',
      value: '',
      maxAge: 0,
      path: '/',
    })
  })

  it('returns 200 with success true', async () => {
    const response = await POST()

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ success: true })
  })

  it('clears session cookie (maxAge: 0)', async () => {
    const response = await POST()

    const cookieHeader = response.headers.get('Set-Cookie')
    expect(cookieHeader).toContain('bmc_session=')
    expect(cookieHeader).toContain('Max-Age=0')
  })
})
