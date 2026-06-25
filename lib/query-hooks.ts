// TanStack Query hooks for BMC data fetching

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// ─── Building Data Query ───────────────────────────────────────────────────────

export function useBuilding(buildingId: string) {
  return useQuery({
    queryKey: ['building', buildingId],
    queryFn: async () => {
      const res = await fetch(`/api/buildings/${buildingId}`)
      if (!res.ok) throw new Error(`Failed to fetch building: ${res.status}`)
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 2
    },
  })
}

// ─── Zones Query ───────────────────────────────────────────────────────────────

export function useZones(buildingId: string) {
  return useQuery({
    queryKey: ['zones', buildingId],
    queryFn: async () => {
      const building = await fetch(`/api/buildings/${buildingId}`).then(r => r.json())
      return building.zones || []
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  })
}

// ─── Sensors Query ─────────────────────────────────────────────────────────────

export function useSensors(buildingId: string) {
  return useQuery({
    queryKey: ['sensors', buildingId],
    queryFn: async () => {
      const building = await fetch(`/api/buildings/${buildingId}`).then(r => r.json())
      return building.zones?.flatMap((z: any) => z.sensors || []) || []
    },
    staleTime: 1000 * 30, // 30 seconds - sensor data changes frequently
    gcTime: 1000 * 60 * 5,
  })
}

// ─── Active Alarms Query ───────────────────────────────────────────────────────

export function useActiveAlarms(buildingId: string) {
  return useQuery({
    queryKey: ['alarms', buildingId, 'open'],
    queryFn: async () => {
      const building = await fetch(`/api/buildings/${buildingId}`).then(r => r.json())
      return building.alarms || []
    },
    staleTime: 1000 * 30, // 30 seconds
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 60, // Poll every minute
  })
}

// ─── Invalidated after mutations ──────────────────────────────────────────────

export function useInvalidateQueries() {
  const queryClient = useQueryClient()
  return (keys: string[]) => queryClient.invalidateQueries({ queryKey: keys })
}