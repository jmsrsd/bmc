'use client'

import { Menu } from 'lucide-react'
import { useSidebar } from './sidebar-context'

export function MobileTopBar() {
  const { toggleMobile } = useSidebar()

  return (
    <div className="sticky top-0 z-40 flex items-center h-14 px-4 bg-canvas border-b border-hairline md:hidden">
      <button
        onClick={toggleMobile}
        className="p-2 -ml-2 rounded-lg text-white hover:bg-elevated transition-colors"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>
      <span className="ml-2 text-[18px] font-semibold text-white leading-tight">BMC</span>
    </div>
  )
}
