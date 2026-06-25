import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { TemperatureSlider } from './temperature-slider'
import { FanSpeedSelector } from './fan-speed-selector'
import { ModeSwitcher } from './mode-switcher'

export default async function HvacPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          hvacUnits: true,
          sensors: {
            where: { type: 'TEMPERATURE' },
            orderBy: { timestamp: 'desc' },
            take: 1,
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

  return (
    <div>
      <PageHeader title="HVAC Control" subtitle="Zone temperature, fan speed & mode" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {building.zones.map((zone) => {
          const hvacUnit = zone.hvacUnits[0]
          const tempSensor = zone.sensors[0]
          const currentTemp = tempSensor?.value ?? null
          const setpoint = hvacUnit?.setpoint ?? 22
          const fanSpeed = hvacUnit?.fanSpeed ?? 'AUTO'
          const mode = hvacUnit?.mode ?? 'AUTO'

          return (
            <div
              key={zone.id}
              className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-white">{zone.name}</h3>
                <span className="text-[11px] text-[#8E8E93] uppercase tracking-wider">{zone.floor}F</span>
              </div>

              <div className="text-[32px] font-[family-name:var(--font-jetbrains-mono)] font-light text-white leading-tight">
                {currentTemp !== null ? `${currentTemp.toFixed(1)}°C` : '--°C'}
              </div>

              <div className="mt-5">
                <label className="text-[12px] text-[#8E8E93] block mb-2">Setpoint</label>
                <TemperatureSlider zoneId={zone.id} initialSetpoint={setpoint} />
              </div>

              <div className="mt-5">
                <label className="text-[12px] text-[#8E8E93] block mb-2">Fan Speed</label>
                <FanSpeedSelector zoneId={zone.id} currentSpeed={fanSpeed} />
              </div>

              <div className="mt-5">
                <label className="text-[12px] text-[#8E8E93] block mb-2">Mode</label>
                <ModeSwitcher zoneId={zone.id} currentMode={mode} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
