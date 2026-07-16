import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from './card'

type StatCardProps = {
  label: string
  value: string | number
  trend?: number
  className?: string
}

export function StatCard({ label, value, trend, className = '' }: StatCardProps) {
  return (
    <Card className={className}>
      <p className="font-['JetBrains_Mono'] text-[32px] font-light text-white leading-none tracking-[-0.02em]">
        {value}
      </p>
      <p className="text-body text-xs mt-1.5">{label}</p>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend > 0 ? (
            <>
              <TrendingUp size={14} className="text-normal" />
              <span className="text-normal text-xs">+{trend}%</span>
            </>
          ) : trend < 0 ? (
            <>
              <TrendingDown size={14} className="text-critical" />
              <span className="text-critical text-xs">{trend}%</span>
            </>
          ) : null}
        </div>
      )}
    </Card>
  )
}
