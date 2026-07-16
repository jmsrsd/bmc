type CardProps = {
  className?: string
  children: React.ReactNode
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div
      className={`bg-surface/50 border border-hairline rounded-xl p-5 ${className}`}
    >
      {children}
    </div>
  )
}
