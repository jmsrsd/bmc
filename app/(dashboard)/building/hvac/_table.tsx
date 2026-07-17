'use client'

import { DataTable, type Column } from '@/components/ui/data-table'
import { HvacControls } from './hvac-controls'

export function HvacTable({ rows }: { rows: any[] }) {
  const columns: Column<any>[] = [
    { header: 'Zone', cell: (z) => <span className="text-[14px] font-medium text-white">{z.zoneName}</span> },
    { header: 'Floor', cell: (z) => <span className="text-[12px] text-secondary">{z.floor >= 0 ? `F${z.floor}` : `B${Math.abs(z.floor)}`}</span> },
    { header: 'Temp', cell: (z) => (
      <span className="text-[14px] font-['JetBrains_Mono'] text-white">
        {z.currentTemp !== null ? `${z.currentTemp.toFixed(1)}°C` : '--°C'}
      </span>
    )},
    { header: 'Setpoint', cell: (z) => <span className="text-[12px] text-secondary">{z.setpoint}°C</span> },
    { header: 'State', cell: (z) => {
      const on = z.state === 'ON'
      return <span className={`text-[12px] ${on ? 'text-normal' : 'text-secondary'}`}>{z.state}</span>
    }},
    { header: 'Controls', cell: (z) => (
      <HvacControls
        zoneId={z.id}
        initialSetpoint={z.setpoint}
        currentTemp={z.currentTemp}
        currentSpeed={z.fanSpeed}
        currentMode={z.mode}
      />
    )},
  ]

  return (
    <DataTable
      columns={columns}
      data={rows}
      keyExtractor={(z) => z.id}
      emptyMessage="No zones found"
    />
  )
}
