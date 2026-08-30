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
  // 1. Fetch custom stages first to build count queries
  const stages = await getStagesAction()
  const stageListNames = stages.length > 0 ? stages.map(s => s.name) : LEAD_STAGES

  // 2. Build concurrent count queries for precise dashboard stats without hitting data limits
  const leadsCountQuery = supabase
    .from('Lead')
    .select('id', { count: 'exact', head: true })
    .eq('companyId', user.companyId)

  let tasksQuery = supabase
    .from('Task')
    .select('*, lead:Lead(fullName), counselor:User!inner(companyId)')
    .order('dueDate', { ascending: false })
    .limit(10000)

  if (!isAdminOrManager) {
    tasksQuery = tasksQuery.eq('counselorId', user.id)
  } else {
    tasksQuery = tasksQuery.eq('counselor.companyId', user.companyId)
  }

  const ratingKeys = ['5', '4', '3', '2', '1', 'Unrated']
  const ratingQueries = ratingKeys.map(rating => {
    let q = supabase.from('Lead').select('id', { count: 'exact', head: true }).eq('companyId', user.companyId)
    if (rating === '5') q = q.in('rating', ['5', 'Very Good'])
    else if (rating === '4') q = q.in('rating', ['4', 'Good'])
    else if (rating === '3') q = q.in('rating', ['3', 'Moderate'])
    else if (rating === '2') q = q.in('rating', ['2', 'Bad'])
    else if (rating === '1') q = q.in('rating', ['1', '1 Star'])
    else if (rating === 'Unrated') q = q.or('rating.eq.Unrated,rating.is.null,rating.eq.""')
    return q
  })

  const stageQueries = stageListNames.map(stage => {
    let q = supabase.from('Lead').select('id', { count: 'exact', head: true }).eq('companyId', user.companyId)
    if (stage === 'New') {
      q = q.or('stage.eq.New,stage.is.null,stage.eq.""')
    } else {
      q = q.eq('stage', stage)
    }
    return q
  })

  // Execute all queries in parallel
  const allQueries = [leadsCountQuery, tasksQuery, ...ratingQueries, ...stageQueries]
  const results = await Promise.all(allQueries)

  const leadsRes = results[0]
  const tasksRes = results[1]
  const ratingsResults = results.slice(2, 2 + ratingKeys.length)
  const stagesResults = results.slice(2 + ratingKeys.length)

  const totalLeads = leadsRes.count || 0
  const allTasks = tasksRes.data || []
  const pendingCount = allTasks.filter(t => t.status === 'Pending').length

  const ratingsCounts: Record<string, number> = {}
  ratingKeys.forEach((key, idx) => {
    ratingsCounts[key] = ratingsResults[idx].count || 0
  })

  const stagesCounts: Record<string, number> = {}
  stageListNames.forEach((stage, idx) => {
    stagesCounts[stage] = stagesResults[idx].count || 0
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
    ratingKey,
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
        <h2 className="text-2xl font-bold text-white font-display">Overview</h2>
        <p className="text-xs text-gray-400 mt-1">Comprehensive real-time breakdown of student lead pipelines.</p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl p-6 hover:-translate-y-1.5 transition-all duration-300 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400">Total Leads</h3>
            <div className="w-8 h-8 rounded-lg bg-[#0E639C] flex items-center justify-center text-white">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-display mt-4">{totalLeads}</p>
        </div>

        <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl p-6 hover:-translate-y-1.5 transition-all duration-300 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-400">Pipeline Health</h3>
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="text-3xl font-black text-white font-display mt-4">{conversionRate}%</p>
          <p className="text-[10px] text-gray-500 mt-2 font-medium">Ratio of high potential leads (Very Good + Good)</p>
        </div>

        {/* Tasks trigger */}
        <TasksModalClient tasks={allTasks} pendingCount={pendingCount} />
      </div>

      {/* Agenda list for non Super Admins */}
      {user.role !== 'Super Admin' && (
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-8">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#007ACC]" />
            Today's Agenda
          </h3>
          <DashboardTasks tasks={allTasks} />
        </div>
      )}

      {/* Ratings Cards List */}
      <div>
        <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-teal-500" /> Lead Ratings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {ratingsCards.map(rating => (
            <Link key={rating.name} href={`/dashboard/leads?rating=${encodeURIComponent(rating.ratingKey)}`}>
              <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-5 hover:border-[#555555] transition-all flex flex-col justify-between h-28">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">{rating.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full border border-[#252526]" style={{ backgroundColor: rating.color }}></span>
                </div>
                <p className="text-2xl font-black text-white font-display">{rating.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pipeline Snapshot Cards */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
            <BarChart2 className="h-5 w-5 text-[#007ACC]" /> Pipeline Snapshot
          </h3>
          <Link href="/dashboard/pipeline" className="text-xs font-bold text-[#007ACC] hover:underline flex items-center gap-1">
            Open Board →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {stagesCards.map(stage => (
            <Link key={stage.name} href={`/dashboard/pipeline`} className="block group">
              <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-5 hover:border-[#555555] transition-all flex flex-col justify-between h-28">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 truncate pr-2" title={stage.name}>{stage.name}</span>
                  <span className="w-2.5 h-2.5 rounded-full border border-[#252526] shrink-0" style={{ backgroundColor: stage.color }}></span>
                </div>
                <p className="text-2xl font-black text-white font-display">{stage.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts Panel */}
      {totalLeads > 0 && (
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-xl shadow-md p-8">
          <h3 className="text-base font-bold text-white mb-6 font-display">Analytics Charts</h3>
          <DashboardCharts ratingsData={ratingsChartData} stagesData={stagesChartData} />
        </div>
      )}
    </div>
  )
}
