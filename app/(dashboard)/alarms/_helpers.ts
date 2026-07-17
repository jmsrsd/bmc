export function severityColor(severity: string) {
  switch (severity) {
    case 'critical': return '#FF453A'
    case 'warning': return '#FF9F0A'
    case 'info': return '#0A84FF'
    default: return '#8E8E93'
  }
}

export function relativeTime(date: Date) {
  const now = Date.now()
  const diff = now - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-ID', { month: 'short', day: 'numeric' })
}

export type AlarmRow = {
  id: string
  severity: string
  message: string
  zoneName: string
  source: string
  createdAt: Date
  showAck?: boolean
}
