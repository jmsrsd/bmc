import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { BUILDING_ID } from '@/lib/types'
import { buildUiConfig } from '@/lib/ui-config/service'
import { SUPPORTED_SCHEMA_VERSION } from '@/lib/ui-config/types'
import { DashboardClient } from './DashboardClient'
import { AlertTriangle } from 'lucide-react'

/**
 * Server component that gates on auth, fetches the UI config,
 * checks schema version compatibility, and renders DashboardClient.
 */
export default async function DashboardGrid() {
  const session = await getSession()
  if (!session) redirect('/login')

  const config = await buildUiConfig(BUILDING_ID)

  // ── Version mismatch banner ──────────────────────────────────
  if (config.version > SUPPORTED_SCHEMA_VERSION) {
    return (
      <div className="space-y-6">
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-1">
              Schema Version Mismatch
            </h3>
            <p className="text-sm text-amber-200/70">
              The dashboard configuration (v{config.version}) is newer than this
              application supports (v{SUPPORTED_SCHEMA_VERSION}). Some widgets may
              not render correctly. Update the application to the latest version.
            </p>
          </div>
        </div>
        <DashboardClient config={config} />
      </div>
    )
  }

  // ── Empty state ──────────────────────────────────────────────
  if (config.zones.length === 0 && config.global.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
        <div className="w-12 h-12 rounded-lg bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⊞</span>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          No Dashboard Widgets
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          No zones or global widgets have been configured yet. Add devices to
          your building to see them appear here automatically.
        </p>
      </div>
    )
  }

  return <DashboardClient config={config} />
}
