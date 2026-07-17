import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { SecurityTable } from './_table'

export default async function SecurityPage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      zones: {
        include: {
          doors: true,
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

  return (
    <div>
      <PageHeader title="Access Control" subtitle="Door lock/unlock status" />
      <div className="mt-6">
        <SecurityTable building={building} />
      </div>
    </div>
  )
}
