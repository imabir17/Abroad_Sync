import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getStagesAction } from '@/app/actions/stages'
import { createClient } from '@/utils/supabase/server'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await getUserSession()
  if (!user || (user.role !== 'Super Admin' && user.role !== 'Manager')) {
    redirect('/dashboard')
  }

  // Fetch customizable pipeline stages
  const stages = await getStagesAction()

  // Fetch company details & activity logs
  const supabase = await createClient()
  const { data: company } = await supabase
    .from('Company')
    .select('id, name, logoUrl')
    .eq('id', user.companyId)
    .single()

  // Fetch active leads' stage distribution to calculate migration targets
  const { data: leads } = await supabase
    .from('Lead')
    .select('stage')
    .eq('companyId', user.companyId)

  // Map stage names to lead counts
  const stageLeadCounts: { [key: string]: number } = {}
  if (leads) {
    leads.forEach((l: { stage: string }) => {
      if (l.stage) {
        stageLeadCounts[l.stage] = (stageLeadCounts[l.stage] || 0) + 1
      }
    })
  }

  // Fetch Company Activity Logs for Super Admin
  let activityLogs: any[] = []
  if (user.role === 'Super Admin') {
    const { data: logs } = await supabase
      .from('ActivityLog')
      .select('*, actor:User!actorId(*)')
      .eq('companyId', user.companyId)
      .order('createdAt', { ascending: false })
      .limit(200)

    activityLogs = logs || []
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">System Settings</h2>
        <p className="text-xs text-gray-400">Manage your agency workspace parameters, customizable stages, and audit logs.</p>
      </div>

      <SettingsClient
        initialStages={stages}
        stageLeadCounts={stageLeadCounts}
        initialCompany={company || { id: user.companyId, name: '', logoUrl: null }}
        activityLogs={activityLogs}
        userRole={user.role}
      />
    </div>
  )
}
