import { getUserSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import SaasAdminClient from './SaasAdminClient'

export default async function SaasAdminPage() {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch pending payments
  const { data: pendingPayments } = await admin
    .from('Payment')
    .select('*, company:Company(*), plan:Plan(*), submitter:User(*)')
    .eq('status', 'pending')
    .order('createdAt', { ascending: true })

  // Fetch recent processed payments
  const { data: recentPayments } = await admin
    .from('Payment')
    .select('*, company:Company(*), plan:Plan(*)')
    .neq('status', 'pending')
    .order('createdAt', { ascending: false })
    .limit(20)

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

  return (
    <SaasAdminClient
      pendingPayments={pendingPayments || []}
      recentPayments={recentPayments || []}
      subscriptions={subscriptions || []}
      paymentConfigs={paymentConfigs || []}
    />
  )
}
