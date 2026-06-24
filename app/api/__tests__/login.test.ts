import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../login/route'

const mockVerifyPassword = vi.hoisted(() => vi.fn())
const mockCreateSessionCookie = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth', () => ({
  verifyPassword: mockVerifyPassword,
  createSessionCookie: mockCreateSessionCookie,
}))

function makeRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateSessionCookie.mockReturnValue({
      name: 'bmc_session',
      value: 'authenticated',
      maxAge: 43200,
      path: '/',
      httpOnly: true,
      sameSite: 'lax' as const,
    })
  })

  it('returns 200 with success on correct password', async () => {
    mockVerifyPassword.mockResolvedValue(true)
    const request = makeRequest({ password: 'secret' })

    const response = await POST(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toEqual({ success: true })
  })

  it('sets session cookie on success', async () => {
    mockVerifyPassword.mockResolvedValue(true)
    const request = makeRequest({ password: 'secret' })

    const response = await POST(request)

    const cookieHeader = response.headers.get('Set-Cookie')
    expect(cookieHeader).toContain('bmc_session=authenticated')
  })

  it('returns 401 with wrong password', async () => {
    mockVerifyPassword.mockResolvedValue(false)
    const request = makeRequest({ password: 'wrong' })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data).toEqual({ message: 'Invalid password' })
  })

  it('does not set cookie on failure', async () => {
    mockVerifyPassword.mockResolvedValue(false)
    const request = makeRequest({ password: 'wrong' })

    const response = await POST(request)

    expect(response.headers.get('Set-Cookie')).toBeNull()
  })

  it('returns 400 with missing password', async () => {
    const request = makeRequest({})

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ message: 'Password is required' })
  })

  it('returns 400 with empty string password', async () => {
    const request = makeRequest({ password: '' })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data).toEqual({ message: 'Password is required' })
  })

  it('returns 500 when verifyPassword throws', async () => {
    mockVerifyPassword.mockRejectedValue(new Error('db error'))
    const request = makeRequest({ password: 'secret' })

    const response = await POST(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data).toEqual({ message: 'Internal server error' })
  })
})
