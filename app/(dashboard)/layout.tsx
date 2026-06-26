import { SidebarProvider } from '@/components/sidebar-context'
import { AppSidebar } from '@/components/app-sidebar'
import { MobileTopBar } from '@/components/mobile-top-bar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 min-w-0 bg-[#0B0B0C]">
          <MobileTopBar />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
