'use client'

import { useEffect, useState } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'

interface SSESnapshot {
  sensors: Array<{ id: string; zoneId: string; type: string; value: number; unit: string }>
}

interface TelemetryEvent {
  zoneId: string
  type: string
  value: number
  unit: string
  ts: string
}

interface WidgetSSEState {
  sensorValues: Record<string, { value: number; unit: string; ts: string }>
  loading: boolean
}

export function useWidgetSSE(config: WidgetConfig, buildingId = 'b1'): WidgetSSEState {
  const [state, setState] = useState<WidgetSSEState>({ sensorValues: {}, loading: true })

  useEffect(() => {
    if (!config.subscriptions?.length) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    const es = new EventSource(`/api/stream/building/${buildingId}`)

    es.addEventListener('snapshot', (e: MessageEvent) => {
      const snapshot: SSESnapshot = JSON.parse(e.data)
      const zoneSensors = snapshot.sensors.filter(s => s.zoneId === config.zoneId)
      const values: Record<string, { value: number; unit: string; ts: string }> = {}
      for (const s of zoneSensors) {
        values[s.type] = { value: s.value, unit: s.unit, ts: new Date().toISOString() }
      }
      setState({ sensorValues: values, loading: false })
    })

    es.addEventListener('telemetry', (e: MessageEvent) => {
      const data: TelemetryEvent = JSON.parse(e.data)
      if (data.zoneId === config.zoneId) {
        setState(prev => ({
          ...prev,
          sensorValues: {
            ...prev.sensorValues,
            [data.type]: { value: data.value, unit: data.unit, ts: data.ts },
          },
        }))
      }
    })

    return () => es.close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.zoneId, buildingId, config.subscriptions?.length])

  return state
}
