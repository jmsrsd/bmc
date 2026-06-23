import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import type { Metadata } from 'next'
import DashboardGrid from '@/app/components/dynamic/DashboardGrid'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Smart Dashboard | BMC',
  description:
    'Auto-configured SDUI dashboard — widgets are driven entirely by the server-side building configuration.',
}

export default async function SmartDashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/building"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Building Overview
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-cyan-400" />
          Smart Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Widgets are auto-configured from the building's device inventory —
          no manual layout needed.
        </p>
      </div>

      {/* Dashboard Grid */}
      <DashboardGrid />
    </div>
  )
}
