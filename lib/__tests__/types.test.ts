import { describe, it, expect } from 'vitest'
import { BUILDING_ID, ROLE_HIERARCHY, Role } from '../types'

describe('types constants', () => {
  it('BUILDING_ID is correct', () => {
    expect(BUILDING_ID).toBe('b1')
  })

  it('ROLE_HIERARCHY defines all roles with increasing numbers', () => {
    expect(ROLE_HIERARCHY['viewer']).toBe(0)
    expect(ROLE_HIERARCHY['tech']).toBe(1)
    expect(ROLE_HIERARCHY['operator']).toBe(2)
    expect(ROLE_HIERARCHY['security']).toBe(3)
    expect(ROLE_HIERARCHY['energy']).toBe(4)
    expect(ROLE_HIERARCHY['admin']).toBe(5)
    expect(ROLE_HIERARCHY['superadmin']).toBe(6)
  })

  it('ROLE_HIERARCHY is total order', () => {
    const roles: Role[] = ['viewer', 'tech', 'operator', 'security', 'energy', 'admin', 'superadmin']
    for (let i = 0; i < roles.length; i++) {
      for (let j = i + 1; j < roles.length; j++) {
        expect(ROLE_HIERARCHY[roles[i]]).toBeLessThan(ROLE_HIERARCHY[roles[j]])
      }
    }
  })
})
