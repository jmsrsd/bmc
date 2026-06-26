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
import type { ReactNode } from 'react'

export type NavItem = {
  label: string
  href: string
  icon: ReactNode
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Building', href: '/building', icon: <Building2 size={18} /> },
  { label: 'HVAC', href: '/building/hvac', icon: <Thermometer size={18} /> },
  { label: 'Lighting', href: '/building/lighting', icon: <Lightbulb size={18} /> },
  { label: 'Security', href: '/building/security', icon: <Shield size={18} /> },
  { label: 'Alarms', href: '/alarms', icon: <Bell size={18} /> },
  { label: 'Fire', href: '/fire', icon: <Flame size={18} /> },
  { label: 'Elevators', href: '/elevators', icon: <ArrowUpDown size={18} /> },
  { label: 'Energy', href: '/energy', icon: <Zap size={18} /> },
]
