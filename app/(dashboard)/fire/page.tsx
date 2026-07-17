import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { FireClearForm } from './fire-clear-form'
import { PANEL_STATE_COLORS, getPanelStatusColor, getDeviceStatusColor, buildFireRows, DEVICE_STATE_COLORS } from './_helpers'

function PanelStatusLed({ state }: { state: string }) {
  const color = PANEL_STATE_COLORS[state] ?? '#8E8E93'
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      aria-label={`Panel status: ${state}`}
    />
  )
}

function DeviceDot({ state }: { state: string }) {
  const color = DEVICE_STATE_COLORS[state] ?? '#8E8E93'
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
      style={{ backgroundColor: color }}
    />
  )
}

export default async function FirePage() {
  const building = await prisma.building.findUnique({
    where: { id: 'b1' },
    include: {
      firePanels: {
        include: {
          devices: true,
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

  const panels = buildFireRows(building)

  return (
    <div>
      <PageHeader title="Fire Safety" subtitle="Panel status & device monitoring" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {panels.map((panel: any) => (
          <div
            key={panel.id}
            className="bg-surface/50 border border-hairline rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PanelStatusLed state={panel.state} />
                <h3 className="text-[14px] font-medium text-white">{panel.name}</h3>
              </div>
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: panel.statusColor }}
              >
                {panel.state}
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <p className="text-[11px] text-secondary uppercase tracking-wider">Devices</p>
              {panel.devices.length === 0 ? (
                <p className="text-[12px] text-secondary">No devices</p>
              ) : (
                panel.devices.map((device: any) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center gap-2">
                      <DeviceDot state={device.state} />
                      <span className="text-body">{device.type}</span>
                      {device.zone && (
                        <span className="text-secondary">· {device.zone}</span>
                      )}
                    </div>
                    <span
                      className="font-medium"
                      style={{ color: device.statusColor }}
                    >
                      {device.state}
                    </span>
                  </div>
                ))
              )}
            </div>

            {panel.state === 'ALARM' && (
              <FireClearForm panelId={panel.id} panelName={panel.name} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
