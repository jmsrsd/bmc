// Status color tokens — single source of truth
// Aligned with DESIGN.md §7.4.1 (Editorial Charcoal palette)

export const STATUS_LED_COLORS = {
  normal: '#32D74B',
  warning: '#FF9F0A',
  critical: '#FF453A',
  active: '#0A84FF',
  unknown: '#6B7280',
} as const

export const PANEL_STATE_COLORS: Record<string, string> = {
  NORMAL: '#32D74B',
  ALARM: '#FF453A',
  FAULT: '#FF9F0A',
  DISCONNECTED: '#6B7280',
}

export const DEVICE_STATE_COLORS: Record<string, string> = {
  NORMAL: '#32D74B',
  ALARM: '#FF453A',
  FAULT: '#FF9F0A',
}

export const ELEVATOR_STATE_COLORS: Record<string, string> = {
  NORMAL: '#32D74B',
  RECALL: '#FF9F0A',
  FAULT: '#FF453A',
}

export const DOOR_STATE_COLORS: Record<string, string> = {
  UNLOCKED: '#32D74B',
  LOCKED: '#FF9F0A',
  FORCED: '#FF453A',
}

export const DOOR_STATE_LABELS: Record<string, string> = {
  UNLOCKED: 'Unlocked',
  LOCKED: 'Locked',
  FORCED: 'Forced',
}

export const ALARM_SEVERITY_COLORS: Record<string, string> = {
  critical: '#FF453A',
  warning: '#FF9F0A',
  info: '#0A84FF',
}
