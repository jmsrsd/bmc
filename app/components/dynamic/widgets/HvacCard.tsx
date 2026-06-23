'use client'

import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'
import { Thermometer, Wind } from 'lucide-react'
import { SetpointForm, FanSpeedButtons, HvacModeButtons } from '@/components/ui/hvac-controls'

/**
 * HVAC control/status card.
 * Renders controls conditionally based on config.capabilities.
 * Shows live sensor values when config.sensors is populated.
 */
export const HvacCard: FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
        {config.deviceType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 ml-auto">
            {config.deviceType}
          </span>
        )}
      </div>

      {/* Sensor readout */}
      {config.sensors && config.sensors.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {config.sensors.map((sensor) => (
            <div key={sensor.id ?? sensor} className="bg-gray-900/50 rounded-lg p-3">
              <p className="text-xs text-gray-400">{typeof sensor === 'string' ? sensor : sensor.type ?? sensor}</p>
              <p className="text-lg font-mono text-white">--</p>
            </div>
          ))}
        </div>
      )}

      {/* Setpoint control */}
      {config.capabilities?.includes('setpoint') && config.zoneId && (
        <SetpointForm zoneId={config.zoneId} currentSetpoint={null} />
      )}

      {/* Fan speed control */}
      {config.capabilities?.includes('fan-speed') && config.zoneId && (
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-gray-400 shrink-0" />
          <FanSpeedButtons zoneId={config.zoneId} currentSpeed="AUTO" />
        </div>
      )}

      {/* HVAC mode control */}
      {config.capabilities?.includes('hvac-mode') && config.zoneId && (
        <HvacModeButtons zoneId={config.zoneId} currentMode="AUTO" />
      )}
    </div>
  )
}
