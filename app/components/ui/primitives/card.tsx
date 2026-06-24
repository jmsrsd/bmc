'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  elevated?: boolean
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  const bgClass = elevated ? 'bg-bg-elevated' : 'bg-surface'
  
  return (
    <div className={`${bgClass} backdrop-blur border border-border-hairline rounded-xl ${className}`}>
      {children}
    </div>
  )
}

// Usage: <Card className="p-4"><MetricDisplay ... /></Card>