'use client'

import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'
import { Lightbulb } from 'lucide-react'
import { DimSlider, LightToggle } from '@/components/ui/lighting-controls'

/**
 * Lighting control card.
 * Renders dimmer and/or toggle based on config.capabilities.
 */
export const LightingCard: FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
        {config.deviceType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 ml-auto">
            {config.deviceType}
          </span>
        )}
      </div>

      {/* On/Off toggle */}
      {config.capabilities?.includes('on-off') && config.zoneId && (
        <LightToggle zoneId={config.zoneId} currentState="OFF" />
      )}

      {/* Dim level control */}
      {config.capabilities?.includes('dim-level') && config.zoneId && (
        <DimSlider zoneId={config.zoneId} currentLevel={100} />
      )}
    </div>
  )
}
