import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock EventSource that captures addEventListener callbacks per event type
let instance: {
  close: ReturnType<typeof vi.fn>
  addEventListener: ReturnType<typeof vi.fn>
  _listeners: Map<string, (e: MessageEvent) => void>
}

beforeEach(() => {
  const listeners = new Map<string, (e: MessageEvent) => void>()
  instance = {
    close: vi.fn(),
    addEventListener: vi.fn((type: string, cb: (e: MessageEvent) => void) => {
      listeners.set(type, cb)
    }),
    _listeners: listeners,
  }
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

async function getUseWidgetSSE() {
  return (await import('../useWidgetSSE')).useWidgetSSE
}

function makeConfig(overrides: Partial<Parameters<typeof import('../useWidgetSSE').useWidgetSSE>[0]> = {}) {
  return {
    id: 'w1',
    type: 'hvac',
    title: 'Test',
    capabilities: [],
    subscriptions: ['snapshot', 'telemetry'],
    zoneId: 'zone-1',
    ...overrides,
  }
}

describe('useWidgetSSE', () => {
  it('connects to the SSE endpoint with provided buildingId', async () => {
    const { renderHook } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    renderHook(() => useWidgetSSE(makeConfig(), 'b2'))
    expect(EventSource).toHaveBeenCalledWith('/api/stream/building/b2')
  })

  it('connects to default building b1 when no buildingId given', async () => {
    const { renderHook } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    renderHook(() => useWidgetSSE(makeConfig()))
    expect(EventSource).toHaveBeenCalledWith('/api/stream/building/b1')
  })

  it('returns loading=true initially', async () => {
    const { renderHook } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    const { result } = renderHook(() => useWidgetSSE(makeConfig()))
    expect(result.current.loading).toBe(true)
    expect(result.current.sensorValues).toEqual({})
  })

  it('sets loading=false on snapshot event', async () => {
    const { renderHook, act } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    const { result } = renderHook(() => useWidgetSSE(makeConfig({ zoneId: 'zone-1' })))

    const snapshotHandler = instance._listeners.get('snapshot')!
    act(() => {
      snapshotHandler({ data: JSON.stringify({ sensors: [] }) })
    })

    expect(result.current.loading).toBe(false)
  })

  it('populates sensorValues filtered by zoneId from snapshot', async () => {
    const { renderHook, act } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    const { result } = renderHook(() => useWidgetSSE(makeConfig({ zoneId: 'zone-1' })))

    const snapshotHandler = instance._listeners.get('snapshot')!
    act(() => {
      snapshotHandler({
        data: JSON.stringify({
          sensors: [
            { id: 's1', zoneId: 'zone-1', type: 'TEMPERATURE', value: 23.5, unit: '°C' },
            { id: 's2', zoneId: 'zone-2', type: 'TEMPERATURE', value: 20.0, unit: '°C' },
            { id: 's3', zoneId: 'zone-1', type: 'HUMIDITY', value: 55, unit: '%' },
          ],
        }),
      })
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.sensorValues).toHaveProperty('TEMPERATURE')
    expect(result.current.sensorValues.TEMPERATURE.value).toBe(23.5)
    expect(result.current.sensorValues.TEMPERATURE.unit).toBe('°C')
    expect(result.current.sensorValues).toHaveProperty('HUMIDITY')
    expect(result.current.sensorValues.HUMIDITY.value).toBe(55)
    expect(result.current.sensorValues.HUMIDITY.unit).toBe('%')
    // zone-2 sensor should be excluded (no sensor with value 20.0)
    expect(Object.keys(result.current.sensorValues).sort()).toEqual(['HUMIDITY', 'TEMPERATURE'])
    expect(result.current.sensorValues.TEMPERATURE.value).not.toBe(20.0)
  })

  it('updates sensorValues on telemetry event matching zoneId', async () => {
    const { renderHook, act } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    const { result } = renderHook(() => useWidgetSSE(makeConfig({ zoneId: 'zone-1' })))

    // Seed with snapshot first
    const snapshotHandler = instance._listeners.get('snapshot')!
    act(() => {
      snapshotHandler({
        data: JSON.stringify({
          sensors: [
            { id: 's1', zoneId: 'zone-1', type: 'TEMPERATURE', value: 23.5, unit: '°C' },
          ],
        }),
      })
    })

    const telemetryHandler = instance._listeners.get('telemetry')!
    act(() => {
      telemetryHandler({
        data: JSON.stringify({
          zoneId: 'zone-1',
          type: 'TEMPERATURE',
          value: 24.0,
          unit: '°C',
          ts: '2026-06-23T12:00:00Z',
        }),
      })
    })

    expect(result.current.sensorValues.TEMPERATURE.value).toBe(24.0)
    expect(result.current.sensorValues.TEMPERATURE.ts).toBe('2026-06-23T12:00:00Z')
  })

  it('ignores telemetry events for non-matching zoneId', async () => {
    const { renderHook, act } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    const { result } = renderHook(() => useWidgetSSE(makeConfig({ zoneId: 'zone-1' })))

    // Seed with snapshot
    const snapshotHandler = instance._listeners.get('snapshot')!
    act(() => {
      snapshotHandler({
        data: JSON.stringify({
          sensors: [
            { id: 's1', zoneId: 'zone-1', type: 'TEMPERATURE', value: 23.5, unit: '°C' },
          ],
        }),
      })
    })

    const telemetryHandler = instance._listeners.get('telemetry')!
    act(() => {
      telemetryHandler({
        data: JSON.stringify({
          zoneId: 'zone-2',
          type: 'TEMPERATURE',
          value: 99.9,
          unit: '°C',
          ts: '2026-06-23T12:00:00Z',
        }),
      })
    })

    expect(result.current.sensorValues.TEMPERATURE.value).toBe(23.5)
  })

  it('registers snapshot and telemetry listeners', async () => {
    const { renderHook } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    renderHook(() => useWidgetSSE(makeConfig()))
    expect(instance.addEventListener).toHaveBeenCalledWith('snapshot', expect.any(Function))
    expect(instance.addEventListener).toHaveBeenCalledWith('telemetry', expect.any(Function))
  })

  it('closes connection on unmount', async () => {
    const { renderHook } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    const { unmount } = renderHook(() => useWidgetSSE(makeConfig()))
    unmount()
    expect(instance.close).toHaveBeenCalled()
  })

  it('sets loading=false immediately when no subscriptions', async () => {
    const { renderHook } = await import('@testing-library/react')
    const useWidgetSSE = await getUseWidgetSSE()
    const { result } = renderHook(() =>
      useWidgetSSE(makeConfig({ subscriptions: [] })),
    )
    expect(result.current.loading).toBe(false)
    expect(EventSource).not.toHaveBeenCalled()
  })
})
