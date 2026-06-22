import Link from 'next/link'
import { Building2, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-12 max-w-md">
        <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-3">404</h1>
        <h2 className="text-xl font-semibold text-gray-200 mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
