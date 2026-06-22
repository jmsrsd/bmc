export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-48 bg-gray-700/50 rounded-lg" />
        <div className="h-5 w-32 bg-gray-700/30 rounded-lg" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-3"
          >
            <div className="w-10 h-10 bg-gray-700/50 rounded-lg" />
            <div className="h-4 w-20 bg-gray-700/30 rounded" />
            <div className="h-7 w-16 bg-gray-700/40 rounded" />
          </div>
        ))}
      </div>

      {/* Section skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-gray-700/40 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-gray-700/40 rounded" />
                <div className="h-5 w-16 bg-gray-700/30 rounded-full" />
              </div>
              <div className="h-4 w-full bg-gray-700/30 rounded" />
              <div className="h-4 w-3/4 bg-gray-700/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
