import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function getBuildingData() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          sensors: true,
          hvacUnits: true,
          lightZones: true,
          doors: true,
        },
        orderBy: { floor: 'asc' },
      },
      elevators: {
        include: { cars: true },
      },
      firePanels: {
        include: { devices: true },
      },
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

  const openAlarms = await prisma.alarm.count({
    where: { buildingId: 'b1', status: 'open' },
  })

  return { building, openAlarms }
}

export default async function BuildingOverviewPage() {
  const { building, openAlarms } = await getBuildingData()

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#AEAEB2] text-sm">Building not found</p>
      </div>
    )
  }

  const totalZones = building.zones.length
  const totalSensors = building.zones.reduce((a, z) => a + z.sensors.length, 0)
  const totalEnergy = building.meters
    .reduce((a, m) => a + m.value, 0)
    .toFixed(1)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[24px] font-semibold text-white leading-tight tracking-[-0.02em]">
          Building Overview
        </h1>
        <p className="text-[14px] font-medium text-[#8E8E93] mt-1">
          Biomedical Campus
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Zones */}
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
            {totalZones}
          </p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Zones</p>
        </div>

        {/* Sensors */}
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
            {totalSensors}
          </p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Sensors</p>
        </div>

        {/* Open Alarms */}
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
            {openAlarms}
          </p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Open Alarms</p>
        </div>

        {/* Energy */}
        <div className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5">
          <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
            {totalEnergy}
          </p>
          <p className="text-[#AEAEB2] text-xs mt-1.5">Energy kW</p>
        </div>
      </div>

      {/* Zone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {building.zones.map((zone) => {
          const tempSensor = zone.sensors.find(
            (s) => s.type === 'TEMPERATURE',
          )
          const hvac = zone.hvacUnits[0]
          const light = zone.lightZones[0]
          const doors = zone.doors
          const lockedDoors = doors.filter((d) => d.state === 'LOCKED').length
          const unlockedDoors = doors.filter(
            (d) => d.state === 'UNLOCKED',
          ).length

          return (
            <div
              key={zone.id}
              className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5 space-y-4"
            >
              {/* Zone Header */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[14px] font-medium text-white leading-snug">
                  {zone.name}
                </h3>
                <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#242427] text-[#AEAEB2] uppercase tracking-wide">
                  {zone.type}
                </span>
              </div>

              {/* Floor */}
              <p className="text-xs text-[#8E8E93]">
                Floor {zone.floor} &middot; {zone.area ? `${zone.area} m²` : '—'}
              </p>

              {/* Temperature */}
              {tempSensor ? (
                <div className="flex items-baseline gap-1">
                  <span className="font-['JetBrains_Mono'] text-[28px] font-light text-white leading-none">
                    {tempSensor.value.toFixed(1)}
                  </span>
                  <span className="text-sm text-[#AEAEB2]">
                    {tempSensor.unit}
                  </span>
                </div>
              ) : (
                <div className="h-[34px] flex items-center">
                  <span className="text-xs text-[#6B7280]">No temp sensor</span>
                </div>
              )}

              {/* Status Indicators */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#AEAEB2]">
                {/* HVAC */}
                {hvac && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        hvac.state === 'ON'
                          ? 'bg-[#32D74B]'
                          : 'bg-[#6B7280]'
                      }`}
                    />
                    <span>
                      HVAC {hvac.mode}
                    </span>
                  </div>
                )}

                {/* Light Dim Level */}
                {light && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-1.5 bg-[#242427] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0A84FF] transition-all"
                        style={{ width: `${light.dimLevel}%` }}
                      />
                    </div>
                    <span>{light.dimLevel}%</span>
                  </div>
                )}

                {/* Doors */}
                {doors.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span>{doors.length}</span>
                    {unlockedDoors > 0 && (
                      <>
                        <span className="text-[#8E8E93]">&middot;</span>
                        <span className="text-[#32D74B]">{unlockedDoors} open</span>
                      </>
                    )}
                    {lockedDoors > 0 && (
                      <>
                        <span className="text-[#8E8E93]">&middot;</span>
                        <span className="text-[#AEAEB2]">{lockedDoors} locked</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
