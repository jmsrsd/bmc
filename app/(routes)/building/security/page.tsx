import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Camera, AlertTriangle } from 'lucide-react'
import { DoorLockButton } from '@/components/ui/door-controls'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Security | BMC',
  description: 'Security door lock/unlock control and camera status',
}

// ─── Helpers ────────────────────────────────────────────────────

function doorStateIndicator(state: string): {
  color: string
  dot: string
  label: string
} {
  switch (state) {
    case 'LOCKED':
      return { color: 'text-red-400', dot: 'bg-red-500', label: 'Locked' }
    case 'UNLOCKED':
      return { color: 'text-green-400', dot: 'bg-green-500', label: 'Unlocked' }
    case 'OPEN':
      return { color: 'text-yellow-400', dot: 'bg-yellow-500', label: 'Open' }
    case 'FORCED':
      return { color: 'text-red-500', dot: 'bg-red-500 animate-pulse', label: 'FORCED' }
    default:
      return { color: 'text-gray-400', dot: 'bg-gray-500', label: state }
  }
}

function cameraBadge(state: string): { color: string; label: string } {
  switch (state) {
    case 'ONLINE':
      return { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Online' }
    case 'OFFLINE':
      return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Offline' }
    default:
      return { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: state }
  }
}

// ─── Page ───────────────────────────────────────────────────────

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
      {/* Back Link */}
      <Link
        href="/building"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Building Overview
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Shield className="w-8 h-8 text-green-400" />
          Security Control
        </h1>
        <p className="text-gray-400 mt-1">
          {doors.length} door{doors.length !== 1 ? 's' : ''} ·{' '}
          {cameras.length} camera{cameras.length !== 1 ? 's' : ''} ·{' '}
          {onlineCameras.length} online
        </p>
      </div>

      {/* Security Alert Banner */}
      {forcedDoors.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">Security Alert</p>
            <p className="text-xs text-red-300/80">
              {forcedDoors.length} door{forcedDoors.length !== 1 ? 's' : ''} in
              FORCED state — possible breach
            </p>
          </div>
        </div>
      )}

      {/* Doors Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-green-400" />
          Access Control
        </h2>
        {doors.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
            <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Doors Configured</h3>
            <p className="text-gray-400">No access control points registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {doors.map((door) => {
              const indicator = doorStateIndicator(door.state)
              return (
                <div
                  key={door.id}
                  className={`bg-gray-800/50 backdrop-blur border rounded-xl p-5 ${
                    door.state === 'FORCED' ? 'border-red-500/50' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{door.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {door.zone.name} · Floor {door.zone.floor}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        door.state === 'FORCED'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : door.state === 'LOCKED'
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${indicator.dot}`} />
                      {indicator.label}
                    </span>
                  </div>

                  {/* Door State Detail */}
                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <span className={`w-3 h-3 rounded-full ${indicator.dot}`} />
                    <span className={`font-medium ${indicator.color}`}>{indicator.label}</span>
                    {door.alarmState !== 'NORMAL' && (
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full ml-auto">
                        Alarm: {door.alarmState}
                      </span>
                    )}
                  </div>

                  {/* Lock/Unlock Button */}
                  {door.state !== 'FORCED' && (
                    <div className="pt-3 border-t border-gray-700/50">
                      <DoorLockButton doorId={door.id} currentState={door.state} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Cameras Section */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-blue-400" />
          Surveillance Cameras
        </h2>
        {cameras.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Cameras</h3>
            <p className="text-gray-400">No surveillance cameras registered.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cameras.map((camera) => {
              const badge = cameraBadge(camera.state)
              return (
                <div
                  key={camera.id}
                  className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5 flex items-center gap-4"
                >
                  <div
                    className={`p-3 rounded-lg ${
                      camera.state === 'ONLINE' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}
                  >
                    <Camera
                      className={`w-5 h-5 ${
                        camera.state === 'ONLINE' ? 'text-green-400' : 'text-red-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{camera.name}</p>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          camera.state === 'ONLINE' ? 'bg-green-400' : 'bg-red-400'
                        }`}
                      />
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
