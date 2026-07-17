import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { buildHvacRows } from './_helpers'
import { HvacTable } from './_table'

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
        <p className="text-secondary text-[14px]">Building not found</p>
      </div>
    )
  }

  const rows = buildHvacRows(building)

  return (
    <div>
      <PageHeader title="HVAC Control" subtitle="Zone temperature, fan speed & mode" />
      <div className="mt-6">
        <HvacTable rows={rows} />
      </div>
    </div>
  )
}
