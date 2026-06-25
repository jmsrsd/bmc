type CardProps = {
  className?: string
  children: React.ReactNode
}

export function Card({ className = '', children }: CardProps) {
  return (
    <div
      className={`bg-[#121214]/50 backdrop-blur border border-[#242427] rounded-xl p-5 ${className}`}
    >
      {children}
    </div>
  )
}
