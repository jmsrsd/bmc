import type { FC } from 'react'
import type { WidgetConfig } from '@/lib/ui-config/types'
import { HvacCard } from './HvacCard'
import { LightingCard } from './LightingCard'
import { DoorCard } from './DoorCard'
import { SensorReadout } from './SensorReadout'
import { AlarmList } from './AlarmList'
import { MeterGauge } from './MeterGauge'
import { FirePanelCard } from './FirePanelCard'
import { UnknownWidget } from '../UnknownWidget'

/**
 * SDUI Component Registry.
 * Registry is the ONLY place the client knows about widget types.
 * Every unrecognized type resolves to UnknownWidget via SDUIRenderer.
 */
export const widgetRegistry: Record<string, FC<{ config: WidgetConfig }>> = {
  'hvac-control': HvacCard,
  'hvac-status': HvacCard,
  'lighting-control': LightingCard,
  'door-status': DoorCard,
  'sensor-readout': SensorReadout,
  'alarm-list': AlarmList,
  'meter-gauge': MeterGauge,
  'fire-panel': FirePanelCard,
}
