type MetricValueProps = {
  value: string | number
  label: string
  className?: string
}

export function MetricValue({ value, label, className = '' }: MetricValueProps) {
  return (
    <div className={`bg-surface/50 border border-hairline rounded-xl p-5 ${className}`}>
      <p className="text-[32px] font-light text-white leading-none tracking-[-0.02em]">{value}</p>
      <p className="text-body text-xs mt-1.5">{label}</p>
    </div>
  )
}
