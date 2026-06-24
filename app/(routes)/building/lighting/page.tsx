import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BackLink, PageHeader, EmptyState, LightZoneCard } from '@/components/ui/primitives'
import { DimSlider, LightToggle } from '@/components/ui/lighting-controls'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Lighting Control | BMC',
  description: 'Zone lighting control — dimming and on/off toggles',
}

export default async function LightingPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const lightZones = await prisma.lightZone.findMany({
    include: {
      zone: {
        select: { name: true, floor: true },
      },
    },
    orderBy: [{ zone: { floor: 'asc' } }, { name: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <BackLink href="/building" label="Building Overview" />
      <PageHeader
        title="Lighting Control"
        subtitle={`${lightZones.length} light zone${lightZones.length !== 1 ? 's' : ''} across the building`}
      />

      {lightZones.length === 0 ? (
        <EmptyState
          title="No Light Zones"
          description="No lighting zones configured in this building."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lightZones.map((lz) => (
            <LightZoneCard
              key={lz.id}
              zone={lz}
              dimSlider={<DimSlider zoneId={lz.zoneId} currentLevel={lz.dimLevel} />}
              lightToggle={<LightToggle zoneId={lz.zoneId} currentState={lz.state} />}
            />
          ))}
        </div>
      )}
    </div>
  )
}