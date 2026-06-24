interface PageHeaderProps {
  title: string
  subtitle?: string | number | null
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white font-display">{title}</h1>
      {subtitle != null && <p className="text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  )
}
