'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  icon?: ReactNode
  label: string
  value: string | number
  highlight?: boolean
  children?: ReactNode
}

export function StatCard({ icon, label, value, highlight, children }: StatCardProps) {
  return (
    <div className="bg-bg-surface/50 backdrop-blur border border-border-hairline rounded-xl p-5 flex items-center gap-4">
      {icon && (
        <div className={`p-3 rounded-lg ${highlight ? 'bg-status-critical/10' : 'bg-bg-elevated/50'}`}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold font-mono ${highlight ? 'text-status-critical' : 'text-white'}`}>
          {value ?? children}
        </p>
      </div>
    </div>
  )
}
