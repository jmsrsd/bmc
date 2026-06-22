import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Flame, TriangleAlert, CircleX, WifiOff } from 'lucide-react'
import { FireClearForm } from './fire-clear-form'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fire Safety | BMC',
  description: 'Fire alarm panel status and device monitoring',
}

const stateBorder: Record<string, string> = {
  NORMAL: 'border-l-green-500',
  ALARM: 'border-l-red-500',
  FAULT: 'border-l-yellow-500',
  DISCONNECTED: 'border-l-gray-500',
}

const stateBadge: Record<string, string> = {
  NORMAL: 'bg-green-500/10 text-green-400',
  ALARM: 'bg-red-500/10 text-red-400',
  FAULT: 'bg-yellow-500/10 text-yellow-400',
  DISCONNECTED: 'bg-gray-500/10 text-gray-400',
}

const deviceIcons: Record<string, React.ReactNode> = {
  SMOKE: <Flame className="w-4 h-4" />,
  HEAT: <TriangleAlert className="w-4 h-4" />,
  FLOW: <CircleX className="w-4 h-4" />,
  TAMPER: <WifiOff className="w-4 h-4" />,
  MCP: <TriangleAlert className="w-4 h-4" />,
}

const deviceStateBadge: Record<string, string> = {
  NORMAL: 'bg-green-500/10 text-green-400',
  ALARM: 'bg-red-500/10 text-red-400',
  FAULT: 'bg-yellow-500/10 text-yellow-400',
}

const deviceTypeLabel: Record<string, string> = {
  SMOKE: 'Smoke Detector',
  HEAT: 'Heat Detector',
  FLOW: 'Flow Switch',
  TAMPER: 'Tamper Switch',
  MCP: 'Manual Call Point',
}

export default async function FirePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const panels = await prisma.firePanel.findMany({
    include: { devices: true },
    orderBy: { name: 'asc' },
  })

  const alarmCount = panels.filter((p) => p.state === 'ALARM').length

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Fire Safety</h1>
        <p className="text-gray-400 mt-1">
          {panels.length} panel{panels.length !== 1 ? 's' : ''} · {alarmCount} active alarm{alarmCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Panels */}
      {panels.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 text-center">
          <Flame className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Fire Panels</h2>
          <p className="text-gray-400">No fire alarm panels configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {panels.map((panel) => (
            <div
              key={panel.id}
              className={`bg-gray-800/50 backdrop-blur border border-gray-700 border-l-4 ${stateBorder[panel.state] ?? 'border-l-gray-700'} rounded-xl p-6`}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{panel.name}</h3>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    stateBadge[panel.state] ?? 'bg-gray-500/10 text-gray-400'
                  }`}
                >
                  {panel.state}
                </span>
              </div>

              {/* Devices */}
              {panel.devices.length > 0 && (
                <div className="space-y-2 mb-4">
                  {panel.devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center gap-3 bg-gray-900/40 rounded-lg px-3 py-2"
                    >
                      <span className="text-gray-500">
                        {deviceIcons[device.type] ?? <TriangleAlert className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {deviceTypeLabel[device.type] ?? device.type}
                        </p>
                        {device.zone && (
                          <p className="text-xs text-gray-500">Zone: {device.zone}</p>
                        )}
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          deviceStateBadge[device.state] ?? 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        {device.state}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {panel.devices.length === 0 && (
                <p className="text-sm text-gray-500 mb-4">No devices</p>
              )}

              {/* Clear Alarm Action */}
              {panel.state === 'ALARM' && (
                <FireClearForm panelId={panel.id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
