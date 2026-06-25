import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'

export default async function EnergyPage() {
  const building: any = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      meters: {
        include: {
          readings: {
            orderBy: { timestamp: 'desc' },
            take: 48,
          },
        },
      },
    },
  })

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[#8E8E93] text-[14px]">Building not found</p>
      </div>
    )
  }

  const totalKw = building.meters
    .reduce((sum: number, m: any) => sum + m.value, 0)
    .toFixed(1)
  const totalCumulativeKwh = building.meters
    .reduce((sum: number, m: any) => sum + m.cumulative, 0)
    .toLocaleString('en-US', { maximumFractionDigits: 0 })
  const meterCount = building.meters.length

  return (
    <div>
      <PageHeader title="Energy" subtitle="Power consumption &amp; analytics" />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
            {totalKw}
          </p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Total kW</p>
        </div>
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
            {totalCumulativeKwh}
          </p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Total cumulative kWh</p>
        </div>
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
            {meterCount}
          </p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Meters</p>
        </div>
      </div>

      {/* Meter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {building.meters.map((meter: any) => {
          const readings = meter.readings
          const maxReading = readings.length > 0
            ? Math.max(...readings.map((r: any) => r.value), 0.001)
            : 1

          return (
            <div
              key={meter.id}
              className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5"
            >
              {/* Meter name + type */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[14px] font-medium text-white truncate">
                  {meter.name}
                </h3>
                <span className="shrink-0 text-[11px] font-medium text-[#8E8E93] uppercase tracking-wider">
                  {meter.type}
                </span>
              </div>

              {/* Current value */}
              <div className="flex items-baseline gap-1 mt-3">
                <span className="font-['JetBrains_Mono'] text-[28px] font-light text-white leading-none">
                  {meter.value.toFixed(1)}
                </span>
                <span className="text-sm text-[#AEAEB2]">{meter.unit}</span>
              </div>

              {/* Cumulative total */}
              <p className="text-[12px] text-[#AEAEB2] mt-1">
                {meter.cumulative.toLocaleString('en-US', { maximumFractionDigits: 1 })} kWh cumulative
              </p>

              {/* Inline bar chart */}
              {readings.length > 0 ? (
                <div className="flex items-end gap-[2px] h-12 mt-3">
                  {readings.slice(0, 48).map((r: any, i: number) => (
                    <div
                      key={i}
                      className="w-[3px] bg-[#0A84FF]/60 rounded-t"
                      style={{ height: `${(r.value / maxReading) * 100}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-12 mt-3 flex items-end">
                  <p className="text-[11px] text-[#6B7280]">No readings</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
