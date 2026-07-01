export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse pb-12">
      <div>
        <div className="h-8 w-48 bg-neutral-800 rounded-lg mb-2"></div>
        <div className="h-4 w-72 bg-neutral-800/60 rounded-md"></div>
      </div>

      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-6 h-32 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-24 bg-neutral-800 rounded"></div>
              <div className="h-5 w-5 bg-neutral-800 rounded-full"></div>
            </div>
            <div className="h-8 w-16 bg-neutral-800 rounded mt-4"></div>
          </div>
        ))}
      </div>

      {/* Agenda Card */}
      <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-6 h-40 flex flex-col justify-between">
        <div className="h-6 w-36 bg-neutral-800 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-neutral-800/60 rounded"></div>
          <div className="h-4 w-5/6 bg-neutral-800/40 rounded"></div>
        </div>
      </div>

      {/* Ratings Section */}
      <div>
        <div className="h-6 w-32 bg-neutral-800 rounded mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-neutral-900/40 border border-neutral-800/60 rounded-xl p-4 h-24 flex flex-col justify-between">
              <div className="h-3 w-16 bg-neutral-800 rounded"></div>
              <div className="h-6 w-8 bg-neutral-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
