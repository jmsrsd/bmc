'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60_000, // 1 minute - data considered fresh
          gcTime: 5 * 60_000, // 5 minutes - cache kept in memory
          retry: (failureCount, error: any) => {
            if (error?.status === 401 || error?.status === 403) return false
            return failureCount < 3
          },
          refetchOnWindowFocus: false,
          refetchOnReconnect: true,
        },
        mutations: {
          retry: 1,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}