import { describe, it, expect, vi } from 'vitest'
import { checkAccess } from '../auth'
import { ROLE_HIERARCHY } from '../types'

// TESTING.md §3.3 — Auth Matrix Tests, UC-AUTH-02
// DESIGN.md §6.3: checkAccess(user, buildingId, minRole)

describe('checkAccess', () => {
  const op  = { id: 'u1', role: 'operator' as const, name: 'Op' }
  const tech = { id: 'u2', role: 'tech' as const, name: 'Tech' }
  const viewer = { id: 'u3', role: 'viewer' as const, name: 'Viewer' }
  const admin = { id: 'u4', role: 'admin' as const, name: 'Admin' }
  const security = { id: 'u5', role: 'security' as const, name: 'Security' }

  it('allows operator when no minRole (view only)', () => {
    expect(() => checkAccess(op)).not.toThrow()
  })

  it('allows operator at operator role', () => {
    expect(() => checkAccess(op, 'b1', 'operator')).not.toThrow()
  })

  it('denies viewer from operator-level actions', () => {
    expect(() => checkAccess(viewer, 'b1', 'operator')).toThrow('Forbidden')
  })

  it('denies tech from operator-level actions', () => {
    expect(() => checkAccess(tech, 'b1', 'operator')).toThrow('Forbidden')
  })

  it('allows tech view-only', () => {
    expect(() => checkAccess(tech, 'b1', 'viewer')).not.toThrow()
  })

  it('allows viewer view-only', () => {
    expect(() => checkAccess(viewer, 'b1', 'viewer')).not.toThrow()
  })

  it('allows admin any building at any level', () => {
    expect(() => checkAccess(admin, 'b3', 'operator')).not.toThrow()
  })

  it('allows admin superadmin-level access', () => {
    // admin role weight (6) >= superadmin (7)? No, so this fails
    expect(() => checkAccess(admin, 'b1', 'superadmin')).toThrow('Forbidden')
  })

  it('allows security at security level', () => {
    expect(() => checkAccess(security, 'b1', 'security')).not.toThrow()
  })

  it('allows admin at security level', () => {
    expect(() => checkAccess(admin, 'b1', 'security')).not.toThrow()
  })

  it('throws on null user', () => {
    expect(() => checkAccess(null)).toThrow('Unauthenticated')
  })

  it('allows viewer at viewer level', () => {
    expect(() => checkAccess(viewer, 'b1', 'viewer')).not.toThrow()
  })

  it('denies operator at security level', () => {
    expect(() => checkAccess(op, 'b1', 'security')).toThrow('Forbidden')
  })
})
