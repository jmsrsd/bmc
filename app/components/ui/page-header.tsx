type PageHeaderProps = {
  title: string
  subtitle?: string
  className?: string
}

export function PageHeader({ title, subtitle, className = '' }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-[24px] font-semibold text-white leading-tight tracking-[-0.02em]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[14px] font-medium text-[#8E8E93] mt-1">{subtitle}</p>
      )}
    </div>
  )
}
