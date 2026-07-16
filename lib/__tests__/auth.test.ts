import { describe, it, expect, vi } from 'vitest'
import { cookies } from 'next/headers'

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

import { getSession, verifyPassword, createSessionCookie, clearSessionCookie, checkAccess } from '../auth.ts'

describe('lib/auth.ts', () => {
  const mockCookies = vi.mocked(cookies)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSession', () => {
    it('returns session when cookie is valid', async () => {
      mockCookies.mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'authenticated' }),
      } as any)

      const session = await getSession()
      expect(session).not.toBeNull()
      expect(session?.user.id).toBe('demo-user')
      expect(session?.user.role).toBe('admin')
    })

    it('returns null when cookie is missing', async () => {
      mockCookies.mockResolvedValue({
        get: vi.fn().mockReturnValue(undefined),
      } as any)

      const session = await getSession()
      expect(session).toBeNull()
    })

    it('returns null when cookie value is wrong', async () => {
      mockCookies.mockResolvedValue({
        get: vi.fn().mockReturnValue({ value: 'wrong' }),
      } as any)

      const session = await getSession()
      expect(session).toBeNull()
    })
  })

  describe('verifyPassword', () => {
    it('returns true for correct password', async () => {
      const result = await verifyPassword('bmc2024')
      expect(result).toBe(true)
    })

    it('returns false for incorrect password', async () => {
      const result = await verifyPassword('wrong')
      expect(result).toBe(false)
    })

    it('returns false for empty password', async () => {
      const result = await verifyPassword('')
      expect(result).toBe(false)
    })
  })

  describe('createSessionCookie', () => {
    it('returns correct cookie config', () => {
      const cookie = createSessionCookie()
      expect(cookie.name).toBe('bmc_session')
      expect(cookie.value).toBe('authenticated')
      expect(cookie.maxAge).toBe(60 * 60 * 12)
      expect(cookie.path).toBe('/')
      expect(cookie.httpOnly).toBe(true)
      expect(cookie.sameSite).toBe('lax')
    })
  })

  describe('clearSessionCookie', () => {
    it('returns correct cookie config for clearing', () => {
      const cookie = clearSessionCookie()
      expect(cookie.name).toBe('bmc_session')
      expect(cookie.value).toBe('')
      expect(cookie.maxAge).toBe(0)
      expect(cookie.path).toBe('/')
    })
  })

  describe('checkAccess', () => {
    const adminUser = { id: '1', role: 'admin' as const, name: 'Admin' }
    const operatorUser = { id: '2', role: 'operator' as const, name: 'Operator' }
    const viewerUser = { id: '3', role: 'viewer' as const, name: 'Viewer' }

    it('throws when user is null', () => {
      expect(() => checkAccess(null)).toThrow('Unauthenticated')
    })

    it('allows when no minRole specified', () => {
      expect(() => checkAccess(viewerUser)).not.toThrow()
    })

    it('allows admin for any role', () => {
      expect(() => checkAccess(adminUser, undefined, 'admin')).not.toThrow()
      expect(() => checkAccess(adminUser, undefined, 'operator')).not.toThrow()
      expect(() => checkAccess(adminUser, undefined, 'viewer')).not.toThrow()
    })

    it('allows operator for operator and viewer', () => {
      expect(() => checkAccess(operatorUser, undefined, 'operator')).not.toThrow()
      expect(() => checkAccess(operatorUser, undefined, 'viewer')).not.toThrow()
    })

    it('throws when operator tries admin', () => {
      expect(() => checkAccess(operatorUser, undefined, 'admin')).toThrow('Forbidden')
    })

    it('allows viewer for viewer only', () => {
      expect(() => checkAccess(viewerUser, undefined, 'viewer')).not.toThrow()
    })

    it('throws when viewer tries operator', () => {
      expect(() => checkAccess(viewerUser, undefined, 'operator')).toThrow('Forbidden')
    })

    it('throws when viewer tries admin', () => {
      expect(() => checkAccess(viewerUser, undefined, 'admin')).toThrow('Forbidden')
    })
  })
})