// Metric value display — extracted from energy/page.tsx + building/page.tsx inline patterns

type MetricValueProps = {
  value: string | number
  label: string
  className?: string
  size?: 'lg' | 'md'
}

export function MetricValue({ value, label, className = '' }: MetricValueProps) {
  return (
    <div className={`bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5 ${className}`}>
      <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
        {value}
      </p>
      <p className="text-[#AEAEB2] text-xs mt-1.5">{label}</p>
    </div>
  )
}
