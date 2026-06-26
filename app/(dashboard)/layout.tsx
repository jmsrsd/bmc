import Link from 'next/link'
import { MobileNav } from '@/components/mobile-nav'

const navItems = [
  { href: '/building', label: 'Building' },
  { href: '/building/hvac', label: 'HVAC' },
  { href: '/building/lighting', label: 'Lighting' },
  { href: '/building/security', label: 'Security' },
  { href: '/alarms', label: 'Alarms' },
  { href: '/fire', label: 'Fire' },
  { href: '/elevators', label: 'Elevators' },
  { href: '/energy', label: 'Energy' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <MobileNav items={navItems} />
      <nav className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-[#242427] bg-[#0B0B0C] p-4 gap-1">
        <div className="mb-6 px-3">
          <h2 className="text-h2">BMC</h2>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-body rounded-lg px-3 py-3 transition-colors hover:bg-[#1C1C1E] hover:text-[#FFFFFF]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className="flex-1 bg-[#0B0B0C] p-6">{children}</main>
    </div>
  )
}
