import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface BackLinkProps {
  href: string
  label?: string
}

export function BackLink({ href, label = 'Dashboard' }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </Link>
  )
}
