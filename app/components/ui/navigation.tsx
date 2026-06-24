'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LayoutDashboard, Building2, Bell, Zap, Flame, ArrowUpFromLine, LogOut, Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/building', label: 'Building', icon: Building2 },
  { href: '/alarms', label: 'Alarms', icon: Bell },
  { href: '/energy', label: 'Energy', icon: Zap },
  { href: '/fire', label: 'Fire Safety', icon: Flame },
  { href: '/elevators', label: 'Elevators', icon: ArrowUpFromLine },
]

export function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-bg-surface border-b border-border-hairline text-muted-foreground">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white font-display">
            <Building2 className="w-6 h-6" />
            <span>BMC</span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-bg-elevated text-white'
                        : 'text-muted-foreground hover:text-white hover:bg-bg-elevated'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Logout + mobile toggle */}
          <div className="flex items-center gap-2">
            <form action="/api/logout" method="post">
              <button
                type="submit"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-white hover:bg-bg-elevated rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </form>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-white rounded-lg"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border-hairline">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-bg-elevated text-white'
                      : 'text-muted-foreground hover:text-white hover:bg-bg-elevated'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}