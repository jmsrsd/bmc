'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'

type SidebarCtx = {
  collapsed: boolean
  mobileOpen: boolean
  toggleCollapsed: () => void
  toggleMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarCtx | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Restore persisted collpased state
  useEffect(() => {
    const saved = localStorage.getItem('bmc-sidebar')
    if (saved === '1') setCollapsed(true)
  }, [])

  // Persist collapsed state
  useEffect(() => {
    localStorage.setItem('bmc-sidebar', collapsed ? '1' : '0')
  }, [collapsed])

  // Close mobile nav on resize to desktop
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const handler = () => { if (mql.matches) setMobileOpen(false) }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), [])
  const toggleMobile = useCallback(() => setMobileOpen((c) => !c), [])
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, toggleCollapsed, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}
