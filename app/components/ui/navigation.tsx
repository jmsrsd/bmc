'use client'

import Link from 'next/link'
import { NAV_ITEMS } from './nav-items'

type NavigationProps = {
  className?: string
}

export function Navigation({ className = '' }: NavigationProps) {
  return (
    <nav
      className={`w-56 fixed left-0 h-screen bg-canvas border-r border-hairline pt-6 px-4 flex flex-col gap-1 ${className}`}
    >
      <div className="px-3 mb-6">
        <h1 className="text-[18px] font-semibold text-white leading-tight">BMC</h1>
        <p className="text-secondary text-xs mt-0.5">Biomedical Campus</p>
      </div>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-body hover:text-white hover:bg-hairline transition-colors"
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
