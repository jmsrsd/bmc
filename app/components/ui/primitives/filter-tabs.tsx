import Link from 'next/link'

interface FilterTab {
  label: string
  href: string
  active?: boolean
}

interface FilterTabsProps {
  tabs: FilterTab[]
}

export function FilterTabs({ tabs }: FilterTabsProps) {
  return (
    <div className="flex gap-1 border-b border-border-hairline">
      {tabs.map((t) => (
        <Link
          key={t.label + t.href}
          href={t.href}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            t.active
              ? 'border-status-active text-white'
              : 'border-transparent text-muted-foreground hover:text-white'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}

interface PillTabsProps {
  tabs: FilterTab[]
}

export function PillTabs({ tabs }: PillTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.label + t.href}
          href={t.href}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            t.active
              ? 'bg-status-active text-white'
              : 'bg-bg-surface text-muted-foreground hover:bg-border-hairline'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}
