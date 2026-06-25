// Server-side caching layer for BMC
// Uses React.cache for deduplication within render, Redis-ready for scale

import { prisma } from '@/lib/prisma'
import { cache } from 'react'

// Cache TTL constants (seconds)
export const CACHE_TTL = {
  BUILDING_DATA: 300,      // 5 minutes
  ZONES: 300,              // 5 minutes
  SENSORS: 60,             // 1 minute
  HVAC: 120,               // 2 minutes
  LIGHTS: 120,             // 2 minutes
  DOORS: 60,               // 1 minute
  ELEVATORS: 120,          // 2 minutes
  FIRE_PANELS: 120,        // 2 minutes
  METERS: 60,              // 1 minute
  ALARMS_OPEN: 30,         // 30 seconds
} as const

// ─── Cached Data Fetchers ───────────────────────────────────────────────────

// Building with all relations - cached for deduplication
export const getCachedBuilding = cache(async (buildingId: string) => {
  return prisma.building.findUnique({
    where: { id: buildingId },
    include: {
      zones: {
        include: {
          sensors: { select: { id: true, type: true, value: true, unit: true, timestamp: true } },
          hvacUnits: { select: { id: true, type: true, state: true, mode: true, setpoint: true, fanSpeed: true } },
          lightZones: { select: { id: true, name: true, state: true, dimLevel: true, scene: true } },
          doors: { select: { id: true, name: true, state: true, alarmState: true } },
        },
      },
      elevators: { include: { cars: true } },
      firePanels: { include: { devices: true } },
      meters: { include: { readings: { orderBy: { timestamp: 'desc' }, take: 48 } } },
      cameras: true,
      tenants: true,
    },
  })
})

// Zones only - for building/zones queries
export const getCachedZones = cache(async (buildingId: string) => {
  return prisma.zone.findMany({
    where: { buildingId },
    include: {
      hvacUnits: { select: { id: true, state: true, setpoint: true } },
      sensors: { select: { type: true, value: true } },
      lightZones: { select: { state: true, dimLevel: true } },
      doors: { select: { state: true } },
    },
  })
})

// Open alarms - short cache
export const getCachedOpenAlarms = cache((buildingId: string) => {
  return prisma.alarm.findMany({
    where: { buildingId, status: 'open' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
})

// Energy readings - cached
export const getCachedEnergyReadings = cache((buildingId: string) => {
  return prisma.meter.findMany({
    where: { buildingId },
    include: { readings: { orderBy: { timestamp: 'desc' }, take: 48 } },
  })
})

// ─── Cache Invalidation Helpers ───────────────────────────────────────────────

// Invalidate caches after mutations (call in Server Actions)
export function invalidateBuildingCache(buildingId: string) {
  // Next.js will revalidate on next request
  // For real-time: SSE pushes updates to bust client cache
}

// ─── ETag Generation ─────────────────────────────────────────────────────────

export function generateETag(data: unknown): string {
  // Simple hash-based ETag
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `"${hash.toString(16)}"`
}