import { getSubscriptionDetails } from '@/app/actions/billing'
import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BillingClient from './BillingClient'

export default async function BillingPage() {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const details = await getSubscriptionDetails()

  if ('error' in details) {
    return (
      <div className="p-8 text-white bg-[#252526] rounded-2xl border border-[#3C3C3C]">
        <p className="text-red-400 font-bold">{details.error}</p>
      </div>
    )
  }

  return (
    <BillingClient
      subscription={details.subscription}
      plans={details.plans}
      paymentMethods={details.paymentMethods}
      payments={details.payments}
      usage={details.usage}
      userRole={details.userRole}
    />
  )
}
