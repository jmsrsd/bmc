export default function BuildingLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-24 bg-gray-700/30 rounded" />

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-64 bg-gray-700/50 rounded-lg" />
        <div className="h-5 w-40 bg-gray-700/30 rounded-lg" />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-gray-700/50 rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-700/30 rounded" />
              <div className="h-7 w-16 bg-gray-700/40 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Section header skeleton */}
      <div className="h-6 w-24 bg-gray-700/40 rounded-lg" />

      {/* Zone cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="h-5 w-28 bg-gray-700/40 rounded" />
                <div className="h-4 w-16 bg-gray-700/30 rounded" />
              </div>
              <div className="h-5 w-20 bg-gray-700/30 rounded-full" />
            </div>
            <div className="h-4 w-24 bg-gray-700/20 rounded" />
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-gray-700/50 rounded-full" />
              <div className="h-4 w-24 bg-gray-700/30 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                <div className="h-4 w-8 bg-gray-700/30 rounded mx-auto" />
                <div className="h-6 w-12 bg-gray-700/40 rounded mx-auto" />
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3 space-y-2">
                <div className="h-4 w-8 bg-gray-700/30 rounded mx-auto" />
                <div className="h-6 w-12 bg-gray-700/40 rounded mx-auto" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-700/20 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
