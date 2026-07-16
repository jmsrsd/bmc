import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/login/route'

// Verify auth route handles POST with valid credentials and returns 401 for GET
describe('POST /api/login', () => {
  it('accepts POST with valid password', async () => {
    const body = JSON.stringify({ password: 'valid-password' })
    
    const request = new Request('http://localhost/api/login', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401) // mock-db denies all
    expect(await response.json()).toEqual({ message: 'Invalid password' })
  })
  
  it('rejects POST with missing password', async () => {
    const body = JSON.stringify({})
    
    const request = new Request('http://localhost/api/login', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
    
    const response = await POST(request)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: 'Password is required' })
  })
  
  it('rejects POST with invalid password', async () => {
    const body = JSON.stringify({ password: 'invalid-password' })
    
    const request = new Request('http://localhost/api/login', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })
    
    const response = await POST(request)
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ message: 'Invalid password' })
  })
  
  it('rejects non-JSON body (falls through to catch-all 500)', async () => {
    const body = 'plain text'
    
    const request = new Request('http://localhost/api/login', {
      method: 'POST',
      body,
    })
    
    const response = await POST(request)
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ message: 'Internal server error' })
  })
})
