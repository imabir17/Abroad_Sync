import { getUserSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import SaasAdminClient from './SaasAdminClient'

export default async function SaasAdminPage() {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // Fetch pending payments with explicit FK join
  const { data: pendingPayments, error: pendingErr } = await admin
    .from('Payment')
    .select('*, company:Company(*), plan:Plan(*), submitter:User!submittedById(*)')
    .eq('status', 'pending')
    .order('createdAt', { ascending: true })

  if (pendingErr) {
    console.error('SaasAdminPage pendingPayments error:', pendingErr)
  }

  // Fetch recent processed payments with explicit FK join
  const { data: recentPayments, error: recentErr } = await admin
    .from('Payment')
    .select('*, company:Company(*), plan:Plan(*), submitter:User!submittedById(*)')
    .neq('status', 'pending')
    .order('createdAt', { ascending: false })
    .limit(20)

  if (recentErr) {
    console.error('SaasAdminPage recentPayments error:', recentErr)
  }

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
