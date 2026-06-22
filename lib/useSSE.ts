'use client'

import { useState, useEffect } from 'react'

export function useSSE<T>(url: string, initial: T): T {
  const [data, setData] = useState<T>(initial)

  useEffect(() => {
    const es = new EventSource(url)

    es.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data))
      } catch {
        // Ignore malformed messages
      }
    }

    es.onerror = () => {
      // EventSource auto-reconnects; no explicit action needed
    }

    return () => es.close()
  }, [url])

  return data
}
