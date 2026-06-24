import { ReactNode } from 'react'

interface MetricTileProps {
  label: string
  value: string | number
  valueColor?: string
  unit?: string
}

export function MetricTile({ label, value, valueColor = 'text-white', unit }: MetricTileProps) {
  return (
    <div className="bg-bg-elevated/50 rounded-lg p-3 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-xl font-light font-mono ${valueColor}`}>{value}</p>
      {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
    </div>
  )
}

interface SensorTileProps {
  icon?: ReactNode
  iconColor?: string
  value: string | number
  label: string
}

export function SensorTile({ icon, iconColor = 'text-status-active', value, label }: SensorTileProps) {
  return (
    <div className="bg-bg-elevated/50 rounded-lg p-3 text-center">
      {icon && (
        <div className={`${iconColor} mx-auto mb-1`}>{icon}</div>
      )}
      <p className="text-lg font-bold text-white font-mono">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
