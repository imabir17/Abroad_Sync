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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Counselor Performance Reports</h1>
      </div>

      <ReportFilters counselors={counselors} isAdmin={isAdmin} />

      {reports.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <p className="text-neutral-400">No data found for the selected time range and counselor.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reports.map((report) => (
            <div key={report.counselorId} id={`report-card-${report.counselorId}`} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden relative">
              {/* Optional: Add a subtle overlay when generating if we want to extract it, but html2canvas captures as is */}
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
                <h2 className="text-xl font-bold text-white">{report.counselorName}</h2>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-neutral-400">
                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </div>
                  <DownloadPDFButton 
                    report={report}
                    dateRange={`${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`}
                    filename={`${report.counselorName}-Performance-Report.pdf`} 
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {/* Metric Cards */}
                  <div className="bg-neutral-950 rounded-lg p-5 border border-neutral-800 flex flex-col justify-center items-center text-center">
                    <span className="text-neutral-400 text-xs font-medium mb-1 uppercase tracking-wider">Leads Handed</span>
                    <span className="text-2xl font-bold text-blue-400">{report.leadsHanded}</span>
                    <span className="text-[10px] text-neutral-500 mt-1 leading-tight">Assigned in period</span>
                  </div>
                  
                  <div className="bg-neutral-950 rounded-lg p-5 border border-neutral-800 flex flex-col justify-center items-center text-center">
                    <span className="text-neutral-400 text-xs font-medium mb-1 uppercase tracking-wider">Leads Contacted</span>
                    <span className="text-2xl font-bold text-amber-400">{report.leadsContacted}</span>
                    <span className="text-[10px] text-neutral-500 mt-1 leading-tight">First touch in period</span>
                  </div>

                  <div className="bg-neutral-950 rounded-lg p-5 border border-neutral-800 flex flex-col justify-center items-center text-center">
                    <span className="text-neutral-400 text-xs font-medium mb-1 uppercase tracking-wider">Files Opened</span>
                    <span className="text-2xl font-bold text-emerald-400">{report.filesOpened}</span>
                    <span className="text-[10px] text-neutral-500 mt-1 leading-tight">Opened in period</span>
                  </div>
                  
                  <div className="bg-neutral-950 rounded-lg p-5 border border-neutral-800 flex flex-col justify-center items-center text-center">
                    <span className="text-neutral-400 text-xs font-medium mb-1 uppercase tracking-wider">Leads Created</span>
                    <span className="text-2xl font-bold text-purple-400">{report.leadsCreated}</span>
                    <span className="text-[10px] text-neutral-500 mt-1 leading-tight">Generated by counselor</span>
                  </div>

                  <div className="bg-neutral-950 rounded-lg p-5 border border-neutral-800 flex flex-col justify-center items-center text-center">
                    <span className="text-neutral-400 text-xs font-medium mb-1 uppercase tracking-wider">Active Pipeline</span>
                    <span className="text-2xl font-bold text-white">{report.activePipeline}</span>
                    <span className="text-[10px] text-neutral-500 mt-1 leading-tight">Total currently assigned</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Table Breakdown */}
                  <div className="lg:col-span-1 bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900">
                      <h3 className="font-semibold text-white">Stage Breakdown</h3>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      <table className="w-full text-sm text-left text-neutral-300">
                        <tbody>
                          {report.stageBreakdown
                            .sort((a, b) => b.count - a.count)
                            .map((stage, idx) => (
                            <tr key={stage.stage} className={`border-b border-neutral-800 ${idx % 2 === 0 ? 'bg-neutral-950' : 'bg-neutral-900/50'}`}>
                              <td className="px-4 py-3 font-medium">{stage.stage}</td>
                              <td className="px-4 py-3 text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${stage.count > 0 ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-600'}`}>
                                  {stage.count}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="lg:col-span-2 bg-neutral-950 rounded-lg border border-neutral-800 p-4">
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
