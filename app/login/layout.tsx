import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | BMC',
  description: 'Building Management Control system login',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
