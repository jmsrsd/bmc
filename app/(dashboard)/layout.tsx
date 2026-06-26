import { SidebarProvider } from '@/components/sidebar-context'
import { AppSidebar } from '@/components/app-sidebar'

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
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 min-w-0 bg-[#0B0B0C] p-6">{children}</main>
      </div>
    </SidebarProvider>
  )
}
