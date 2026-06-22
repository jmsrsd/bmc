// Password gate auth for MVP demo (USECASE.md UC-AUTH-01 simplified)
// USECASE.md §2.9 — replaced full NextAuth with single-gate
// DESIGN.md §6.3 pattern preserved for future upgrade

import { cookies } from 'next/headers'
import { User, Role, ROLE_HIERARCHY, BUILDING_ID } from './types'

const DEMO_PASSWORD = 'bmc2024'
const SESSION_COOKIE = 'bmc_session'

export interface Session {
  user: User
}

function createDemoUser(): User {
  return {
    id: 'demo-user',
    role: 'admin',
    name: 'Demo Operator',
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session || session.value !== 'authenticated') return null
  return { user: createDemoUser() }
}

export async function verifyPassword(password: string): Promise<boolean> {
  return password === DEMO_PASSWORD
}

export function createSessionCookie(): { name: string; value: string; maxAge: number; path: string; httpOnly: boolean; sameSite: 'lax' } {
  return {
    name: SESSION_COOKIE,
    value: 'authenticated',
    maxAge: 60 * 60 * 12, // 12 hours
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  }
}

export function clearSessionCookie(): { name: string; value: string; maxAge: number; path: string } {
  return {
    name: SESSION_COOKIE,
    value: '',
    maxAge: 0,
    path: '/',
  }
}

// DESIGN.md §6.3 — checkAccess enforcement
// USECASE.md UC-AUTH-02
export function checkAccess(
  user: User | null,
  _buildingId?: string,
  minRole?: Role
): void {
  if (!user) throw new Error('Unauthenticated')
  if (!minRole) return
  if (ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[minRole]) {
    throw new Error('Forbidden: insufficient role')
  }
}
