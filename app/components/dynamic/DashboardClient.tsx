'use client'

import type { FC } from 'react'
import type { UiConfigResponse } from '@/lib/ui-config/types'
import { SDUIRenderer } from './SDUIRenderer'

interface DashboardClientProps {
  config: UiConfigResponse
}

/**
 * Client-side dashboard that renders zones as a 2-column grid.
 * Each widget delegates to SDUIRenderer for type-resolved rendering.
 * Widgets with span=2 occupy both columns; span=1 fits one column.
 */
export const DashboardClient: FC<DashboardClientProps> = ({ config }) => {
  const { buildingName, zones, global } = config

  return (
    <div className="space-y-8">
      {/* Zone Sections */}
      {zones.map((zone) => (
        <section key={zone.id}>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-white">{zone.name}</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-700 text-gray-300 font-medium capitalize">
              {zone.type.toLowerCase()}
            </span>
            <span className="text-xs text-gray-500">Floor {zone.floor}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {zone.widgets.map((widget) => (
              <div
                key={widget.id}
                className={widget.span === 2 ? 'lg:col-span-2' : ''}
              >
                <SDUIRenderer config={widget} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Global Section */}
      {global.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Global</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {global.map((widget) => (
              <div
                key={widget.id}
                className={widget.span === 2 ? 'lg:col-span-2' : ''}
              >
                <SDUIRenderer config={widget} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
