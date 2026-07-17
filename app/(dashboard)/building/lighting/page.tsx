import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { buildLightingRows } from './_helpers'
import { LightingTable } from './_table'

export default async function LightingPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: { lightZones: true },
      },
    },
  })

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-secondary text-[14px]">Building not found</p>
      </div>
    )
  }

  const rows = buildLightingRows(building)

  return (
    <div>
      <PageHeader title="Lighting Control" subtitle="Zone dimming & scene control" />
      <div className="mt-6">
        <LightingTable rows={rows} />
      </div>
    </div>
  )
}