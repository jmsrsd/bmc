export function calculateSummary(meters: any[]): { totalKw: string; totalCumulativeKwh: string; meterCount: number } {
  if (!meters.length) return { totalKw: '0.0', totalCumulativeKwh: '0', meterCount: 0 }
  const totalKw = meters.reduce((sum: number, m: any) => sum + m.value, 0).toFixed(1)
  const totalCumulativeKwh = meters.reduce((sum: number, m: any) => sum + m.cumulative, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })
  return { totalKw, totalCumulativeKwh, meterCount: meters.length }
}
