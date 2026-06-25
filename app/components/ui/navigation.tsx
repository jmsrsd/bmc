import Link from 'next/link'
import {
  Building2,
  Thermometer,
  Lightbulb,
  Shield,
  Bell,
  Flame,
  ArrowUpDown,
  Zap,
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Building', href: '/building', icon: <Building2 size={18} /> },
  { label: 'HVAC', href: '/building/hvac', icon: <Thermometer size={18} /> },
  { label: 'Lighting', href: '/building/lighting', icon: <Lightbulb size={18} /> },
  { label: 'Security', href: '/building/security', icon: <Shield size={18} /> },
  { label: 'Alarms', href: '/alarms', icon: <Bell size={18} /> },
  { label: 'Fire', href: '/fire', icon: <Flame size={18} /> },
  { label: 'Elevators', href: '/elevators', icon: <ArrowUpDown size={18} /> },
  { label: 'Energy', href: '/energy', icon: <Zap size={18} /> },
]

type NavigationProps = {
  className?: string
}

export function Navigation({ className = '' }: NavigationProps) {
  return (
    <nav
      className={`w-56 fixed left-0 h-screen bg-[#0B0B0C] border-r border-[#242427] pt-6 px-4 flex flex-col gap-1 ${className}`}
    >
      <div className="px-3 mb-6">
        <h1 className="text-[18px] font-semibold text-white leading-tight">BMC</h1>
        <p className="text-[#8E8E93] text-xs mt-0.5">Biomedical Campus</p>
      </div>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#AEAEB2] hover:text-white hover:bg-[#242427] transition-colors"
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
