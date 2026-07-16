export type StatusLedStatus = 'normal' | 'warning' | 'critical' | 'active' | 'unknown'

const STATUS_COLORS: Record<StatusLedStatus, string> = {
  normal: '#32D74B',
  warning: '#FF9F0A',
  critical: '#FF453A',
  active: '#0A84FF',
  unknown: '#8E8E93',
}

type StatusLedProps = {
  status: StatusLedStatus
  className?: string
}

export function StatusLed({ status, className = '' }: StatusLedProps) {
  const color = STATUS_COLORS[status]
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${className}`}
      style={{ backgroundColor: color }}
      aria-label={`Status: ${status}`}
    />
  )
}
