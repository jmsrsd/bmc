'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSidebar } from './sidebar-context'
import { NAV_ITEMS } from '../components/ui/nav-items'
import { X, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export function AppSidebar() {
  const pathname = usePathname()
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useSidebar()

  const navList = (onClick?: () => void) =>
    NAV_ITEMS.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={onClick}
          className={`flex items-center gap-3 mx-2 px-3 py-2 min-h-[44px] rounded-lg text-sm transition-colors ${
            isActive
              ? 'bg-elevated text-white'
              : 'text-body hover:text-white hover:bg-hairline'
          } ${collapsed ? 'justify-center px-0 mx-1' : ''}`}
          title={collapsed ? item.label : undefined}
          aria-current={isActive ? 'page' : undefined}
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed && <span>{item.label}</span>}
        </Link>
      )
    })

  return (
    <>
      {/* ─── Desktop sidebar ─── */}
      <aside
        className={`hidden md:flex md:flex-col border-r border-hairline bg-canvas overflow-hidden transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Header */}
        <div className={`mt-6 mb-6 ${collapsed ? 'flex justify-center' : 'px-4'}`}>
          {collapsed ? (
            <span className="text-[18px] font-semibold text-white">B</span>
          ) : (
            <div>
              <h1 className="text-[18px] font-semibold text-white leading-tight">BMC</h1>
              <p className="text-secondary text-xs mt-0.5">Biomedical Campus</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1">{navList()}</nav>

        {/* Collapse toggle */}
        <div className={collapsed ? 'flex justify-center p-3' : 'flex justify-end p-3'}>
          <button
            onClick={toggleCollapsed}
            className="text-secondary hover:text-white transition-colors p-1 rounded"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </aside>

      {/* ─── Mobile off-canvas ─── */}
      <div className="md:hidden">
        {/* Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={closeMobile} aria-hidden="true" />
        )}

        {/* Drawer */}
        <aside
          className={`fixed top-0 left-0 z-40 h-full w-56 bg-canvas border-r border-hairline transition-transform duration-200 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <h2 className="text-h2">BMC</h2>
            <button
              onClick={closeMobile}
              className="text-secondary hover:text-white transition-colors"
              aria-label="Close navigation menu"
            >
              <X size={16} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 mt-2">{navList(closeMobile)}</nav>
        </aside>
      </div>
    </>
  )
}
