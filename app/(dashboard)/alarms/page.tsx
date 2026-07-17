import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { AlarmSection } from './_components'

export default async function AlarmsPage() {
  const alarms = await prisma.alarm.findMany({
    where: { buildingId: 'b1' },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const openAlarms = alarms.filter((a) => a.status === 'open')
  const acknowledgedAlarms = alarms.filter((a) => a.status === 'acknowledged')

  return (
    <div>
      <PageHeader title="Alarms" subtitle="Active and acknowledged alerts" />
      <div className="mt-6">
        <AlarmSection title="Open Alarms" alarms={openAlarms} showAck />
        <AlarmSection title="Acknowledged" alarms={acknowledgedAlarms} />
      </div>
    </div>
  )
}
