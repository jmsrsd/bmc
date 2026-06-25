import { prisma } from '@/lib/prisma'
import { PageHeader } from '@/components/ui/page-header'
import { FireClearForm } from './fire-clear-form'

const PANEL_STATE_COLORS: Record<string, string> = {
  NORMAL: '#32D74B',
  ALARM: '#FF453A',
  FAULT: '#FF9F0A',
  DISCONNECTED: '#6B7280',
}

const DEVICE_STATE_COLORS: Record<string, string> = {
  NORMAL: '#32D74B',
  ALARM: '#FF453A',
  FAULT: '#FF9F0A',
}

function PanelStatusLed({ state }: { state: string }) {
  const color = PANEL_STATE_COLORS[state] ?? '#6B7280'
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
      aria-label={`Panel status: ${state}`}
    />
  )
}

function DeviceDot({ state }: { state: string }) {
  const color = DEVICE_STATE_COLORS[state] ?? '#6B7280'
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
        <p className="text-[#8E8E93] text-[14px]">Building not found</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Fire Safety" subtitle="Panel status &amp; device monitoring" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {building.firePanels.map((panel) => (
          <div
            key={panel.id}
            className="bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PanelStatusLed state={panel.state} />
                <h3 className="text-[14px] font-medium text-white">{panel.name}</h3>
              </div>
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: PANEL_STATE_COLORS[panel.state] ?? '#6B7280' }}
              >
                {panel.state}
              </span>
            </div>

            <div className="space-y-2 mt-4">
              <p className="text-[11px] text-[#8E8E93] uppercase tracking-wider">Devices</p>
              {panel.devices.length === 0 ? (
                <p className="text-[12px] text-[#8E8E93]">No devices</p>
              ) : (
                panel.devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center gap-2">
                      <DeviceDot state={device.state} />
                      <span className="text-[#AEAEB2]">{device.type}</span>
                      {device.zone && (
                        <span className="text-[#8E8E93]">· {device.zone}</span>
                      )}
                    </div>
                    <span
                      className="font-medium"
                      style={{ color: DEVICE_STATE_COLORS[device.state] ?? '#6B7280' }}
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
