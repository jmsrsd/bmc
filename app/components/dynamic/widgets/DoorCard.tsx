'use client'

import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'
import { Shield } from 'lucide-react'
import { DoorLockButton } from '@/components/ui/door-controls'

/**
 * Door status/control card.
 * Shows lock/unlock control based on lock-unlock capability.
 */
export const DoorCard: FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
        {config.deviceType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 ml-auto">
            {config.deviceType}
          </span>
        )}
      </div>

      {/* Lock/Unlock control */}
      {config.capabilities?.includes('lock-unlock') && config.deviceId && (
        <DoorLockButton doorId={config.deviceId} currentState="LOCKED" />
      )}
    </div>
  )
}
