'use client'

import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'
import { Flame } from 'lucide-react'

/**
 * Fire panel status card.
 * Displays fire alarm / fire panel information.
 */
export const FirePanelCard: FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
        {config.deviceType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 ml-auto">
            {config.deviceType}
          </span>
        )}
      </div>

      {/* Fire panel status */}
      <div className="bg-gray-900/50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div>
            <p className="text-sm font-medium text-green-300">Normal</p>
            <p className="text-xs text-gray-400">
              {config.deviceId ?? config.id}
            </p>
          </div>
        </div>
      </div>

      {/* Sensors / zone readouts */}
      {config.sensors && config.sensors.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {config.sensors.map((sensor, idx) => {
            const label = typeof sensor === 'string' ? sensor : sensor.type ?? `Zone ${idx + 1}`
            return (
              <div key={typeof sensor === 'string' ? sensor : sensor.id ?? idx} className="bg-gray-900/50 rounded p-2">
                <p className="text-xs text-gray-400 truncate">{label}</p>
                <p className="text-sm font-mono text-white">--</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
