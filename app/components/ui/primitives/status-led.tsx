'use client'

type Status = 'normal' | 'warning' | 'critical' | 'unknown'

const statusColors: Record<Status, string> = {
  normal: 'bg-status-normal',
  warning: 'bg-status-warning',
  critical: 'bg-status-critical',
  unknown: 'bg-gray-500',
}

interface StatusLedProps {
  status: Status
  className?: string
}

export function StatusLed({ status, className = '' }: StatusLedProps) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${statusColors[status]} ${className}`}
      aria-label={`${status} status`}
    />
  )
}

// Usage: <StatusLed status="critical" /> for 6px LED indicator