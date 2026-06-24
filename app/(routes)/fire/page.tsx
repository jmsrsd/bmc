import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Flame, TriangleAlert, CircleX, WifiOff } from 'lucide-react'
import { FireClearForm } from './fire-clear-form'
import { BackLink, PageHeader, StatusBadge, EmptyState } from '@/components/ui/primitives'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Fire Safety | BMC',
  description: 'Fire alarm panel status and device monitoring',
}

function stateStatus(state: string): 'normal' | 'warning' | 'critical' {
  if (state === 'ALARM') return 'critical'
  if (state === 'FAULT' || state === 'DISCONNECTED') return 'warning'
  return 'normal'
}

const deviceIcons: Record<string, React.ReactNode> = {
  SMOKE: <Flame className="w-4 h-4" />,
  HEAT: <TriangleAlert className="w-4 h-4" />,
  FLOW: <CircleX className="w-4 h-4" />,
  TAMPER: <WifiOff className="w-4 h-4" />,
  MCP: <TriangleAlert className="w-4 h-4" />,
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
  const subtitle = `${panels.length} panel${panels.length !== 1 ? 's' : ''} · ${alarmCount} active alarm${alarmCount !== 1 ? 's' : ''}`

  return (
    <div className="space-y-6">
      <BackLink href="/" />

      <PageHeader title="Fire Safety" subtitle={subtitle} />

      {panels.length === 0 ? (
        <EmptyState
          icon={<Flame className="w-12 h-12" />}
          title="No Fire Panels"
          description="No fire alarm panels configured."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {panels.map((panel) => (
            <div
              key={panel.id}
              className={`bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-6`}
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{panel.name}</h3>
                </div>
                <StatusBadge status={stateStatus(panel.state)}>
                  {panel.state}
                </StatusBadge>
              </div>

              {/* Devices */}
              {panel.devices.length > 0 && (
                <div className="space-y-2 mb-4">
                  {panel.devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center gap-3 bg-bg-elevated/40 rounded-lg px-3 py-2"
                    >
                      <span className="text-muted-foreground">
                        {deviceIcons[device.type] ?? <TriangleAlert className="w-4 h-4" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {deviceTypeLabel[device.type] ?? device.type}
                        </p>
                        {device.zone && (
                          <p className="text-xs text-muted-foreground">Zone: {device.zone}</p>
                        )}
                      </div>
                      <StatusBadge
                        status={device.state === 'ALARM' ? 'critical' : device.state === 'FAULT' ? 'warning' : 'normal'}
                      >
                        {device.state}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              )}

              {panel.devices.length === 0 && (
                <p className="text-sm text-muted-foreground mb-4">No devices</p>
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
