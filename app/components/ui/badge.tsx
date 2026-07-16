export type BadgeVariant = 'critical' | 'warning' | 'normal' | 'active' | 'info' | 'neutral'

type BadgeProps = {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  critical: 'bg-critical/10 text-critical',
  warning: 'bg-warning/10 text-warning',
  normal: 'bg-normal/10 text-normal',
  active: 'bg-active/10 text-active',
  info: 'bg-active/10 text-active',
  neutral: 'bg-hairline text-body',
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
