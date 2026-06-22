import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// TESTING.md §3.1 — SSE Hook Tests, UC-STRM-01
// The hook sets onmessage/onerror on the EventSource instance.
// We reference it as the single instance so tests can trigger onmessage.

let instance: { close: any; onmessage: any; onerror: any }

beforeEach(() => {
  instance = { close: vi.fn(), onmessage: null, onerror: null }
  // Constructor must return the same object reference the hook mutates
  vi.stubGlobal(
    'EventSource',
    vi.fn(function () {
      return instance
    }),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

async function getUseSSE() {
  return (await import('../useSSE')).useSSE
}

describe('useSSE', () => {
  it('connects to provided URL', async () => {
    const { renderHook } = await import('@testing-library/react')
    const useSSE = await getUseSSE()
    renderHook(() => useSSE('/api/stream/building/b1', {}))
    expect(EventSource).toHaveBeenCalledWith('/api/stream/building/b1')
  })

  it('parses incoming JSON messages', async () => {
    const { renderHook, act } = await import('@testing-library/react')
    const useSSE = await getUseSSE()
    const { result } = renderHook(() =>
      useSSE<{ temp: number }>('/url', { temp: 22 }),
    )

    act(() => {
      instance.onmessage({ data: JSON.stringify({ temp: 23.5 }) })
    })

    expect(result.current).toEqual({ temp: 23.5 })
  })

  it('handles malformed JSON gracefully', async () => {
    const { renderHook, act } = await import('@testing-library/react')
    const useSSE = await getUseSSE()
    const { result } = renderHook(() =>
      useSSE<{ temp: number }>('/url', { temp: 22 }),
    )

    act(() => {
      instance.onmessage({ data: 'not-json' })
    })

    expect(result.current).toEqual({ temp: 22 })
  })

  it('closes connection on unmount', async () => {
    const { renderHook } = await import('@testing-library/react')
    const useSSE = await getUseSSE()
    const { unmount } = renderHook(() => useSSE('/url', {}))
    unmount()
    expect(instance.close).toHaveBeenCalled()
  })

  it('sets onerror handler', async () => {
    const useSSE = await getUseSSE()
    const { renderHook } = await import('@testing-library/react')
    renderHook(() => useSSE('/url', {}))
    expect(typeof instance.onerror).toBe('function')
  })
})
