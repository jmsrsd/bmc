'use client'

import { useState, useEffect } from 'react'

export function useSSE<T>(url: string, initial: T): T {
  const [data, setData] = useState<T>(initial)

  useEffect(() => {
    const es = new EventSource(url)

    // Handle snapshot event (initial state)
    es.addEventListener?.('snapshot', (e: MessageEvent) => {
      try {
        setData(JSON.parse(e.data) as T)
      } catch {
        // Ignore malformed messages
      }
    })

    // Handle telemetry event (incremental updates)
    es.addEventListener?.('telemetry', (e: MessageEvent) => {
      try {
        setData((prev) => {
          const parsed = JSON.parse(e.data)
          if (parsed.sensorId && (prev as any).sensors) {
            const sensors = (prev as any).sensors.map((s: any) =>
              s.id === parsed.sensorId ? { ...s, value: parsed.value, timestamp: parsed.ts } : s
            )
            return { ...prev, sensors }
          }
          return prev
        })
      } catch {
        // Ignore malformed messages
      }
    })

    // Fallback to onmessage for older EventSource implementations
    if (!es.addEventListener) {
      es.onmessage = (e) => {
        try {
          setData(JSON.parse(e.data) as T)
        } catch {
          // Ignore malformed messages
        }
      }
    }

    es.onerror = () => {
      // EventSource auto-reconnects; no explicit action needed
    }

    return () => es.close()
  }, [url])

  return data
}