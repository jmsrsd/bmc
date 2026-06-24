'use client'

import { ReactNode } from 'react'
import { StatusLed } from './status-led'
import type { Severity } from '@/lib/utils'

interface StatusBadgeProps {
  status: Severity
  children: ReactNode
}

const colors: Record<Severity, string> = {
  critical: 'bg-status-critical/10 text-status-critical',
  warning: 'bg-status-warning/10 text-status-warning',
  info: 'bg-status-active/10 text-status-active',
  normal: 'bg-status-normal/10 text-status-normal',
}

const led: Record<Severity, 'critical' | 'warning' | 'normal'> = {
  critical: 'critical',
  warning: 'warning',
  info: 'normal',
  normal: 'normal',
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colors[status]}`}>
      <StatusLed status={led[status]} />
      {children}
    </span>
  )
}
