import { getUserSession, PLATFORM_ADMIN_EMAILS } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import SaasAdminClient from './SaasAdminClient'

export const dynamic = 'force-dynamic'

export default async function SaasAdminPage() {
  const user = await getUserSession()
  if (!user) redirect('/login')

  // Verify Platform Owner status
  if (!user.email || !PLATFORM_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    redirect('/dashboard')
  }

  const admin = createAdminClient()

  // Fetch pending payments
  const { data: pendingPayments } = await admin
    .from('Payment')
    .select('*, company:Company(*), plan:Plan(*), submitter:User!submittedById(*)')
    .eq('status', 'pending')
    .order('createdAt', { ascending: true })

  // Fetch recent payments
  const { data: recentPayments } = await admin
    .from('Payment')
    .select('*, company:Company(*), plan:Plan(*), submitter:User!submittedById(*)')
    .neq('status', 'pending')
    .order('createdAt', { ascending: false })
    .limit(50)

  // Fetch all tenant subscriptions
  const { data: subscriptions } = await admin
    .from('Subscription')
    .select('*, company:Company(*), plan:Plan(*), branch:Branch(*)')
    .order('createdAt', { ascending: false })

  // Fetch payment receiving configurations
  const { data: paymentConfigs } = await admin
    .from('PaymentMethodConfig')
    .select('*')
    .order('method', { ascending: true })

  // Fetch all companies for tenant directory with seat/lead metrics
  const { data: companies } = await admin
    .from('Company')
    .select('*')
    .order('name', { ascending: true })

  // Fetch primary Super Admin user / email for each company
  const { data: superAdmins } = await admin
    .from('User')
    .select('id, email, fullName, companyId')
    .eq('role', 'Super Admin')

  const tenantSuperAdminMap: Record<string, { email: string; fullName: string }> = {}
  if (superAdmins) {
    superAdmins.forEach((u) => {
      if (u.companyId) {
        tenantSuperAdminMap[u.companyId] = {
          email: u.email,
          fullName: u.fullName || u.email,
        }
      }
    })
  }

  // Fetch staff count & monthly leads for each company in parallel
  const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const tenantMetricsMap: Record<string, { activeUsers: number; monthlyLeads: number }> = {}

  if (companies && companies.length > 0) {
    await Promise.all(
      companies.map(async (comp) => {
        const [usersRes, leadsRes] = await Promise.all([
          admin.from('User').select('*', { count: 'exact', head: true }).eq('companyId', comp.id).eq('status', 'Active'),
          admin.from('Lead').select('*', { count: 'exact', head: true }).eq('companyId', comp.id).gte('createdAt', firstOfMonth),
        ])
        tenantMetricsMap[comp.id] = {
          activeUsers: usersRes.count ?? 0,
          monthlyLeads: leadsRes.count ?? 0,
        }
      })
    )
  }

  // Fetch plans
  const { data: plans } = await admin
    .from('Plan')
    .select('*')
    .order('priceUsd', { ascending: true })

  // Fetch Platform Audit Logs
  const { data: auditLogs } = await admin
    .from('SaasAdminAuditLog')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(100)

  // Fetch Coupons
  const { data: coupons } = await admin
    .from('Coupon')
    .select('*')
    .order('createdAt', { ascending: false })

  // Fetch Cron Logs
  const { data: cronLogs } = await admin
    .from('CronLog')
    .select('*')
    .order('executedAt', { ascending: false })
    .limit(50)

  return (
    <SaasAdminClient
      pendingPayments={pendingPayments || []}
      recentPayments={recentPayments || []}
      subscriptions={subscriptions || []}
      paymentConfigs={paymentConfigs || []}
      companies={companies || []}
      tenantMetricsMap={tenantMetricsMap}
      tenantSuperAdminMap={tenantSuperAdminMap}
      plans={plans || []}
      auditLogs={auditLogs || []}
      coupons={coupons || []}
      cronLogs={cronLogs || []}
    />
  )
}
