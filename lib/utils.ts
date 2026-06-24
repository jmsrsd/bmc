export function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function dimBarColor(level: number): string {
  if (level >= 75) return 'bg-status-active'
  if (level >= 40) return 'bg-status-warning'
  return 'bg-amber-600'
}

export type Severity = 'critical' | 'warning' | 'info' | 'normal'
export type Unit = '°C' | '%' | 'kW' | 'kWh' | 'ppm' | string
