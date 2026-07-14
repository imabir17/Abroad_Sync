import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { generateReports, getAllCounselors } from '@/app/actions/reports'
import { ReportFilters } from '@/components/ReportFilters'
import { ReportCharts } from '@/components/ReportCharts'
import { DownloadPDFButton } from '@/components/DownloadPDFButton'

// In Next.js 15+, searchParams is a promise
export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const resolvedParams = await searchParams
  const range = resolvedParams.range || 'thisMonth'
  const startParam = resolvedParams.start
  const endParam = resolvedParams.end
  const counselorIdParam = resolvedParams.counselorId

  const isAdmin = user.role === 'Super Admin' || user.role === 'Manager'
  
  // If not admin, they can't query other counselors
  const targetCounselorId = isAdmin ? counselorIdParam : user.id

  let startDate = new Date()
  let endDate = new Date()

  if (range === 'thisWeek') {
    const day = startDate.getDay()
    startDate.setDate(startDate.getDate() - day)
    startDate.setHours(0, 0, 0, 0)
    endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    endDate.setHours(23, 59, 59, 999)
  } else if (range === 'lastMonth') {
    startDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1)
    endDate = new Date(startDate.getFullYear(), startDate.getMonth(), 0, 23, 59, 59, 999)
  } else if (range === 'custom' && startParam && endParam) {
    startDate = new Date(startParam)
    endDate = new Date(endParam)
    endDate.setHours(23, 59, 59, 999)
  } else {
    // thisMonth (default)
    startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999)
  }

  const reports = await generateReports(startDate, endDate, targetCounselorId)
  const counselors = await getAllCounselors()

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-display">Counselor Performance Reports</h2>
          <p className="text-xs text-gray-600">Detailed metrics tracking counselor application progress and timelines.</p>
        </div>
      </div>

      <ReportFilters counselors={counselors} isAdmin={isAdmin} />

      {reports.length === 0 ? (
        <div className="neo-raised p-12 text-center">
          <p className="text-xs font-bold text-gray-400">No data found for the selected time range and counselor.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {reports.map((report) => (
            <div 
              key={report.counselorId} 
              id={`report-card-${report.counselorId}`} 
              className="neo-raised overflow-hidden relative bg-white"
            >
              {/* Report Card Header */}
              <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#DCE3ED]">
                <h3 className="text-base font-bold text-gray-900 font-display">{report.counselorName}</h3>
                <div className="flex items-center gap-4">
                  <div className="text-xs font-bold text-gray-600">
                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </div>
                  <DownloadPDFButton 
                    report={report}
                    dateRange={`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                    filename={`${report.counselorName}-Performance-Report.pdf`} 
                  />
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="bg-white shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] border border-gray-200 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                    <span className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Leads Handed</span>
                    <span className="text-2xl font-black text-[#4855E4] font-display">{report.leadsHanded}</span>
                    <span className="text-[9px] text-gray-400 font-semibold mt-1.5 leading-tight">Assigned in period</span>
                  </div>
                  
                  <div className="bg-white shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] border border-gray-200 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                    <span className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Leads Contacted</span>
                    <span className="text-2xl font-black text-[#FF7A52] font-display">{report.leadsContacted}</span>
                    <span className="text-[9px] text-gray-400 font-semibold mt-1.5 leading-tight">First touch in period</span>
                  </div>

                  <div className="bg-white shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] border border-gray-200 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                    <span className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Files Opened</span>
                    <span className="text-2xl font-black text-[#21C285] font-display">{report.filesOpened}</span>
                    <span className="text-[9px] text-gray-400 font-semibold mt-1.5 leading-tight">Opened in period</span>
                  </div>
                  
                  <div className="bg-white shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] border border-gray-200 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                    <span className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Leads Created</span>
                    <span className="text-2xl font-black text-[#12A8B5] font-display">{report.leadsCreated}</span>
                    <span className="text-[9px] text-gray-400 font-semibold mt-1.5 leading-tight">Generated by counselor</span>
                  </div>

                  <div className="bg-white shadow-[inset_2.5px_2.5px_5px_#AEB9C9,inset_-2.5px_-2.5px_5px_#FFFFFF] border border-gray-200 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                    <span className="text-gray-400 text-[10px] font-bold mb-1 uppercase tracking-wider">Active Pipeline</span>
                    <span className="text-2xl font-black text-gray-900 font-display">{report.activePipeline}</span>
                    <span className="text-[9px] text-gray-400 font-semibold mt-1.5 leading-tight">Total currently assigned</span>
                  </div>
                </div>

                {/* Stages & Visual Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Table Breakdown */}
                  <div className="lg:col-span-1 neo-raised overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-[#DCE3ED]">
                      <h4 className="text-xs font-bold text-gray-900">Stage Breakdown</h4>
                    </div>
                    <div className="max-h-[380px] overflow-y-auto">
                      <table className="w-full text-xs text-left text-gray-600 border-collapse">
                        <tbody>
                          {report.stageBreakdown
                            .sort((a, b) => b.count - a.count)
                            .map((stage) => (
                            <tr key={stage.stage} className="border-b border-gray-200 hover:bg-[#DCE3ED]/15 transition-colors">
                              <td className="px-4 py-3 font-bold text-gray-900">{stage.stage}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  stage.count > 0 ? 'bg-blue-500/10 text-blue-600' : 'text-gray-400'
                                }`}>
                                  {stage.count}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Chart Wrapper */}
                  <div className="lg:col-span-2 neo-raised p-6">
                     <ReportCharts data={report.stageBreakdown} />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
