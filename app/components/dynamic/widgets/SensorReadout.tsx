'use client'

import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'
import { Gauge } from 'lucide-react'

/**
 * Generic sensor readout card.
 * Displays config.sensors array as a grid of placeholder values.
 * Live values flow in via SSE (useWidgetSSE hook in integration).
 */
export const SensorReadout: FC<{ config: WidgetConfig }> = ({ config }) => {
  const sensors = config.sensors ?? []

  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Gauge className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
      </div>

      {/* Sensor grid */}
      {sensors.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {sensors.map((sensor, idx) => {
            const label = typeof sensor === 'string' ? sensor : sensor.type ?? `Sensor ${idx + 1}`
            return (
              <div key={typeof sensor === 'string' ? sensor : sensor.id ?? idx} className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-400 truncate">{label}</p>
                <p className="text-lg font-mono text-white">--</p>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No sensors configured</p>
      )}
    </div>
  )
}
