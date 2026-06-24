'use client'

import { ReactNode } from 'react'
import { StatusLed, Card } from '.'
import { dimBarColor } from '@/lib/utils'

interface LightZone {
  id: string
  zoneId: string
  name: string
  zone: { name: string; floor: number }
  state: string
  dimLevel: number
  power: number
}

interface LightZoneCardProps {
  zone: LightZone
  dimSlider: ReactNode
  lightToggle: ReactNode
}

export function LightZoneCard({ zone, dimSlider, lightToggle }: LightZoneCardProps) {
  const isOn = zone.state === 'ON'

  return (
    <Card className="p-6">
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {zone.name || zone.zone.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {zone.zone.name} · Floor {zone.zone.floor}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            isOn
              ? 'bg-status-active/20 text-status-active border border-status-active/30'
              : 'bg-bg-elevated/20 text-muted-foreground border border-border-hairline/30'
          }`}
        >
          <StatusLed status={isOn ? 'normal' : 'unknown'} />
          {zone.state}
        </span>
      </div>

      {/* Dim Level Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Dim Level</span>
          <span className="text-sm font-medium text-white font-mono">
            {zone.dimLevel}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${dimBarColor(zone.dimLevel)}`}
            style={{ width: `${zone.dimLevel}%` }}
          />
        </div>
      </div>

      {/* Dim Slider */}
      <div className="mb-4 p-3 bg-bg-elevated/30 rounded-lg border border-border-hairline/50">
        {dimSlider}
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between">
        {lightToggle}
      </div>

      {/* Power Consumption */}
      {zone.power > 0 && (
        <div className="mt-3 pt-3 border-t border-border-hairline/50 text-xs text-muted-foreground">
          Power: {zone.power.toFixed(1)} W
        </div>
      )}
    </Card>
  )
}
