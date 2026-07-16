import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <div>
        <h1 className="text-h1 mb-2">404</h1>
        <p className="text-body mb-6">Page not found</p>
        <Link href="/building" className="text-active hover:underline">
          Return to building
        </Link>
      </div>
    </div>
  )
}
