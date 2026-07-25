import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getCompanyChatUsers, getCompanyChannels } from '@/app/actions/chat'
import SecureChatClient from '@/components/SecureChatClient'

export const dynamic = 'force-dynamic'

export default async function SecureChatPage() {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const { users } = await getCompanyChatUsers()
  const { channels } = await getCompanyChannels()

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SecureChatClient
        initialUsers={users || []}
        initialChannels={channels || []}
        currentUser={user}
      />
    </div>
  )
}
