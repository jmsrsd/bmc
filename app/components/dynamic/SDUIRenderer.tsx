'use client'

import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'
import { widgetRegistry } from './widgets'
import { UnknownWidget } from './UnknownWidget'

/**
 * SDUI Component Renderer.
 * Looks up config.type in the widget registry.
 * Unknown types → UnknownWidget fallback with console.error.
 */
export const SDUIRenderer: FC<{ config: WidgetConfig }> = ({ config }) => {
  const Widget = widgetRegistry[config.type]

  if (!Widget) {
    console.error(`SDUI: unknown widget type "${config.type}" for ${config.id}`)
    return <UnknownWidget config={config} />
  }

  return <Widget config={config} />
}
