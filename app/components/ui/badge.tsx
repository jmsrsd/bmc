export type BadgeVariant = 'critical' | 'warning' | 'normal' | 'active' | 'info' | 'neutral'

type BadgeProps = {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  critical: 'bg-[#FF453A]/10 text-[#FF453A]',
  warning: 'bg-[#FF9F0A]/10 text-[#FF9F0A]',
  normal: 'bg-[#32D74B]/10 text-[#32D74B]',
  active: 'bg-[#0A84FF]/10 text-[#0A84FF]',
  info: 'bg-[#0A84FF]/10 text-[#0A84FF]',
  neutral: 'bg-[#242427] text-[#AEAEB2]',
}

export function Badge({ variant = 'neutral', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
