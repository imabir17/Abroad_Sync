import { getUserSession } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import LandingPageClient from './LandingPageClient'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const user = await getUserSession()
  const isLoggedIn = !!user

  const admin = createAdminClient()
  const { data: plans } = await admin
    .from('Plan')
    .select('*')
    .eq('isActive', true)
    .eq('isPublic', true)
    .order('priceUsd', { ascending: true })

  return <LandingPageClient isLoggedIn={isLoggedIn} plans={plans || []} />
}
