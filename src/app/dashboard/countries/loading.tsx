export default function Loading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="h-8 w-48 bg-[#AEB9C9]/20 rounded-lg"></div>
          <div className="h-4 w-64 bg-[#AEB9C9]/20 rounded mt-2"></div>
        </div>
        <div className="h-10 w-32 bg-[#AEB9C9]/20 rounded-xl"></div>
      </div>
      <div className="bg-[#E7ECF3] rounded-2xl shadow-[8px_8px_16px_#AEB9C9,-8px_-8px_16px_#FFFFFF] border border-[#AEB9C9]/20 h-[600px]"></div>
    </div>
  )
}
