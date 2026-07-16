import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import LoginPage from '../page.tsx'

vi.mock('next/font/google', async () => ({
  Inter: async () => ({
    className: 'font-inter',
    style: {},
  }),
}))

vi.mock('@/lib/auth', async () => ({
  checkAccess: () => true,
  verifyPassword: async (password: string) => password === 'valid-password',
  createSessionCookie: () => ({
    name: 'session',
    value: 'test-token',
    maxAge: 3600,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
  }),
}))

vi.mock('next/navigation', async () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('app/login/page.tsx', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(window, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders login form with password input', async () => {
    const { container } = render(<LoginPage />)
    const passwordInput = container.querySelector('input[type="password"]')

    expect(passwordInput).toBeInTheDocument()
  })

  it('submits login form and calls fetch on success', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }))

    const { container } = render(<LoginPage />)

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    fireEvent.change(passwordInput, { target: { value: 'valid-password' } })
    fireEvent.submit(form)

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/login', expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('valid-password'),
      }))
    })
  })

  it('displays error message on failed login', async () => {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Invalid password' }), { status: 401 }))

    const { container } = render(<LoginPage />)

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement
    const form = container.querySelector('form') as HTMLFormElement

    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } })
    fireEvent.submit(form)

    await waitFor(() => expect(container.querySelector('.text-critical')).toBeInTheDocument())
  })
})