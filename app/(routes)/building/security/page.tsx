import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StatusLed, StatusBadge, BackLink, PageHeader, EmptyState, DoorCard } from '@/components/ui/primitives'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Security | BMC',
  description: 'Security door lock/unlock control and camera status',
}

function cameraBadge(state: string): { bg: string; label: string } {
  switch (state) {
    case 'ONLINE':
      return { bg: 'bg-status-normal/20 text-status-normal border-status-normal/30', label: 'Online' }
    case 'OFFLINE':
      return { bg: 'bg-status-critical/20 text-status-critical border-status-critical/30', label: 'Offline' }
    default:
      return { bg: 'bg-bg-elevated/20 text-muted-foreground border-border-hairline/30', label: state }
  }
}

export default async function SecurityPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [doors, cameras] = await Promise.all([
    prisma.door.findMany({
      include: {
        zone: {
          select: { name: true, floor: true },
        },
      },
      orderBy: [{ zone: { floor: 'asc' } }, { name: 'asc' }],
    }),
    prisma.camera.findMany({
      where: { buildingId: 'b1' },
      orderBy: { name: 'asc' },
    }),
  ])

  const forcedDoors = doors.filter((d) => d.state === 'FORCED')
  const onlineCameras = cameras.filter((c) => c.state === 'ONLINE')

  return (
    <div className="space-y-6">
      <BackLink href="/building" label="Building Overview" />
      <PageHeader
        title="Security Control"
        subtitle={`${doors.length} door${doors.length !== 1 ? 's' : ''} · ${cameras.length} camera${cameras.length !== 1 ? 's' : ''} · ${onlineCameras.length} online`}
      />

      {/* Security Alert Banner */}
      {forcedDoors.length > 0 && (
        <div className="bg-status-critical/10 border border-status-critical/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-sm font-medium text-status-critical">Security Alert</span>
          <p className="text-xs text-status-critical/80">
            {forcedDoors.length} door{forcedDoors.length !== 1 ? 's' : ''} in
            FORCED state — possible breach
          </p>
        </div>
      )}

      {/* Doors Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Access Control</h2>
        {doors.length === 0 ? (
          <EmptyState title="No Doors Configured" description="No access control points registered." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {doors.map((door) => (
              <DoorCard key={door.id} door={door} />
            ))}
          </div>
        )}
      </section>

      {/* Cameras Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Surveillance Cameras</h2>
        {cameras.length === 0 ? (
          <EmptyState title="No Cameras" description="No surveillance cameras registered." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cameras.map((camera) => {
              const badge = cameraBadge(camera.state)
              return (
                <div
                  key={camera.id}
                  className="bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-5 flex items-center gap-4"
                >
                  <div
                    className={`p-3 rounded-lg ${
                      camera.state === 'ONLINE' ? 'bg-status-normal/10' : 'bg-status-critical/10'
                    }`}
                  >
                    <StatusLed status={camera.state === 'ONLINE' ? 'normal' : 'critical'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{camera.name}</p>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.bg}`}
                    >
                      <StatusLed status={camera.state === 'ONLINE' ? 'normal' : 'critical'} />
                      {badge.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}