import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lightbulb, Sun, Moon, Palette } from 'lucide-react'
import { DimSlider, LightToggle } from '@/components/ui/lighting-controls'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Lighting Control | BMC',
  description: 'Zone lighting control — dimming and on/off toggles',
}

// ─── Helpers ────────────────────────────────────────────────────

function dimBarColor(level: number): string {
  if (level >= 75) return 'bg-yellow-400'
  if (level >= 40) return 'bg-yellow-500'
  return 'bg-yellow-600'
}

// ─── Page ───────────────────────────────────────────────────────

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
          <Lightbulb className="w-8 h-8 text-yellow-400" />
          Lighting Control
        </h1>
        <p className="text-gray-400 mt-1">
          {lightZones.length} light zone{lightZones.length !== 1 ? 's' : ''}{' '}
          across the building
        </p>
      </div>

      {/* Light Zone Cards */}
      {lightZones.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
          <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            No Light Zones
          </h2>
          <p className="text-gray-400">
            No lighting zones configured in this building.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lightZones.map((lz) => (
            <div
              key={lz.id}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {lz.name || lz.zone.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {lz.zone.name} · Floor {lz.zone.floor}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    lz.state === 'ON'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      lz.state === 'ON' ? 'bg-yellow-400' : 'bg-gray-500'
                    }`}
                  />
                  {lz.state}
                </span>
              </div>

              {/* Dim Level Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Dim Level</span>
                  <span className="text-sm font-medium text-white">
                    {lz.dimLevel}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${dimBarColor(
                      lz.dimLevel
                    )}`}
                    style={{ width: `${lz.dimLevel}%` }}
                  />
                </div>
              </div>

              {/* Dim Slider */}
              <div className="mb-4 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50">
                <DimSlider zoneId={lz.zoneId} currentLevel={lz.dimLevel} />
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between">
                <LightToggle zoneId={lz.zoneId} currentState={lz.state} />

                {/* Scene Badge */}
                {lz.scene && lz.scene !== 'NORMAL' && (
                  <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                    <Palette className="w-3 h-3" />
                    {lz.scene}
                  </span>
                )}
              </div>

              {/* Power Consumption */}
              {lz.power > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-500">
                  Power: {lz.power.toFixed(1)} W
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
