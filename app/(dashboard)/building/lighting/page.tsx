import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { DimSlider } from './dim-slider'
import { ToggleButton } from './toggle-button'

export default async function LightingPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          lightZones: true,
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
      <PageHeader title="Lighting Control" subtitle="Zone dimming &amp; scene control" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {building.zones.map((zone) => {
          const light = zone.lightZones[0]

          return (
            <div
              key={zone.id}
              className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-white">{zone.name}</h3>
                <span className="text-[11px] text-[#8E8E93] uppercase tracking-wider">{zone.floor}F</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] text-[#8E8E93]">State</span>
                <ToggleButton zoneId={zone.id} currentState={light?.state ?? 'OFF'} />
              </div>

              <div className="mb-4">
                <label className="text-[12px] text-[#8E8E93] block mb-2">Dim Level</label>
                <DimSlider zoneId={zone.id} initialDim={light?.dimLevel ?? 0} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#8E8E93]">Scene</span>
                <span className="text-[13px] font-medium text-white">{light?.scene ?? 'NORMAL'}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
