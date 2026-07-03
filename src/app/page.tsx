import { getUserSession } from '@/lib/auth'
import LandingPageClient from './LandingPageClient'

export default async function LandingPage() {
  const user = await getUserSession()
  const isLoggedIn = !!user

  return <LandingPageClient isLoggedIn={isLoggedIn} />
}
