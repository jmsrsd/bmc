'use client'

import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'

/**
 * Fallback widget for unrecognized types.
 * In dev: visible dashed-border indicator for debugging.
 * In prod: silent null — remaining dashboard widgets continue working.
 */
export const UnknownWidget: FC<{ config: WidgetConfig }> = ({ config }) => {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border-2 border-dashed border-red-500/50">
        <p className="text-xs text-red-400 font-mono">
          Unknown widget: <code>{config.type}</code>
        </p>
        <p className="text-xs text-gray-500 mt-1">{config.id}</p>
      </div>
    )
  }
  return null
}
