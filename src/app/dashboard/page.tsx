import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { Users, UserCheck, TrendingUp, AlertCircle, Clock, Activity, BarChart2 } from 'lucide-react'
import DashboardTasks from '@/components/DashboardTasks'
import DashboardCharts from '@/components/DashboardCharts'
import TasksModalClient from '@/components/TasksModalClient'
import { LEAD_RATINGS, LEAD_STAGES } from '@/lib/constants'
import { getStagesAction } from '@/app/actions/stages'
import Link from 'next/link'

// Pre-defined colors for ratings and stages for consistent UI
const RATING_COLORS: Record<string, string> = {
  'Very Good': '#10b981', // emerald-500
  'Good': '#3b82f6',      // blue-500
  'Moderate': '#f59e0b',  // amber-500
  'Bad': '#ef4444',       // red-500
  'Unrated': '#737373',   // neutral-500
}

const STAGE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
]

export default async function DashboardPage() {
  const user = await getUserSession()
  if (!user) return null

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'
  const supabase = await createClient()

  // 1. Fetch leads for statistics (calculating count and groupings in memory to save network overhead)
  const leadsQuery = supabase
    .from('Lead')
    .select('rating, stage')
    .eq('companyId', user.companyId)

  // 2. Fetch tasks concurrently
  let tasksQuery = supabase
    .from('Task')
    .select('*, lead:Lead(fullName), counselor:User!inner(companyId)')
    .order('dueDate', { ascending: false })

  if (!isAdminOrManager) {
    tasksQuery = tasksQuery.eq('counselorId', user.id)
  } else {
    tasksQuery = tasksQuery.eq('counselor.companyId', user.companyId)
  }

  const [leadsRes, tasksRes] = await Promise.all([leadsQuery, tasksQuery])

  const leadsForStats = leadsRes.data || []
  const allTasks = tasksRes.data || []

  const totalLeads = leadsForStats.length
  const pendingCount = allTasks.filter(t => t.status === 'Pending').length

  // 3. Process Ratings Data in memory (handling legacy and star ratings)
  const ratingsCounts: Record<string, number> = {}
  leadsForStats.forEach(lead => {
    const ratingStr = lead.rating || 'Unrated'
    let ratingVal = 'Unrated'
    if (ratingStr === 'Very Good') ratingVal = '5'
    else if (ratingStr === 'Good') ratingVal = '4'
    else if (ratingStr === 'Moderate') ratingVal = '3'
    else if (ratingStr === 'Bad') ratingVal = '2'
    else if (['1', '2', '3', '4', '5'].includes(ratingStr)) ratingVal = ratingStr
    
    ratingsCounts[ratingVal] = (ratingsCounts[ratingVal] || 0) + 1
  })

  const RATING_LABELS: Record<string, string> = {
    '5': '5 Stars',
    '4': '4 Stars',
    '3': '3 Stars',
    '2': '2 Stars',
    '1': '1 Star',
    'Unrated': 'Unrated'
  }

  const RATING_COLORS_NEW: Record<string, string> = {
    '5': '#10b981',
    '4': '#3b82f6',
    '3': '#f59e0b',
    '2': '#ef4444',
    '1': '#f43f5e',
    'Unrated': '#737373'
  }

  const ratingsCards = ['5', '4', '3', '2', '1', 'Unrated'].map(ratingKey => ({
    name: RATING_LABELS[ratingKey],
    count: ratingsCounts[ratingKey] || 0,
    color: RATING_COLORS_NEW[ratingKey] || '#737373'
  }))
  
  const ratingsChartData = ratingsCards.filter(r => r.count > 0).map(r => ({
    name: r.name,
    value: r.count,
    fill: r.color
  }))

  const veryGoodCount = ratingsCounts['5'] || 0
  const goodCount = ratingsCounts['4'] || 0
  const conversionRate = totalLeads > 0 ? Math.round(((veryGoodCount + goodCount) / totalLeads) * 100) : 0

  // 4. Fetch custom stages and process in memory
  const stages = await getStagesAction()
  const stageListNames = stages.length > 0 ? stages.map(s => s.name) : LEAD_STAGES

  const stagesCounts: Record<string, number> = {}
  leadsForStats.forEach(lead => {
    const stage = lead.stage || 'New'
    stagesCounts[stage] = (stagesCounts[stage] || 0) + 1
  })

  const stagesCards = stageListNames.map((stage, i) => ({
    name: stage,
    count: stagesCounts[stage] || 0,
    color: STAGE_COLORS[i % STAGE_COLORS.length]
  }))

  const stagesChartData = stagesCards.filter(s => s.count > 0).map(s => ({
    name: s.name,
    value: s.count,
    fill: s.color
  }))

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-[#202638] font-display">Overview</h2>
        <p className="text-xs text-[#5C6478] mt-1">Comprehensive real-time breakdown of student lead pipelines.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="neo-raised p-6 hover:-translate-y-1.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#5C6478]">Total Leads</h3>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6E79F2] to-[#333FC2] shadow-[3px_3px_6px_#AEB9C9,-3px_3px_6px_#FFFFFF] flex items-center justify-center text-white">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#202638] font-display mt-4">{totalLeads}</p>
        </div>

        <div className="neo-raised p-6 hover:-translate-y-1.5 transition-all duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#5C6478]">Pipeline Health</h3>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3FC7CE] to-[#0F8A94] shadow-[3px_3px_6px_#AEB9C9,-3px_3px_6px_#FFFFFF] flex items-center justify-center text-white">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-3xl font-black text-[#202638] font-display mt-4">{conversionRate}%</p>
          <p className="text-[10px] text-[#8891A3] mt-2 font-medium">Ratio of high potential leads (Very Good + Good)</p>
        </div>

        {/* Tasks trigger */}
        <TasksModalClient tasks={allTasks} pendingCount={pendingCount} />
      </div>

      {/* Agenda list for non Super Admins */}
      {user.role !== 'Super Admin' && (
        <div className="neo-raised p-8">
          <h3 className="text-base font-bold text-[#202638] mb-6 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#FF7A52]" />
            Today's Agenda
          </h3>
          <DashboardTasks tasks={allTasks} />
        </div>
      )}

      {/* Ratings Cards List */}
      <div>
        <h3 className="text-base font-bold text-[#202638] mb-5 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-[#21C285]" /> Lead Ratings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {ratingsCards.map(rating => (
            <Link key={rating.name} href={`/dashboard/leads?rating=${encodeURIComponent(rating.name)}`}>
              <div className="neo-raised p-5 hover:shadow-[inset_3px_3px_6px_#AEB9C9,inset_-3px_-3px_6px_#FFFFFF] transition-all flex flex-col justify-between h-28">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5C6478]">{rating.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: rating.color, boxShadow: `0 0 10px ${rating.color}40` }}></span>
                </div>
                <p className="text-2xl font-black text-[#202638] font-display">{rating.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pipeline Snapshot Funnel */}
      <div className="neo-raised p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-[#202638] flex items-center gap-2 font-display">
            <BarChart2 className="h-5 w-5 text-[#4855E4]" /> Pipeline Snapshot
          </h3>
          <Link href="/dashboard/pipeline" className="text-xs font-bold text-[#4855E4] hover:underline flex items-center gap-1">
            Open Board →
          </Link>
        </div>
        <div className="space-y-5">
          {stagesCards.map(stage => {
            const percentage = totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0
            return (
              <Link key={stage.name} href={`/dashboard/pipeline`} className="block group">
                <div className="flex items-center gap-4">
                  <span className="w-24 text-xs font-bold text-[#5C6478] group-hover:text-[#202638] transition-colors truncate">{stage.name}</span>
                  <div className="flex-1 h-3.5 bg-[#E7ECF3] shadow-[inset_2px_2px_4px_#AEB9C9,inset_-2px_-2px_4px_#FFFFFF] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-105" 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: stage.color,
                        boxShadow: `0 0 8px ${stage.color}40`
                      }}
                    ></div>
                  </div>
                  <span className="w-10 text-right text-xs font-bold text-[#202638]">{stage.count}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Charts Panel */}
      {totalLeads > 0 && (
        <div className="neo-raised p-8">
          <h3 className="text-base font-bold text-[#202638] mb-6 font-display">Analytics Charts</h3>
          <DashboardCharts ratingsData={ratingsChartData} stagesData={stagesChartData} />
        </div>
      )}
    </div>
  )
}
