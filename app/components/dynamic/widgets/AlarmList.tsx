'use client'

import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'
import { Bell } from 'lucide-react'
import { AlarmAckForm } from '@/components/ui/alarm-ack-form'

/**
 * Alarm list card.
 * Shows active alarms with acknowledge capability.
 * alarm-ack capability unlocks the AlarmAckForm control.
 */
export const AlarmList: FC<{ config: WidgetConfig }> = ({ config }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-white">{config.title}</h3>
        {config.deviceType && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400 ml-auto">
            {config.deviceType}
          </span>
        )}
      </div>

      {/* Alarm acknowledge control */}
      {config.capabilities?.includes('alarm-ack') && config.deviceId && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-300">Active Alarm</p>
              <p className="text-xs text-gray-400 mt-1">{config.deviceId}</p>
            </div>
            <AlarmAckForm alarmId={config.deviceId} />
          </div>
        </div>
      )}

      {/* No alarms placeholder */}
      {(!config.capabilities?.includes('alarm-ack')) && (
        <p className="text-sm text-gray-500">No alarms</p>
      )}
    </div>
  )
}
