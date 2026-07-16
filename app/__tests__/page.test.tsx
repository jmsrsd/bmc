import { describe, it, expect, vi } from 'vitest'
import { redirect } from 'next/navigation'

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return {
    ...actual,
    redirect: vi.fn(),
  }
})

import Home from '../page.tsx'

describe('app/page.tsx', () => {
  it('redirects to /building', () => {
    Home()
    expect(redirect).toHaveBeenCalledWith('/building')
  })
})