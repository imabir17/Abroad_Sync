export default function LeadsLoading() {
  return (
    <div className="space-y-6 animate-pulse pb-12">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-40 bg-neutral-800 rounded-lg mb-2"></div>
          <div className="h-4 w-60 bg-neutral-800/60 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-neutral-800 rounded-lg"></div>
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="h-10 w-full md:w-80 bg-neutral-800 rounded-lg"></div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-28 bg-neutral-800 rounded-lg"></div>
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl overflow-hidden shadow-sm">
        <div className="border-b border-neutral-800 px-6 py-4 bg-neutral-900/30 flex justify-between">
          <div className="h-4 w-32 bg-neutral-800 rounded"></div>
          <div className="h-4 w-24 bg-neutral-800 rounded"></div>
        </div>
        <div className="divide-y divide-neutral-850">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 bg-neutral-800 rounded"></div>
                <div className="h-3 w-56 bg-neutral-800/60 rounded"></div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="h-6 w-20 bg-neutral-800 rounded-full"></div>
                <div className="h-6 w-16 bg-neutral-800 rounded-full"></div>
                <div className="h-8 w-8 bg-neutral-800 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
