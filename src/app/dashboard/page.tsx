import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { Users, UserCheck, TrendingUp, AlertCircle, Clock, Activity, BarChart2 } from 'lucide-react'
import DashboardTasks from '@/components/DashboardTasks'
import DashboardCharts from '@/components/DashboardCharts'
import TasksModalClient from '@/components/TasksModalClient'
import { LEAD_RATINGS, LEAD_STAGES } from '@/lib/constants'
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
  let leadsQuery = supabase
    .from('Lead')
    .select('rating, stage')
    .eq('companyId', user.companyId)

  // No counselor-level filter: all users in the company see all leads.

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

  // 3. Process Ratings Data in memory
  const ratingsCounts: Record<string, number> = {}
  leadsForStats.forEach(lead => {
    const rating = lead.rating || 'Unrated'
    ratingsCounts[rating] = (ratingsCounts[rating] || 0) + 1
  })

  const ratingsCards = LEAD_RATINGS.map(rating => ({
    name: rating,
    count: ratingsCounts[rating] || 0,
    color: RATING_COLORS[rating] || '#737373'
  }))
  
  const ratingsChartData = ratingsCards.filter(r => r.count > 0).map(r => ({
    name: r.name,
    value: r.count,
    fill: r.color
  }))

  const veryGoodCount = ratingsCounts['Very Good'] || 0
  const goodCount = ratingsCounts['Good'] || 0
  const conversionRate = totalLeads > 0 ? Math.round(((veryGoodCount + goodCount) / totalLeads) * 100) : 0

  // 4. Process Stages Data in memory
  const stagesCounts: Record<string, number> = {}
  leadsForStats.forEach(lead => {
    const stage = lead.stage || 'New'
    stagesCounts[stage] = (stagesCounts[stage] || 0) + 1
  })

  const stagesCards = LEAD_STAGES.map((stage, i) => ({
    name: stage,
    count: stagesCounts[stage] || 0,
    color: STAGE_COLORS[i % STAGE_COLORS.length]
  }))

  const stagesChartData = stagesCards.filter(s => s.count > 0).map(s => ({
    name: s.name,
    value: s.count,
    fill: s.color
  }))

  // 5. Agenda Tasks (Due today or overdue, and Pending)
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)

  const agendaTasks = allTasks
    .filter(t => t.status === 'Pending' && new Date(t.dueDate) <= endOfToday)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
        <p className="text-neutral-400">Comprehensive breakdown of your leads pipeline.</p>
      </div>

      {/* Top Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20 hover:border-neutral-700 transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-400 font-medium">Total Leads</h3>
            <Users className="text-blue-500 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white mt-4">{totalLeads}</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm shadow-black/20 hover:border-neutral-700 transition-all hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-neutral-400 font-medium">Pipeline Health</h3>
            <Activity className="text-indigo-500 h-5 w-5" />
          </div>
          <p className="text-3xl font-bold text-white mt-4">{conversionRate}%</p>
          <p className="text-xs text-indigo-400 mt-1">High potential leads (Very Good + Good)</p>
        </div>

        {/* Pending Tasks Modal Trigger */}
        <TasksModalClient tasks={allTasks} pendingCount={pendingCount} />
      </div>

      {/* Due Tasks - Hidden for Super Admin */}
      {user.role !== 'Super Admin' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-sm shadow-black/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Today's Agenda</h3>
          <DashboardTasks tasks={allTasks} />
        </div>
      )}

      {/* Ratings Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <UserCheck className="h-5 w-5 mr-2 text-emerald-400" /> Lead Ratings
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {ratingsCards.map(rating => (
            <Link key={rating.name} href={`/dashboard/leads?rating=${encodeURIComponent(rating.name)}`}>
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-sm hover:bg-neutral-800 transition-colors h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutral-400">{rating.name}</span>
                  <span className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: rating.color, boxShadow: `0 0 10px ${rating.color}40` }}></span>
                </div>
                <p className="text-2xl font-bold text-white">{rating.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stages Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-purple-400" /> Pipeline Stages
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {stagesCards.map(stage => (
            <Link key={stage.name} href={`/dashboard/leads?stage=${encodeURIComponent(stage.name)}`}>
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 transition-colors flex flex-col justify-between h-24 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ backgroundColor: stage.color }}></div>
                <span className="text-xs font-medium text-neutral-400 line-clamp-2 leading-tight relative z-10 group-hover:text-white transition-colors">{stage.name}</span>
                <div className="flex items-end justify-between mt-2 relative z-10">
                  <p className="text-xl font-bold text-white">{stage.count}</p>
                  <span className="w-1.5 h-1.5 rounded-full mb-1.5 shadow-[0_0_6px_rgba(0,0,0,0.8)]" style={{ backgroundColor: stage.color, boxShadow: `0 0 8px ${stage.color}60` }}></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts */}
      {totalLeads > 0 && (
        <DashboardCharts ratingsData={ratingsChartData} stagesData={stagesChartData} />
      )}
    </div>
  )
}
