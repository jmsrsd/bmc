export const PANEL_STATE_COLORS: Record<string, string> = {
  NORMAL: '#32D74B',
  ALARM: '#FF453A',
  FAULT: '#FF9F0A',
  DISCONNECTED: '#8E8E93',
}

export const DEVICE_STATE_COLORS: Record<string, string> = {
  NORMAL: '#32D74B',
  ALARM: '#FF453A',
  FAULT: '#FF9F0A',
}

export function getPanelStatusColor(state: string): string {
  return PANEL_STATE_COLORS[state] ?? '#8E8E93'
}

export function getDeviceStatusColor(state: string): string {
  return DEVICE_STATE_COLORS[state] ?? '#8E8E93'
}

export function buildFireRows(building: any): any[] {
  if (!building) return []
  return building.firePanels.map((panel: any) => {
    const devices = panel.devices ?? []
    return {
      id: panel.id,
      name: panel.name,
      state: panel.state,
      statusColor: getPanelStatusColor(panel.state),
      deviceCount: devices.length,
      devices: devices.map((device: any) => ({
        id: device.id,
        type: device.type,
        state: device.state,
        zone: device.zone,
        statusColor: getDeviceStatusColor(device.state),
      })),
    }
  })
}
